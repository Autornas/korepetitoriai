/** @type {import('next').NextConfig} */

/**
 * Supabase origin, derived from the public URL so this works on every
 * deployment without a second env var. The browser talks to it directly for
 * auth, for the avatars bucket, and over a websocket for the lesson room, so
 * all three have to be named in the CSP.
 */
function supabaseOrigins() {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) {
    // No env at build time (e.g. `next build` in CI without secrets). Fall back
    // to the project-scoped Supabase wildcard rather than emitting a CSP that
    // would break auth at runtime.
    return ['https://*.supabase.co', 'wss://*.supabase.co'];
  }
  try {
    const { origin, host } = new URL(raw);
    return [origin, `wss://${host}`];
  } catch {
    return ['https://*.supabase.co', 'wss://*.supabase.co'];
  }
}

const [supabaseHttp, supabaseWs] = supabaseOrigins();

const isDev = process.env.NODE_ENV === 'development';

/**
 * Content Security Policy.
 *
 * `script-src` carries 'unsafe-inline' and that is a deliberate, documented
 * choice, not an oversight. Every page in this app except /lessons/[id]/call is
 * statically prerendered, and Next.js can only inject a CSP nonce during
 * server-side rendering — a prerendered page has no request to take a nonce
 * from (see node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md,
 * "How nonces work in Next.js"). A nonce policy here would block Next's own
 * hydration scripts and leave a dead app. Going nonce-based means forcing every
 * route to dynamic rendering, which is a rendering-architecture decision rather
 * than a security fix, so it is left alone.
 *
 * What this policy still buys, with no nonce:
 *   - `connect-src` pins network egress to our own origin and Supabase, so a
 *     script that did somehow run cannot ship data to an attacker's host
 *   - `img-src` blocks an arbitrary external `photo_url` from turning a profile
 *     view into a third-party tracking beacon (the DB trigger in
 *     security_hardening_2.sql is the other half of that fix)
 *   - `object-src 'none'` and `base-uri 'self'` close the plugin and
 *     <base href> injection routes
 *   - `form-action 'self'` stops a credential form from being retargeted
 *   - `frame-ancestors 'none'` is the clickjacking control (X-Frame-Options is
 *     sent too, for older browsers that ignore this directive)
 *
 * `style-src` allows 'unsafe-inline' because the app uses React `style={{…}}`
 * attributes and a couple of inline <style> blocks for keyframes. Inline style
 * is not a script-execution vector here.
 *
 * `blob:` appears in `worker-src`/`img-src`/`media-src` for Excalidraw's
 * workers and the WebRTC video element.
 *
 * Development needs two extra allowances, and only development gets them:
 *
 *   - `'unsafe-eval'`: React calls eval() in dev for debugging features such as
 *     reconstructing a callstack from another environment. Without it the dev
 *     build logs "eval() is not supported in this environment" and the page
 *     does not come up. React never uses eval() in a production build, so this
 *     must not leak into the production policy.
 *   - `ws:` on localhost: Turbopack's HMR socket. Same-origin ws: is covered by
 *     `'self'` in current browsers, but naming it explicitly avoids a dead
 *     reload loop in the ones where it is not.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${supabaseHttp}`,
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseHttp} ${supabaseWs}` +
    (isDev ? ' ws://localhost:* ws://127.0.0.1:*' : ''),
  "media-src 'self' blob: mediastream:",
  "worker-src 'self' blob:",
  "frame-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  // HSTS: two years, subdomains included. Harmless on localhost (browsers do
  // not apply HSTS to http://localhost).
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  // Lesson ids and profile ids sit in URLs, so never leak a full path
  // cross-origin — that was one of the ways a lesson-room channel name could
  // have escaped before it was HMAC'd.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Camera and microphone stay allowed: the lesson room needs both. Everything
  // else the platform offers is switched off.
  {
    key: 'Permissions-Policy',
    value: 'camera=(self), microphone=(self), display-capture=(self), geolocation=(), payment=(), usb=()',
  },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
];

const nextConfig = {
  reactCompiler: true,

  // Don't advertise the framework and its version.
  poweredByHeader: false,

  async headers() {
    return [
      {
        // Every route, including /api. `headers()` matches before the
        // filesystem, so this covers pages, route handlers and /public alike.
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
