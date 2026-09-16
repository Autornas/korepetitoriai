import { getAdminSupabase, hasServiceRole } from '@/lib/supabase/admin';
import { badRequest, fromSupabaseError, notImplemented } from '../errors';

/**
 * Which students a teacher is allowed to teach.
 *
 * This replaces the student-initiated booking request. Previously a student
 * found a tutor in a public directory and sent a request, and the acceptance
 * handshake was what established consent on both sides. Now an administrator
 * pairs the two, and that pairing is the consent — which is why a lesson can
 * be created already `accepted` without reopening the hole that
 * security_hardening.sql closed. A teacher cannot reach a student an admin has
 * not given them, and cannot write this table at all: `teacher_students`
 * grants `authenticated` nothing but SELECT on its own rows.
 */

function requireServiceRole() {
  if (!hasServiceRole()) {
    throw notImplemented('Managing assignments requires SUPABASE_SERVICE_ROLE_KEY to be configured.');
  }
  return getAdminSupabase();
}

/** Every pairing, plus both directories, for the admin screen. */
export async function listAssignments() {
  const admin = requireServiceRole();

  const [linksResult, peopleResult] = await Promise.all([
    admin.from('teacher_students').select('teacher_id, student_id, created_at'),
    admin
      .from('profiles')
      .select('id, role, name, email, photo_url, grade')
      .in('role', ['teacher', 'student'])
      .order('name', { ascending: true }),
  ]);

  if (linksResult.error) throw fromSupabaseError(linksResult.error, 'Could not load assignments.');
  if (peopleResult.error) throw fromSupabaseError(peopleResult.error, 'Could not load people.');

  const people = peopleResult.data ?? [];
  return {
    assignments: linksResult.data ?? [],
    teachers: people.filter((p) => p.role === 'teacher'),
    students: people.filter((p) => p.role === 'student'),
  };
}

/** Pair a teacher with a student. Idempotent — re-assigning is not an error. */
export async function assignStudent({ teacherId, studentId }) {
  const admin = requireServiceRole();
  if (teacherId === studentId) throw badRequest('A user cannot be assigned to themselves.');

  await assertRole(admin, teacherId, 'teacher');
  await assertRole(admin, studentId, 'student');

  const { data, error } = await admin
    .from('teacher_students')
    .upsert({ teacher_id: teacherId, student_id: studentId }, { onConflict: 'teacher_id,student_id' })
    .select('teacher_id, student_id, created_at')
    .maybeSingle();

  if (error) throw fromSupabaseError(error, 'Could not assign that student.');
  return data;
}

/**
 * Unpair them.
 *
 * Existing lessons are left alone on purpose. They are history — taught,
 * earned, possibly rated — and deleting them to tidy up an assignment would
 * silently rewrite a teacher's earnings. Removing the pairing stops new
 * lessons from being created, which is all it should do.
 */
export async function unassignStudent({ teacherId, studentId }) {
  const admin = requireServiceRole();

  const { error } = await admin
    .from('teacher_students')
    .delete()
    .eq('teacher_id', teacherId)
    .eq('student_id', studentId);

  if (error) throw fromSupabaseError(error, 'Could not remove that assignment.');
  return { teacherId, studentId };
}

async function assertRole(admin, id, role) {
  const { data } = await admin.from('profiles').select('id, role').eq('id', id).maybeSingle();
  if (!data || data.role !== role) throw badRequest(`That ${role} does not exist.`);
  return data;
}
