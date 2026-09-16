import { withRoute } from '@/server/handler';
import { ok } from '@/server/response';
import { requireAdmin } from '@/server/session';
import { parseBody, z } from '@/server/validate';
import { getPlatformBilling, updatePlatformBilling } from '@/server/services/billing';

export const dynamic = 'force-dynamic';

/**
 * Admin-only edit of the platform payout account.
 *
 * The IBAN is stripped of spaces and upper-cased so the value students are
 * asked to copy is stable no matter how it was typed. It is deliberately not
 * checksum-validated: rejecting a valid but unusual account number would be
 * worse than accepting a typo an admin can see and fix on the same screen.
 */
const billingSchema = z
  .object({
    iban: z
      .string()
      .trim()
      .max(42)
      .transform((v) => v.replace(/\s+/g, '').toUpperCase())
      .nullable(),
    holder: z.string().trim().max(160).nullable(),
    bank_name: z.string().trim().max(160).nullable(),
    note: z.string().trim().max(500).nullable(),
  })
  .partial();

export const GET = withRoute(async () => {
  const ctx = await requireAdmin();
  return ok(await getPlatformBilling(ctx));
});

export const PATCH = withRoute(async (request) => {
  const ctx = await requireAdmin();
  const patch = await parseBody(request, billingSchema);
  return ok(await updatePlatformBilling(ctx, patch));
});
