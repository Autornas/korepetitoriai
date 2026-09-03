import { createServerSupabase } from '@/lib/supabase/server';
import { serverEnv } from '@/lib/env';
import { unauthorized, forbidden, serviceUnavailable } from './errors';

/**
 * Resolve the caller from the request cookies.
 *
 * `getUser()` — not `getSession()` — because it revalidates the JWT against
 * Supabase Auth. `getSession()` trusts whatever is in the cookie, which is
 * fine in the browser but is not an authentication check on the server.
 *
 * @returns {Promise<{ user, supabase }>}
 */
export async function requireUser() {
  const supabase = await createServerSupabase();
  if (!supabase) throw serviceUnavailable('Supabase is not configured.');

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) throw unauthorized();

  return { user: data.user, supabase };
}

/** Same, but also loads the caller's profile row (role lives there). */
export async function requireProfile() {
  const { user, supabase } = await requireUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, name')
    .eq('id', user.id)
    .maybeSingle();

  return { user, supabase, profile: profile ?? null };
}

/** Require one of `roles`. Role is read from the DB, never from the client. */
export async function requireRole(roles) {
  const allowed = Array.isArray(roles) ? roles : [roles];
  const ctx = await requireProfile();

  if (!ctx.profile?.role || !allowed.includes(ctx.profile.role)) {
    throw forbidden(`This action requires the ${allowed.join(' or ')} role.`);
  }
  return ctx;
}

/**
 * Require the caller's email to be on the ADMIN_EMAILS allowlist.
 *
 * Deliberately not a `profiles.role` value: an admin flag stored in the app's
 * own database could be flipped by anything that can write to that table.
 * The allowlist lives only in server env, so granting it requires a deploy.
 */
export async function requireAdmin() {
  const ctx = await requireUser();
  const email = ctx.user.email?.toLowerCase() ?? '';
  if (!email || !serverEnv.adminEmails.includes(email)) {
    throw forbidden('This action is restricted to administrators.');
  }
  return ctx;
}
