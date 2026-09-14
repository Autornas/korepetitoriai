import { withRoute } from '@/server/handler';
import { created } from '@/server/response';
import { requireAdmin } from '@/server/session';
import { parseBody, z } from '@/server/validate';
import { inviteTeacher } from '@/server/services/admin';
import { rateLimit } from '@/server/ratelimit';

export const dynamic = 'force-dynamic';

const inviteSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(120),
  email: z.string().trim().email('Enter a valid email address.').max(255),
});

/**
 * Admin-only: invite a teacher by email.
 *
 * Teacher accounts can no longer be self-registered (see
 * app/api/auth/register/route.js and app/auth/callback/route.js) — this is
 * now the only way one gets created.
 */
export const POST = withRoute(async (request) => {
  const ctx = await requireAdmin();

  // This one sends mail on someone else's behalf through the service-role key.
  // Even with the allowlist in front of it, cap it so a compromised admin
  // session cannot be used as a mail relay.
  rateLimit({
    key: `invite:${ctx.user.id}`,
    limit: 20,
    windowMs: 60 * 60 * 1000,
    message: 'Too many invites sent. Please try again later.',
  });

  const { name, email } = await parseBody(request, inviteSchema);
  const result = await inviteTeacher({ email, name });
  return created(result);
});
