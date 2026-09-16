import { withRoute } from '@/server/handler';
import { ok } from '@/server/response';
import { requireUser } from '@/server/session';
import { badRequest } from '@/server/errors';
import { parseParams, uuid, z } from '@/server/validate';
import { getBoardFiles, uploadBoardFile } from '@/server/services/boards';
import { rateLimit } from '@/server/ratelimit';

export const dynamic = 'force-dynamic';

const paramsSchema = z.object({ id: uuid });

export const GET = withRoute(async (_request, ctx) => {
  const session = await requireUser();
  const { id } = await parseParams(ctx, paramsSchema);
  return ok(await getBoardFiles(session, id));
});

export const POST = withRoute(async (request, ctx) => {
  const session = await requireUser();
  const { id } = await parseParams(ctx, paramsSchema);

  rateLimit({
    key: `board-file:${session.user.id}`,
    limit: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many image uploads. Please try again later.',
  });

  let form;
  try {
    form = await request.formData();
  } catch {
    throw badRequest('Expected a multipart form upload.');
  }

  return ok(await uploadBoardFile(session, id, form.get('fileId'), form.get('file')));
});
