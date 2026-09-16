import { withRoute } from '@/server/handler';
import { ok } from '@/server/response';
import { requireUser } from '@/server/session';
import { badRequest, payloadTooLarge } from '@/server/errors';
import { parseParams, uuid, z } from '@/server/validate';
import { getBoard, saveBoard } from '@/server/services/boards';
import { rateLimit } from '@/server/ratelimit';

export const dynamic = 'force-dynamic';

const MAX_BODY_CHARS = 5 * 1024 * 1024;

const paramsSchema = z.object({ id: uuid });
const boardSchema = z.object({
  elements: z.array(z.record(z.string(), z.unknown())).max(20000),
});

export const GET = withRoute(async (_request, ctx) => {
  const session = await requireUser();
  const { id } = await parseParams(ctx, paramsSchema);
  return ok(await getBoard(session, id));
});

export const PUT = withRoute(async (request, ctx) => {
  const session = await requireUser();
  const { id } = await parseParams(ctx, paramsSchema);

  rateLimit({
    key: `board:${session.user.id}`,
    limit: 150,
    windowMs: 60 * 1000,
    message: 'The board is saving too often. Please slow down.',
  });

  const text = await request.text();
  if (text.length > MAX_BODY_CHARS) throw payloadTooLarge('The board is too large to save.');

  let raw;
  try {
    raw = JSON.parse(text);
  } catch {
    throw badRequest('Request body must be valid JSON.');
  }

  const { elements } = boardSchema.parse(raw);
  return ok(await saveBoard(session, id, elements));
});
