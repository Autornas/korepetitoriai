import { withRoute } from '@/server/handler';
import { created, ok } from '@/server/response';
import { requireProfile, requireRole } from '@/server/session';
import { parseBody, uuid, isoDate, isoTime, z } from '@/server/validate';
import { listMyLessons, scheduleLessonAsTeacher } from '@/server/services/lessons';

export const dynamic = 'force-dynamic';

/**
 * One shape now. Students no longer book lessons — an admin assigns a student
 * to a teacher and the teacher schedules the lessons — so the `{ teacherId }`
 * variant this endpoint used to accept is gone.
 *
 * `status` is still never taken from the request body; the service sets it.
 * `price` is what the teacher charges for this particular lesson, and is the
 * number their earnings are summed from. Omitting it is allowed and shows up
 * on the dashboard as an unpriced lesson rather than silently counting as €0.
 */
const createLessonSchema = z.object({
  studentId: uuid,
  date: isoDate,
  time: isoTime,
  subject: z.string().trim().max(120).nullish(),
  notes: z.string().trim().max(2000).nullish(),
  price: z.number().min(0).max(10000).nullish(),
});

export const GET = withRoute(async () => {
  const ctx = await requireProfile();
  return ok(await listMyLessons(ctx));
});

export const POST = withRoute(async (request) => {
  const ctx = await requireRole('teacher');
  const input = await parseBody(request, createLessonSchema);
  return created(await scheduleLessonAsTeacher(ctx, input));
});
