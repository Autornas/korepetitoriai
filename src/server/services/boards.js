import { getAdminSupabase } from '@/lib/supabase/admin';
import { badRequest, fromSupabaseError, payloadTooLarge, serviceUnavailable } from '../errors';
import { getLesson } from './lessons';
import { detectImageType } from './storage';

/**
 * Saved lesson whiteboards and their images.
 *
 * Tables and bucket grant `authenticated` nothing, so every read and write goes
 * through the service role — and only after getLesson() has confirmed, on the
 * caller's own JWT, that they are on this lesson.
 */

const BUCKET = 'lesson-files';
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const SIGNED_URL_SECONDS = 60 * 60;
const FILE_ID = /^[A-Za-z0-9_-]{1,100}$/;

const EXTENSIONS = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif'],
]);
const TYPES_BY_EXTENSION = new Map([...EXTENSIONS].map(([type, ext]) => [ext, type]));

function adminClient() {
  const admin = getAdminSupabase();
  if (!admin) throw serviceUnavailable('The whiteboard requires SUPABASE_SERVICE_ROLE_KEY.');
  return admin;
}

export async function getBoard(ctx, lessonId) {
  await getLesson(ctx, lessonId);
  const admin = adminClient();

  const { data, error } = await admin
    .from('lesson_boards')
    .select('elements, updated_at')
    .eq('lesson_id', lessonId)
    .maybeSingle();

  if (error) throw fromSupabaseError(error, 'Could not load the board.');

  return {
    elements: data?.elements ?? [],
    updatedAt: data?.updated_at ?? null,
    files: await listFiles(admin, lessonId),
  };
}

export async function saveBoard(ctx, lessonId, elements) {
  await getLesson(ctx, lessonId);

  const { error } = await adminClient()
    .from('lesson_boards')
    .upsert({
      lesson_id: lessonId,
      elements,
      updated_at: new Date().toISOString(),
      updated_by: ctx.user.id,
    });

  if (error) {
    console.error('saveBoard failed', error.code, error.message);
    throw fromSupabaseError(error, 'Could not save the board.');
  }
  return { saved: true };
}

export async function getBoardFiles(ctx, lessonId) {
  await getLesson(ctx, lessonId);
  return listFiles(adminClient(), lessonId);
}

export async function uploadBoardFile(ctx, lessonId, fileId, file) {
  await getLesson(ctx, lessonId);

  if (typeof fileId !== 'string' || !FILE_ID.test(fileId)) throw badRequest('Invalid file id.');
  if (!file || typeof file.arrayBuffer !== 'function') throw badRequest('No file was uploaded.');
  if (file.size > MAX_FILE_BYTES) throw payloadTooLarge('Image must be 10 MB or smaller.');

  const buffer = Buffer.from(await file.arrayBuffer());
  const type = detectImageType(buffer);
  if (!type || !EXTENSIONS.has(type)) {
    throw badRequest('Image must be a JPEG, PNG, WebP or GIF file.');
  }

  const admin = adminClient();
  const path = `${lessonId}/${fileId}.${EXTENSIONS.get(type)}`;

  const { error } = await admin.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: type, upsert: true, cacheControl: '3600' });

  if (error) {
    console.error('uploadBoardFile failed', error.message);
    throw fromSupabaseError(error, 'Could not upload the image.');
  }

  const { data } = await admin.storage.from(BUCKET).createSignedUrl(path, SIGNED_URL_SECONDS);
  return { id: fileId, mimeType: type, url: data?.signedUrl ?? null };
}

async function listFiles(admin, lessonId) {
  const { data, error } = await admin.storage.from(BUCKET).list(lessonId, { limit: 1000 });
  if (error) {
    console.error('listFiles failed', error.message);
    return {};
  }
  if (!data?.length) return {};

  const paths = data.map((f) => `${lessonId}/${f.name}`);
  const { data: signed, error: signError } = await admin.storage
    .from(BUCKET)
    .createSignedUrls(paths, SIGNED_URL_SECONDS);
  if (signError) {
    console.error('listFiles signing failed', signError.message);
    return {};
  }

  const files = {};
  for (const entry of signed ?? []) {
    if (!entry.signedUrl || !entry.path) continue;
    const name = entry.path.split('/').pop();
    const dot = name.lastIndexOf('.');
    const id = name.slice(0, dot);
    const mimeType = TYPES_BY_EXTENSION.get(name.slice(dot + 1));
    if (id && mimeType) files[id] = { url: entry.signedUrl, mimeType };
  }
  return files;
}
