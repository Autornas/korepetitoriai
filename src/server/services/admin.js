import { getAdminSupabase, hasServiceRole } from '@/lib/supabase/admin';
import { serverEnv } from '@/lib/env';
import { badRequest, notImplemented, ApiError } from '../errors';

/**
 * Invite a teacher by email.
 *
 * Uses Supabase's admin `inviteUserByEmail`, which creates the `auth.users`
 * row and emails the invitee a link to set their own password — the admin
 * never sees or chooses a password. `raw_user_meta_data.role = 'teacher'`
 * rides along so `handle_new_user` (db/migrations/profiles.sql) creates the
 * profile with the right role the moment the row exists, same as a normal
 * sign-up.
 *
 * `redirectTo` must be an explicit, absolute URL: left unset, Supabase
 * falls back to the dashboard's "Site URL" (see auth/url-configuration),
 * which is whatever was typed in there last — a dev's localhost, in this
 * project's case, until SITE_URL was added. It also only takes effect if
 * that exact origin is on the project's Redirect URLs allow list.
 */
export async function inviteTeacher({ email, name }) {
  if (!hasServiceRole()) {
    throw notImplemented('Teacher invites require SUPABASE_SERVICE_ROLE_KEY to be configured.');
  }
  if (!serverEnv.siteUrl) {
    throw notImplemented('Teacher invites require SITE_URL to be configured.');
  }

  const admin = getAdminSupabase();
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: name, role: 'teacher' },
    redirectTo: `${serverEnv.siteUrl}/auth/callback?next=%2Fset-password`,
  });

  if (error) {
    if (/already.*(registered|exists)/i.test(error.message)) {
      throw badRequest('That email address is already registered.');
    }
    throw new ApiError(400, 'invite_failed', error.message);
  }

  return { userId: data.user?.id ?? null, email };
}
