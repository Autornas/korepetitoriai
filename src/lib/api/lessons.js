import { apiGet, apiPatch, apiPost, apiPut } from './client';

/**
 * One list endpoint for both roles — the server picks the right column from
 * the caller's profile, so the client no longer decides whose lessons it is
 * asking for.
 */
export function listMyLessons(options) {
  return apiGet('/api/lessons', options);
}

export function getLesson(lessonId, options) {
  return apiGet(`/api/lessons/${lessonId}`, options);
}

/**
 * Tutor -> an assigned student. Created `accepted`: the admin-made pairing is
 * the consent, so there is no acceptance step left for the student.
 */
export function scheduleLesson({ studentId, date, time, subject, notes, price }) {
  return apiPost('/api/lessons', { studentId, date, time, subject, notes, price });
}

export const acceptLesson = (id) => apiPatch(`/api/lessons/${id}`, { action: 'accept' });
export const rejectLesson = (id) => apiPatch(`/api/lessons/${id}`, { action: 'reject' });
export const cancelLesson = (id) => apiPatch(`/api/lessons/${id}`, { action: 'cancel' });
export const markLessonPaid = (id) => apiPatch(`/api/lessons/${id}`, { action: 'markPaid' });

/** Contact details for the other party — fetched per lesson, on demand. */
export function getLessonCounterpart(lessonId, options) {
  return apiGet(`/api/lessons/${lessonId}/counterpart`, options);
}

/** The rating on a lesson, and whether the caller may leave one. */
export function getLessonRating(lessonId, options) {
  return apiGet(`/api/lessons/${lessonId}/rating`, options);
}

/** Student rates a finished lesson. Re-sending replaces their own rating. */
export function rateLesson(lessonId, { stars, comment }) {
  return apiPut(`/api/lessons/${lessonId}/rating`, { stars, comment });
}

/** Server decides whether the room may be opened right now. */
export function getRoomAccess(lessonId, options) {
  return apiGet(`/api/lessons/${lessonId}/access`, options);
}

/** Ask the server to create the Calendar event and store the Meet link. */
export function createMeetLink(lessonId, googleAccessToken) {
  return apiPost(`/api/lessons/${lessonId}/meet`, { googleAccessToken });
}
