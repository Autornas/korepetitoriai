import { withRoute } from '@/server/handler';
import { created, ok } from '@/server/response';
import { requireAdmin } from '@/server/session';
import { parseBody, uuid, z } from '@/server/validate';
import {
  assignStudent,
  listAssignments,
  unassignStudent,
} from '@/server/services/assignments';

export const dynamic = 'force-dynamic';

const pairSchema = z.object({ teacherId: uuid, studentId: uuid });

/**
 * Admin-only: which students each teacher may teach.
 *
 * This pairing is what authorises a teacher to put a lesson on a student's
 * calendar without the student confirming it, so it is the most privileged
 * write in the app after the teacher invite. Like that one, it runs on the
 * service-role key behind `requireAdmin`, and no user JWT can write the table
 * directly.
 */
export const GET = withRoute(async () => {
  await requireAdmin();
  return ok(await listAssignments());
});

export const POST = withRoute(async (request) => {
  await requireAdmin();
  const input = await parseBody(request, pairSchema);
  return created(await assignStudent(input));
});

export const DELETE = withRoute(async (request) => {
  await requireAdmin();
  const input = await parseBody(request, pairSchema);
  return ok(await unassignStudent(input));
});
