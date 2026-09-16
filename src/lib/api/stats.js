import { apiGet } from './client';

/** The signed-in teacher's own lessons, earnings and rating. */
export function getMyStats(options) {
  return apiGet('/api/stats/me', options);
}

/** Admin-only: the same numbers for every teacher. */
export function listTeacherStats(options) {
  return apiGet('/api/admin/stats', options);
}
