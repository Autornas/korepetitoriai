import { withRoute } from '@/server/handler';
import { ok } from '@/server/response';
import { requireUser } from '@/server/session';
import { parseBody, parseParams, uuid, z } from '@/server/validate';
import { rateLesson, getLessonRating } from '@/server/services/ratings';
import { clientIp, rateLimit } from '@/server/ratelimit';

export const dynamic = 'force-dynamic';

const paramsSchema = z.object({ id: uuid });

const ratingSchema = z.object({
  stars: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).nullish(),
});

/** The rating on this lesson, plus whether the caller may write one. */
export const GET = withRoute(async (_request, ctx) => {
  const session = await requireUser();
  const { id } = await parseParams(ctx, paramsSchema);
  return ok(await getLessonRating(session, id));
});

/**
 * Student rates a lesson they attended.
 *
 * PUT rather than POST: `lesson_id` is the rating's primary key, so sending it
 * twice replaces the student's own rating instead of stacking a second one.
 *
 * Rate-limited per user because the free-text comment is stored and later
 * shown to the teacher — without a cap, re-sending it is an unbounded write
 * loop against a row anyone on the lesson can read.
 */
export const PUT = withRoute(async (request, ctx) => {
  const session = await requireUser();
  const { id } = await parseParams(ctx, paramsSchema);

  rateLimit({
    key: `rate:${session.user.id ?? clientIp(request)}`,
    limit: 30,
    windowMs: 60 * 60 * 1000,
    message: 'Too many rating changes. Please try again later.',
  });

  const input = await parseBody(request, ratingSchema);
  return ok(await rateLesson(session, id, input));
});
