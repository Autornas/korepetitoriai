import { withRoute } from '@/server/handler';
import { ok } from '@/server/response';
import { requireAdmin } from '@/server/session';
import { listTeacherStats } from '@/server/services/stats';

export const dynamic = 'force-dynamic';

/**
 * Every teacher's dashboard, for an administrator.
 *
 * `requireAdmin` is the whole gate: the service that backs this reads across
 * all teachers through the service-role key, because the database has no admin
 * role to authorise it with — admin identity lives in the ADMIN_EMAILS server
 * env, so it cannot be granted by anything the app itself writes.
 */
export const GET = withRoute(async () => {
  await requireAdmin();
  return ok(await listTeacherStats());
});
