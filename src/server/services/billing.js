import { getAdminSupabase, hasServiceRole } from '@/lib/supabase/admin';
import { fromSupabaseError, notImplemented } from '../errors';

/**
 * The one account students pay into.
 *
 * Payment used to go to whichever teacher taught the lesson, using an IBAN
 * they typed into their own profile. It now goes to a single platform account
 * that only an administrator can change, so who taught the lesson no longer
 * decides where the money lands.
 *
 * Reading is open to any signed-in user — it is a payee address printed on
 * every payment instruction, not a secret. Writing has no path at all through
 * a user's JWT: `platform_billing` grants `authenticated` nothing but SELECT,
 * so the service-role client below is the only writer, and `requireAdmin`
 * guards the route in front of it.
 */

const BILLING_FIELDS = 'iban, holder, bank_name, note, updated_at';

/** Payment details to show a student. Readable by any signed-in user. */
export async function getPlatformBilling({ supabase }) {
  const { data, error } = await supabase
    .from('platform_billing')
    .select(BILLING_FIELDS)
    .maybeSingle();

  if (error) throw fromSupabaseError(error, 'Could not load payment details.');

  // The migration seeds an empty row, but a project migrated out of order
  // might not have one. An unconfigured account is a normal state the UI
  // renders as "not set up yet", not an error.
  return data ?? { iban: null, holder: null, bank_name: null, note: null, updated_at: null };
}

/** Admin-only. Callers must have passed `requireAdmin` first. */
export async function updatePlatformBilling({ user }, patch) {
  if (!hasServiceRole()) {
    throw notImplemented('Editing payment details requires SUPABASE_SERVICE_ROLE_KEY to be configured.');
  }

  const admin = getAdminSupabase();
  const { data, error } = await admin
    .from('platform_billing')
    .upsert(
      {
        id: true,
        ...patch,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      },
      { onConflict: 'id' },
    )
    .select(BILLING_FIELDS)
    .maybeSingle();

  if (error) throw fromSupabaseError(error, 'Could not save payment details.');
  return data;
}
