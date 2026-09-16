import { getAdminSupabase, hasServiceRole } from '@/lib/supabase/admin';
import { fromSupabaseError, notImplemented } from '../errors';
import { isLessonTaught, isLessonUpcoming } from './schedule';

/**
 * Teacher earnings and rating.
 *
 * Two callers, one rule set:
 *   - a teacher asking about themselves, on their own JWT (RLS already limits
 *     them to their own lessons and the ratings written about them);
 *   - an admin asking about everyone, through the service-role key behind
 *     requireAdmin — the database has no admin concept to authorise that with,
 *     the same reason teacher invites work this way.
 *
 * The aggregation is deliberately in JS rather than SQL. "Taught" means
 * `accepted` and finished, and finished depends on a timezone the columns do
 * not carry (see ./schedule.js); doing it here keeps one definition instead of
 * a JS one and a SQL one that drift. At this platform's size — a handful of
 * teachers, lessons in the hundreds — pulling the rows costs nothing. If that
 * changes, the replacement is a materialised per-teacher rollup, and this
 * module is the only thing that has to know.
 */

/** Columns the aggregate actually needs. Nothing about the student leaks in. */
const STAT_LESSON_FIELDS = 'id, teacher_id, date, time, status, price, paid_at';

function toAmount(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** Cents, so summing prices cannot accumulate float drift. */
function round2(value) {
  return Math.round(value * 100) / 100;
}

/**
 * Fold lessons and ratings into one teacher's numbers.
 *
 * @param {object[]} lessons  Lesson rows for this teacher.
 * @param {object[]} ratings  Rating rows about this teacher.
 */
export function summariseTeacher(lessons, ratings, now = Date.now()) {
  let taught = 0;
  let upcoming = 0;
  let cancelled = 0;
  let earned = 0;
  let received = 0;
  let unpriced = 0;

  for (const lesson of lessons) {
    if (lesson.status === 'rejected') {
      cancelled += 1;
      continue;
    }
    if (isLessonUpcoming(lesson, now)) {
      upcoming += 1;
      continue;
    }
    if (!isLessonTaught(lesson, now)) continue;

    taught += 1;
    if (lesson.price == null) {
      // Lessons created before pricing existed, so the earnings total is a
      // floor rather than the truth. The dashboard says so rather than
      // quietly under-reporting.
      unpriced += 1;
      continue;
    }
    const price = toAmount(lesson.price);
    earned += price;
    if (lesson.paid_at) received += price;
  }

  const stars = ratings.map((r) => Number(r.stars)).filter(Number.isFinite);
  const average = stars.length
    ? Math.round((stars.reduce((a, b) => a + b, 0) / stars.length) * 10) / 10
    : null;

  return {
    lessons: { taught, upcoming, cancelled, unpriced },
    earnings: {
      earned: round2(earned),
      received: round2(received),
      outstanding: round2(earned - received),
      currency: 'EUR',
    },
    rating: { average, count: stars.length },
  };
}

/** The signed-in teacher's own numbers, on their own JWT. */
export async function getMyTeacherStats({ supabase, user }) {
  const [{ data: lessons, error: lessonError }, { data: ratings, error: ratingError }] =
    await Promise.all([
      supabase.from('lessons').select(STAT_LESSON_FIELDS).eq('teacher_id', user.id),
      supabase
        .from('lesson_ratings')
        .select('lesson_id, stars, comment, created_at')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false }),
    ]);

  if (lessonError) throw fromSupabaseError(lessonError, 'Could not load your lessons.');
  if (ratingError) throw fromSupabaseError(ratingError, 'Could not load your ratings.');

  const summary = summariseTeacher(lessons ?? [], ratings ?? []);

  return {
    ...summary,
    // The few most recent comments, so the number has something behind it.
    //
    // Not anonymous, and it cannot be: a lesson has exactly one student, so
    // the teacher knows who wrote any rating the moment they see which lesson
    // it belongs to. Dropping `student_id` from this payload would only look
    // like anonymity while `lesson_id` still identifies them -- and the
    // teacher can read the rating row directly anyway. The rating form tells
    // the student their tutor will see it, which is the honest version of the
    // same thing.
    recentFeedback: (ratings ?? [])
      .filter((r) => r.comment)
      .slice(0, 5)
      .map((r) => ({
        lesson_id: r.lesson_id,
        stars: r.stars,
        comment: r.comment,
        created_at: r.created_at,
      })),
  };
}

/**
 * Every teacher's numbers, for the admin overview.
 *
 * Service-role: it reads across all teachers, which no user JWT may do.
 * `requireAdmin` in the route is the only thing standing in front of it.
 */
export async function listTeacherStats() {
  if (!hasServiceRole()) {
    throw notImplemented('The admin overview requires SUPABASE_SERVICE_ROLE_KEY to be configured.');
  }
  const admin = getAdminSupabase();

  const [teachersResult, lessonsResult, ratingsResult] = await Promise.all([
    admin
      .from('profiles')
      .select('id, name, email, photo_url, headline, subjects, availability, price_60')
      .eq('role', 'teacher')
      .order('name', { ascending: true }),
    admin.from('lessons').select(STAT_LESSON_FIELDS),
    admin.from('lesson_ratings').select('teacher_id, stars'),
  ]);

  for (const result of [teachersResult, lessonsResult, ratingsResult]) {
    if (result.error) throw fromSupabaseError(result.error, 'Could not load the overview.');
  }

  const lessonsByTeacher = groupBy(lessonsResult.data ?? [], (l) => l.teacher_id);
  const ratingsByTeacher = groupBy(ratingsResult.data ?? [], (r) => r.teacher_id);

  const now = Date.now();
  return (teachersResult.data ?? []).map((teacher) => ({
    id: teacher.id,
    name: teacher.name,
    email: teacher.email,
    photo_url: teacher.photo_url,
    headline: teacher.headline,
    subjects: teacher.subjects ?? [],
    // Teachers already mark their free hours on the profile availability grid;
    // the admin overview surfaces it so a slot can be agreed without asking.
    availability: teacher.availability ?? [],
    price_60: teacher.price_60,
    ...summariseTeacher(
      lessonsByTeacher.get(teacher.id) ?? [],
      ratingsByTeacher.get(teacher.id) ?? [],
      now,
    ),
  }));
}

function groupBy(rows, keyOf) {
  const out = new Map();
  for (const row of rows) {
    const key = keyOf(row);
    const bucket = out.get(key);
    if (bucket) bucket.push(row);
    else out.set(key, [row]);
  }
  return out;
}
