import { withRoute } from '@/server/handler';
import { ok } from '@/server/response';
import { requireUser } from '@/server/session';
import { badRequest } from '@/server/errors';
import { uploadAvatar } from '@/server/services/storage';
import { rateLimit } from '@/server/ratelimit';

export const dynamic = 'force-dynamic';

/**
 * Multipart upload. Size, declared MIME type and magic bytes are all checked
 * server-side before anything reaches the public avatars bucket.
 */
export const POST = withRoute(async (request) => {
  const ctx = await requireUser();

  // Each upload costs a 2 MB read plus bucket storage, and the path is fixed
  // per user, so there is no legitimate reason to do this often.
  rateLimit({
    key: `avatar:${ctx.user.id}`,
    limit: 10,
    windowMs: 60 * 60 * 1000,
    message: 'Too many image uploads. Please try again later.',
  });

  let form;
  try {
    form = await request.formData();
  } catch {
    throw badRequest('Expected a multipart form upload.');
  }

  const file = form.get('file');
  return ok(await uploadAvatar(ctx, file));
});
