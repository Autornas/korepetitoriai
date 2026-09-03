import { apiPost } from './client';

/** Admin-only: invite a teacher by email. Server rejects non-admins with 403. */
export async function inviteTeacher({ name, email }) {
  return apiPost('/api/admin/teachers', { name, email });
}
