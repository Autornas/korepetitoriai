import { apiGet, apiPut, apiUpload } from './client';

/** Saved board: `{ elements, updatedAt, files: { [fileId]: { url, mimeType } } }`. */
export function getBoard(lessonId, options) {
  return apiGet(`/api/lessons/${lessonId}/board`, options);
}

export function saveBoard(lessonId, elements, options) {
  return apiPut(`/api/lessons/${lessonId}/board`, { elements }, options);
}

export function getBoardFiles(lessonId, options) {
  return apiGet(`/api/lessons/${lessonId}/board/files`, options);
}

export function uploadBoardFile(lessonId, fileId, blob) {
  const form = new FormData();
  form.append('fileId', fileId);
  form.append('file', blob);
  return apiUpload(`/api/lessons/${lessonId}/board/files`, form);
}
