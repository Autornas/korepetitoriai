import { withRoute } from '@/server/handler';
import { ok } from '@/server/response';
import { requireUser } from '@/server/session';
import { parseParams, uuid, z } from '@/server/validate';
import { getLesson } from '@/server/services/lessons';
import { getCounterpartDetails } from '@/server/services/profiles';

export const dynamic = 'force-dynamic';

const paramsSchema = z.object({ id: uuid });

/**
 * Contact details for the other party on one lesson.
 *
 * This is the only path that releases phone, email or the student's learning
 * notes, and it does so per lesson after confirming the caller is on it. Lists
 * never carry them.
 *
 * It no longer carries a payout IBAN: payment goes to one platform account
 * (/api/billing), so the teacher's personal bank details are not something the
 * student needs and are no longer returned at all.
 */
export const GET = withRoute(async (_request, ctx) => {
  const session = await requireUser();
  const { id } = await parseParams(ctx, paramsSchema);
  const lesson = await getLesson(session, id);
  return ok(await getCounterpartDetails(session, lesson));
});
