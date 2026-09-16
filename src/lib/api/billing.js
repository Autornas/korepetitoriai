import { apiGet, apiPatch } from './client';

/** The account students transfer to. Readable by any signed-in user. */
export function getBilling(options) {
  return apiGet('/api/billing', options);
}

/** Admin-only. The server rejects non-admins with 403. */
export function saveBilling(patch) {
  return apiPatch('/api/admin/billing', patch);
}
