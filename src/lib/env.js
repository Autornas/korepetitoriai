/**
 * Centralised environment access.
 *
 * Two audiences:
 *  - `publicEnv` is safe for the browser bundle (NEXT_PUBLIC_* only).
 *  - `serverEnv` must only ever be imported from server code. Importing it
 *    into a client component will throw at module-eval time rather than
 *    silently shipping a secret to the browser.
 */

function read(name) {
  const value = process.env[name];
  return typeof value === 'string' && value.length > 0 ? value : null;
}

/** Normalises an already-resolved value the same way `read` does. */
function clean(value) {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

// `publicEnv` ships in the browser bundle, where there is no real
// `process.env` — the build inlines it by statically replacing each literal
// `process.env.NEXT_PUBLIC_*` expression it finds in the source. That only
// works for a literal member access; `process.env[name]` behind a variable
// (what `read` does, fine for server-only code below) is invisible to that
// static pass and silently resolves to nothing in the browser. So these two
// have to be spelled out, not built through `read`.
export const publicEnv = {
  supabaseUrl: clean(process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
};

export const isSupabaseConfigured = Boolean(
  publicEnv.supabaseUrl && publicEnv.supabaseAnonKey,
);

/** Throws if `serverEnv` is reached from a browser bundle. */
function assertServerOnly() {
  if (typeof window !== 'undefined') {
    throw new Error(
      'src/lib/env.js: serverEnv was imported into client code. ' +
        'Service-role credentials must never reach the browser.',
    );
  }
}

export const serverEnv = {
  get serviceRoleKey() {
    assertServerOnly();
    return read('SUPABASE_SERVICE_ROLE_KEY');
  },
  /** Signing key for lesson-room realtime channel names. See services/lessons.js. */
  get lessonRoomSecret() {
    assertServerOnly();
    return read('LESSON_ROOM_SECRET');
  },
  /**
   * Emails allowed to invite teacher accounts (see session.js requireAdmin
   * and services/admin.js). Comma-separated; not a DB role because there are
   * only ever a couple of these people and they should not be revocable by
   * anything the app itself writes to.
   */
  get adminEmails() {
    assertServerOnly();
    const raw = read('ADMIN_EMAILS');
    return raw ? raw.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean) : [];
  },
};

/**
 * Whether privileged (RLS-bypassing) operations are available. The app is
 * designed to degrade gracefully: without the key, endpoints that need it
 * return a clear 501 instead of silently leaking or crashing.
 */
export function hasServiceRole() {
  assertServerOnly();
  return Boolean(read('SUPABASE_SERVICE_ROLE_KEY'));
}
