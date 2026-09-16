import { apiDelete, apiGet, apiPost } from './client';

/** Admin-only: invite a teacher by email. Server rejects non-admins with 403. */
export async function inviteTeacher({ name, email }) {
  return apiPost('/api/admin/teachers', { name, email });
}

/** Admin-only: every teacher-student pairing, plus both directories. */
export function listAssignments(options) {
  return apiGet('/api/admin/assignments', options);
}

/** Admin-only: let this teacher schedule lessons with this student. */
export function assignStudent({ teacherId, studentId }) {
  return apiPost('/api/admin/assignments', { teacherId, studentId });
}

/**
 * Admin-only: stop this teacher from scheduling new lessons with this student.
 * Lessons already taught are left untouched -- they are what the teacher's
 * earnings are made of.
 */
export function unassignStudent({ teacherId, studentId }) {
  return apiDelete('/api/admin/assignments', { body: { teacherId, studentId } });
}
