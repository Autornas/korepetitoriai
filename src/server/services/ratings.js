import { badRequest, forbidden, fromSupabaseError } from '../errors';
import { getLesson } from './lessons';
import { isLessonTaught } from './schedule';

const RATING_FIELDS = 'lesson_id, student_id, teacher_id, stars, comment, created_at, updated_at';

/**
 * Lesson ratings.
 *
 * Who may write one is decided in three places on purpose: here (so the user
 * gets a readable message), in the RLS policy, and in the `lesson_ended`
 * predicate the policy calls. Reaching either of the latter two means this
 * layer was bypassed — the anon key ships in the browser bundle, so PostgREST
 * is directly reachable.
 */

/** The rating on a lesson, if one exists. Visible to both participants. */
export async function getLessonRating(ctx, lessonId) {
  const lesson = await getLesson(ctx, lessonId);

  const { data, error } = await ctx.supabase
    .from('lesson_ratings')
    .select(RATING_FIELDS)
    .eq('lesson_id', lesson.id)
    .maybeSingle();

  if (error) throw fromSupabaseError(error, 'Could not load the rating.');

  return {
    rating: data ?? null,
    // So the client knows whether to offer the form without re-deriving the
    // window itself.
    canRate: ctx.user.id === lesson.student_id && isLessonTaught(lesson),
  };
}

/**
 * Student rates a lesson they attended. Re-rating replaces their own rating
 * rather than adding a second one — `lesson_id` is the primary key.
 */
export async function rateLesson(ctx, lessonId, { stars, comment }) {
  const { supabase, user } = ctx;
  const lesson = await getLesson(ctx, lessonId);

  if (lesson.student_id !== user.id) {
    throw forbidden('Only the student on this lesson can rate it.');
  }
  if (lesson.status !== 'accepted') {
    throw badRequest('Only a lesson that went ahead can be rated.');
  }
  if (!isLessonTaught(lesson)) {
    throw badRequest('You can rate this lesson once it has finished.');
  }

  const now = new Date().toISOString();

  // Deliberately not `upsert`. PostgREST compiles an upsert into
  // `ON CONFLICT DO UPDATE SET <every column sent>`, which needs UPDATE
  // privilege on `lesson_id`, `student_id` and `teacher_id` too — and those
  // are outside the update grant precisely so a rating cannot be moved onto a
  // different lesson or teacher. Widening the grant to make one call work
  // would trade the guarantee for a round trip. Insert or update explicitly
  // instead.
  const { data: existing } = await supabase
    .from('lesson_ratings')
    .select('lesson_id')
    .eq('lesson_id', lesson.id)
    .maybeSingle();

  if (existing) return updateRating(supabase, lesson.id, { stars, comment, now });

  const { data, error } = await supabase
    .from('lesson_ratings')
    .insert({
      lesson_id: lesson.id,
      student_id: user.id,
      // Taken from the lesson row, never from the request: a student must not
      // be able to attach their rating to a different teacher.
      teacher_id: lesson.teacher_id,
      stars,
      comment: comment ?? null,
      updated_at: now,
    })
    .select(RATING_FIELDS)
    .maybeSingle();

  // Two submissions racing for the first rating: the primary key rejects the
  // loser, which simply means the row exists now — update it rather than
  // reporting a conflict the student cannot act on.
  if (error?.code === '23505') {
    return updateRating(supabase, lesson.id, { stars, comment, now });
  }
  if (error) throw fromSupabaseError(error, 'Could not save your rating.');
  if (!data) throw forbidden('You may not rate this lesson.');
  return data;
}

async function updateRating(supabase, lessonId, { stars, comment, now }) {
  const { data, error } = await supabase
    .from('lesson_ratings')
    .update({ stars, comment: comment ?? null, updated_at: now })
    .eq('lesson_id', lessonId)
    .select(RATING_FIELDS)
    .maybeSingle();

  if (error) throw fromSupabaseError(error, 'Could not save your rating.');
  // RLS limits the update to the student who wrote it, so an empty result
  // means the caller is not that student.
  if (!data) throw forbidden('You may not change this rating.');
  return data;
}
