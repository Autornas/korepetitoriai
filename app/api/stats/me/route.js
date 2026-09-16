import { withRoute } from '@/server/handler';
import { ok } from '@/server/response';
import { requireRole } from '@/server/session';
import { getMyTeacherStats } from '@/server/services/stats';

export const dynamic = 'force-dynamic';

/**
 * The signed-in teacher's own dashboard numbers.
 *
 * Teacher-only: a student has no earnings, and `requireRole` reads the role
 * from the database rather than from anything the client sends.
 */
export const GET = withRoute(async () => {
  const ctx = await requireRole('teacher');
  return ok(await getMyTeacherStats(ctx));
});
