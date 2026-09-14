import { tooManyRequests } from './errors';

/**
 * Fixed-window rate limiting for the endpoints where repetition is the attack.
 *
 * Scope and honest limitations:
 *
 *   - State lives in this process's memory. One instance, one set of counters.
 *     On a platform that runs several instances (or scales to zero between
 *     requests) the effective limit is per instance, not global. That still
 *     turns "unbounded" into "bounded per instance", which is what matters for
 *     sign-up spam, avatar-upload floods and message flooding.
 *   - It is not a defence against a distributed attacker. If this app ever
 *     needs that, the counters belong in Postgres or an edge KV store and this
 *     module becomes the place to swap the backend — the call sites do not
 *     change.
 *   - Supabase Auth applies its own limits to sign-in and email sending. The
 *     limits here cover our own routes, which Supabase knows nothing about.
 */

/** key -> { count, resetAt } */
const windows = new Map();

/** Stop the Map growing without bound in a long-lived process. */
const SWEEP_EVERY = 500;
let writesSinceSweep = 0;

function sweep(now) {
  for (const [key, window] of windows) {
    if (window.resetAt <= now) windows.delete(key);
  }
}

/**
 * Consume one unit against `key`. Throws a 429 ApiError once `limit` requests
 * have been seen inside `windowMs`.
 *
 * @param {object} options
 * @param {string} options.key      Bucket identity, e.g. `register:203.0.113.4`.
 * @param {number} options.limit    Requests allowed per window.
 * @param {number} options.windowMs Window length in milliseconds.
 * @param {string} [options.message] Client-facing message.
 */
export function rateLimit({ key, limit, windowMs, message }) {
  const now = Date.now();

  if (++writesSinceSweep >= SWEEP_EVERY) {
    writesSinceSweep = 0;
    sweep(now);
  }

  const existing = windows.get(key);

  if (!existing || existing.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  existing.count += 1;
  if (existing.count > limit) {
    const retryInSec = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    throw tooManyRequests(
      message ?? `Too many requests. Try again in ${retryInSec} seconds.`,
    );
  }
}

/**
 * Best-effort client address, for limiting routes that run before there is a
 * signed-in user to key on.
 *
 * `x-forwarded-for` is client-controllable in general; behind a proxy that
 * rewrites it (Vercel, Cloudflare, most managed hosts) the left-most entry is
 * the real peer. A client that forges it only ever shifts itself into a
 * different bucket, so the worst case is that it evades its own limit — never
 * that it exhausts somebody else's. `unknown` keeps every unidentifiable
 * caller in one shared bucket, deliberately.
 */
export function clientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return request.headers.get('x-real-ip')?.trim() || 'unknown';
}
