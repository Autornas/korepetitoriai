import { createHmac } from 'node:crypto';
import { badRequest, forbidden, fromSupabaseError, notFound, serviceUnavailable } from '../errors';
import { serverEnv } from '@/lib/env';
import { getAdminSupabase } from '@/lib/supabase/admin';
import { PUBLIC_PROFILE_FIELDS } from './profiles';
import { LESSON_DURATION_MS, isSchedulable, lessonStartMs } from './schedule';

const LESSON_FIELDS =
  'id, student_id, teacher_id, created_by, date, time, subject, notes, status, meet_link, payment_code, paid_at, price, created_at, updated_at';

/** Join window, enforced server-side rather than trusted from the UI. */
export const JOIN_OPENS_BEFORE_MS = 15 * 60 * 1000;
export const JOIN_CLOSES_AFTER_MS = LESSON_DURATION_MS;

export async function listMyLessons({ supabase, user, profile }) {
  const column = profile?.role === 'teacher' ? 'teacher_id' : 'student_id';

  const { data, error } = await supabase
    .from('lessons')
    .select(LESSON_FIELDS)
    .eq(column, user.id)
    .order('date', { ascending: true })
    .order('time', { ascending: true });

  if (error) throw fromSupabaseError(error, 'Could not load lessons.');
  return attachCounterpartCards(supabase, data ?? [], user.id);
}

/**
 * Attach a *public* card for the other party on each lesson.
 *
 * The old `attachProfiles` pulled phone, IBAN, grade and learning struggles
 * into every list response. Lists now carry only what the list renders;
 * contact details are fetched per lesson, on demand, by an endpoint that
 * checks participation first.
 */
async function attachCounterpartCards(supabase, lessons, userId) {
  if (lessons.length === 0) return [];

  const ids = [
    ...new Set(
      lessons.map((l) => (l.student_id === userId ? l.teacher_id : l.student_id)),
    ),
  ];

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select(PUBLIC_PROFILE_FIELDS)
    .in('id', ids);

  if (error) throw fromSupabaseError(error, 'Could not load lesson partners.');

  const byId = new Map((profiles ?? []).map((p) => [p.id, p]));
  return lessons.map((lesson) => {
    const isStudent = lesson.student_id === userId;
    const counterpart =
      byId.get(isStudent ? lesson.teacher_id : lesson.student_id) ?? null;
    return {
      ...lesson,
      perspective: isStudent ? 'student' : 'teacher',
      counterpart,
      // Kept so the existing feature components keep rendering unchanged.
      teacher: isStudent ? counterpart : null,
      student: isStudent ? null : counterpart,
    };
  });
}

export async function getLesson({ supabase, user }, lessonId) {
  const { data, error } = await supabase
    .from('lessons')
    .select(LESSON_FIELDS)
    .eq('id', lessonId)
    .maybeSingle();

  if (error) throw fromSupabaseError(error, 'Could not load the lesson.');
  if (!data) throw notFound('Lesson not found.');

  if (data.student_id !== user.id && data.teacher_id !== user.id) {
    // Same 404 as a missing row: never confirm that the id exists.
    throw notFound('Lesson not found.');
  }
  return data;
}

/**
 * Teacher schedules a lesson with any student.
 *
 * The only way a lesson gets created. It lands `accepted`: teacher accounts
 * exist only by admin invite, so a teacher is trusted to book any student.
 *
 * `price` is what this lesson is worth to the teacher. It is written once and
 * is immutable afterwards (column GRANT plus `lessons_guard_update`), because
 * earnings are summed from it and a mutable price would rewrite both the
 * teacher's history and what the student was told to pay.
 */
export async function scheduleLessonAsTeacher({ supabase, user }, input) {
  const student = await requireProfileRole(supabase, input.studentId, 'student');
  if (student.id === user.id) throw badRequest('You cannot book yourself.');

  // A lesson is created `accepted` and priced, and a past-dated one counts as
  // taught the moment it exists -- so an unbounded date is a way to fabricate
  // earnings, not just a tidiness problem.
  if (!isSchedulable(input.date, input.time)) {
    throw badRequest(
      'Pick a date within the last 30 days or the next two years.',
    );
  }

  // Service role: the checks above (plus requireRole('teacher') in the route) are the
  // authorisation, so the insert does not depend on the DB policy being migrated.
  const db = getAdminSupabase() ?? supabase;
  const { data, error } = await db
    .from('lessons')
    .insert({
      student_id: student.id,
      teacher_id: user.id,
      created_by: user.id,
      date: input.date,
      time: input.time,
      subject: input.subject ?? null,
      notes: input.notes ?? null,
      price: input.price ?? null,
      status: 'accepted',
    })
    .select(LESSON_FIELDS)
    .single();

  if (error) {
    console.error('scheduleLessonAsTeacher failed', error.code, error.message);
    throw fromSupabaseError(error, 'Could not schedule the lesson.');
  }
  return data;
}

/**
 * Status transitions.
 *
 * New lessons are created `accepted`, so in practice the only move left is
 * either party cancelling (-> rejected). A cancelled lesson is excluded from
 * earnings and cannot be rated, which is also how a reschedule is expressed:
 * cancel the old row and create a new one.
 *
 * The accept/reject handling below is kept for `pending` rows written before
 * students stopped booking their own lessons, so those can still be resolved.
 */
export async function updateLessonStatus(ctx, lessonId, nextStatus) {
  const { supabase, user } = ctx;
  const lesson = await getLesson(ctx, lessonId);

  if (lesson.status === nextStatus) return lesson;
  if (lesson.status !== 'pending' && nextStatus !== 'rejected') {
    throw badRequest('Only a pending lesson can change to that status.');
  }

  const onLesson = lesson.teacher_id === user.id || lesson.student_id === user.id;
  if (!onLesson) throw forbidden('You are not on this lesson.');

  // Whoever proposed the lesson cannot also accept it — that would let a
  // student skip the tutor's approval, and a tutor book a student without
  // consent. Either side may reject or cancel.
  if (nextStatus === 'accepted' && lesson.created_by === user.id) {
    throw forbidden('The other party has to accept this lesson.');
  }

  const { data, error } = await supabase
    .from('lessons')
    .update({ status: nextStatus, updated_at: new Date().toISOString() })
    .eq('id', lessonId)
    .select(LESSON_FIELDS)
    .maybeSingle();

  if (error) throw fromSupabaseError(error, 'Could not update the lesson.');
  if (!data) throw forbidden('You may not change this lesson.');
  return data;
}

/** Only the teacher may confirm they received the bank transfer. */
export async function markLessonPaid(ctx, lessonId) {
  const { supabase, user } = ctx;
  const lesson = await getLesson(ctx, lessonId);

  if (lesson.teacher_id !== user.id) {
    throw forbidden('Only the teacher can confirm payment.');
  }
  if (lesson.status !== 'accepted') {
    throw badRequest('Only an accepted lesson can be marked paid.');
  }
  if (lesson.paid_at) return lesson;

  const { data, error } = await supabase
    .from('lessons')
    .update({
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', lessonId)
    .select(LESSON_FIELDS)
    .maybeSingle();

  if (error) throw fromSupabaseError(error, 'Could not confirm payment.');
  return data;
}

/** Store the Google Meet link created when the lesson was booked. */
export async function setLessonMeetLink(ctx, lessonId, meetLink) {
  const { supabase } = ctx;
  await getLesson(ctx, lessonId);

  const { data, error } = await supabase
    .from('lessons')
    .update({ meet_link: meetLink, updated_at: new Date().toISOString() })
    .eq('id', lessonId)
    .select(LESSON_FIELDS)
    .maybeSingle();

  if (error) throw fromSupabaseError(error, 'Could not save the meeting link.');
  if (!data) throw forbidden('You may not change this lesson.');
  return data;
}

/**
 * Derive an unguessable Supabase Realtime channel name for a lesson room.
 *
 * The room's WebRTC signalling and whiteboard channels cannot be made
 * `private: true` yet — that needs RLS policies on `realtime.messages` that
 * this project cannot install (see realtime_lesson_rooms.sql). Until then,
 * anyone who can name the channel can subscribe to it.
 *
 * The lesson's own id alone is a bad channel name for that reason: it is the
 * same id that sits in the room's own URL (`/lessons/<id>/call`), so it is
 * whatever browser history, a referer header, or a pasted link would expose.
 * Appending an HMAC of it, keyed by a server-only secret, breaks that link —
 * knowing the lesson id is no longer enough to construct the channel name,
 * because the digest cannot be computed without the secret. It only ever
 * reaches a client through this authorised endpoint.
 *
 * The lesson id stays in the topic *next to* the digest on purpose, so
 * `lesson_id_from_topic` (realtime_lesson_rooms.sql) can resolve a topic back
 * to a lesson and check participation in SQL once those policies can be
 * installed. A digest-only topic matched nothing, which would have made part 2
 * of that migration deny every subscribe.
 *
 * Still not access control on its own: whoever holds the resulting string can
 * join until those policies exist. This narrows *how* that string can leak, it
 * does not remove the possibility.
 */
function deriveRoomChannel(lessonId, kind) {
  const secret = serverEnv.lessonRoomSecret;
  if (!secret) throw serviceUnavailable('Lesson room signalling is not configured.');

  const digest = createHmac('sha256', secret).update(`${kind}:${lessonId}`).digest('hex');
  return `lesson-${kind}:${lessonId}.${digest.slice(0, 32)}`;
}

/**
 * Authoritative answer to "may I open the lesson room right now?".
 *
 * The UI still renders a countdown, but the decision is made here, so
 * navigating straight to /lessons/<id>/call outside the window gets nothing.
 */
export async function getRoomAccess(ctx, lessonId) {
  const lesson = await getLesson(ctx, lessonId);
  // Wall-clock columns resolved in the lesson timezone, not the server's --
  // see ./schedule.js. On a UTC container the old local-time parse put the
  // start two or three hours late, so the join window opened after the lesson
  // had already finished.
  const startMs = lessonStartMs(lesson.date, lesson.time);
  const diff = startMs - Date.now();

  let reason = null;
  if (lesson.status === 'rejected') reason = 'rejected';
  else if (lesson.status !== 'accepted') reason = 'not_accepted';
  else if (diff > JOIN_OPENS_BEFORE_MS) reason = 'too_early';
  else if (diff < -JOIN_CLOSES_AFTER_MS) reason = 'ended';

  const allowed = reason === null;

  return {
    allowed,
    reason,
    startsInMs: diff,
    // Only handed out once the caller is actually allowed to join.
    channels: allowed
      ? { call: deriveRoomChannel(lesson.id, 'call'), board: deriveRoomChannel(lesson.id, 'board') }
      : null,
    lesson: {
      id: lesson.id,
      subject: lesson.subject,
      date: lesson.date,
      time: lesson.time,
      status: lesson.status,
      student_id: lesson.student_id,
      teacher_id: lesson.teacher_id,
    },
  };
}

async function requireProfileRole(supabase, id, role) {
  const { data } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', id)
    .maybeSingle();

  if (!data || data.role !== role) {
    throw badRequest(`That ${role} does not exist.`);
  }
  return data;
}

export { LESSON_FIELDS };
