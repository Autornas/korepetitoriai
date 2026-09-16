import { withRoute } from '@/server/handler';
import { ok } from '@/server/response';
import { requireUser } from '@/server/session';
import { getPlatformBilling } from '@/server/services/billing';

export const dynamic = 'force-dynamic';

/**
 * The account a lesson is paid into.
 *
 * One account for the whole platform now, rather than the teacher's own IBAN,
 * so every payment instruction a student sees comes from here. Readable by any
 * signed-in user; only an admin can change it (PATCH /api/admin/billing).
 */
export const GET = withRoute(async () => {
  const ctx = await requireUser();
  return ok(await getPlatformBilling(ctx));
});
