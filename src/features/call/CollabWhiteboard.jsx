'use client';

// Collaborative whiteboard powered by Excalidraw + Supabase Realtime.
// - Each scene change broadcasts the full element set on the server-derived
//   `channelName` (see deriveRoomChannel in src/server/services/lessons.js).
// - Echo prevention uses Excalidraw's `getSceneVersion`: we never re-broadcast
//   a version we just applied from a peer.
// - The scene is saved to the lesson (debounced) so it survives the lesson and
//   can be reopened later. Images go to storage; peers only receive the file
//   id and fetch the bytes through the API.

import { useCallback, useEffect, useRef, useState } from 'react';
import { Excalidraw, getSceneVersion } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';
import { getBrowserSupabase } from '@/lib/supabase/browser';
import { getBoard, getBoardFiles, saveBoard, uploadBoardFile } from '@/lib/api/boards';

const THROTTLE_MS = 80;
const SAVE_DEBOUNCE_MS = 1500;

function dataURLToBlob(dataURL) {
  const [head, base64] = dataURL.split(',');
  const mime = /^data:([^;]+)/.exec(head)?.[1] ?? 'application/octet-stream';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function CollabWhiteboard({ lessonId, channelName, userId, readOnly = false }) {
  const [api, setApi] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | idle | saving | saved | error
  const [notice, setNotice] = useState('');
  const apiRef = useRef(null);
  const channelRef = useRef(null);

  // Echo guard: last scene version we either broadcast or applied from a peer.
  const lastSeenVersionRef = useRef(0);

  // Throttle bookkeeping for outgoing scene broadcasts.
  const throttleRef = useRef({ lastSent: 0, timer: null, queued: null });

  // Persistence bookkeeping. Nothing is saved until the stored board has been
  // loaded, so an empty initial scene can never overwrite it.
  const loadedRef = useRef(false);
  const saveRef = useRef({ timer: null, savedVersion: -1, inFlight: false, again: false });

  // File ids we already have (uploaded by us, or fetched from the server).
  const knownFilesRef = useRef(new Set());
  const fetchingFilesRef = useRef({ busy: false, again: false });

  useEffect(() => { apiRef.current = api; }, [api]);

  const saveNow = useCallback(async ({ keepalive = false } = {}) => {
    const a = apiRef.current;
    const s = saveRef.current;
    if (!a || !lessonId || readOnly || !loadedRef.current) return;
    if (s.timer) { clearTimeout(s.timer); s.timer = null; }

    const elements = a.getSceneElements();
    const version = getSceneVersion(elements);
    if (version === s.savedVersion) return;
    if (s.inFlight && !keepalive) { s.again = true; return; }

    s.inFlight = true;
    setStatus('saving');
    try {
      await saveBoard(lessonId, elements, keepalive ? { keepalive: true } : undefined);
      s.savedVersion = version;
      setStatus('saved');
    } catch (err) {
      setStatus('error');
      setNotice(err?.message ?? 'Could not save the board.');
    } finally {
      s.inFlight = false;
      if (s.again) { s.again = false; saveNow(); }
    }
  }, [lessonId, readOnly]);

  const scheduleSave = useCallback(() => {
    if (readOnly || !lessonId) return;
    const s = saveRef.current;
    if (s.timer) clearTimeout(s.timer);
    s.timer = setTimeout(() => { s.timer = null; saveNow(); }, SAVE_DEBOUNCE_MS);
  }, [lessonId, readOnly, saveNow]);

  const addRemoteFiles = useCallback(async (files) => {
    const a = apiRef.current;
    if (!a || !files) return;
    await Promise.all(Object.entries(files).map(async ([id, file]) => {
      if (knownFilesRef.current.has(id) || !file?.url) return;
      knownFilesRef.current.add(id);
      try {
        const res = await fetch(file.url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const dataURL = await blobToDataURL(await res.blob());
        a.addFiles([{ id, dataURL, mimeType: file.mimeType, created: Date.now() }]);
      } catch {
        knownFilesRef.current.delete(id);
      }
    }));
  }, []);

  const ensureFiles = useCallback(async (elements) => {
    if (!lessonId) return;
    const missing = (elements ?? []).some(
      (el) => el?.type === 'image' && el.fileId && !el.isDeleted && !knownFilesRef.current.has(el.fileId),
    );
    if (!missing) return;

    const f = fetchingFilesRef.current;
    if (f.busy) { f.again = true; return; }
    f.busy = true;
    try {
      await addRemoteFiles(await getBoardFiles(lessonId));
    } catch {
      // The uploader may not have finished yet; their `files` broadcast retries.
    } finally {
      f.busy = false;
      if (f.again) {
        f.again = false;
        ensureFiles(apiRef.current?.getSceneElements());
      }
    }
  }, [lessonId, addRemoteFiles]);

  const sendScene = useCallback((elements) => {
    const channel = channelRef.current;
    if (!channel) return;
    const version = getSceneVersion(elements);
    lastSeenVersionRef.current = version;
    channel.send({
      type: 'broadcast',
      event: 'scene',
      payload: { from: userId, version, elements },
    });
  }, [userId]);

  const broadcast = useCallback((elements) => {
    const t = throttleRef.current;
    const now = Date.now();
    const elapsed = now - t.lastSent;
    if (elapsed >= THROTTLE_MS) {
      t.lastSent = now;
      t.queued = null;
      if (t.timer) { clearTimeout(t.timer); t.timer = null; }
      sendScene(elements);
    } else {
      t.queued = elements;
      if (!t.timer) {
        t.timer = setTimeout(() => {
          const queued = t.queued;
          t.lastSent = Date.now();
          t.queued = null;
          t.timer = null;
          if (queued) sendScene(queued);
        }, THROTTLE_MS - elapsed);
      }
    }
  }, [sendScene]);

  // Load the saved board once Excalidraw is ready.
  useEffect(() => {
    if (!api || !lessonId) return;
    let cancelled = false;

    getBoard(lessonId)
      .then(async (board) => {
        if (cancelled) return;
        const elements = board?.elements ?? [];
        // A peer may already have sent a live scene; that one is newer.
        if (elements.length > 0 && api.getSceneElements().length === 0) {
          lastSeenVersionRef.current = getSceneVersion(elements);
          api.updateScene({ elements });
          api.scrollToContent(undefined, { fitToContent: true });
        }
        saveRef.current.savedVersion = getSceneVersion(api.getSceneElements());
        loadedRef.current = true;
        setStatus('idle');
        await addRemoteFiles(board?.files);
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus('error');
        setNotice(err?.message ?? 'Could not load the saved board.');
        // Still allow drawing and saving, or the room would be read-only.
        loadedRef.current = true;
      });

    return () => { cancelled = true; };
  }, [api, lessonId, addRemoteFiles]);

  // Realtime sync.
  useEffect(() => {
    if (readOnly) return;
    const supabase = getBrowserSupabase();
    if (!supabase || !channelName) return;

    // Still not RLS-enforced — see the note in VideoCall and at the top of
    // realtime_lesson_rooms.sql.
    const channel = supabase.channel(channelName, {
      config: { broadcast: { self: false } },
    });
    channelRef.current = channel;

    channel
      .on('broadcast', { event: 'scene' }, ({ payload }) => {
        const a = apiRef.current;
        if (!a || !payload || payload.from === userId) return;
        if (payload.version <= lastSeenVersionRef.current) return;
        lastSeenVersionRef.current = payload.version;
        a.updateScene({ elements: payload.elements });
        ensureFiles(payload.elements);
        scheduleSave();
      })
      .on('broadcast', { event: 'files' }, ({ payload }) => {
        if (!payload || payload.from === userId) return;
        ensureFiles(apiRef.current?.getSceneElements());
      })
      .on('broadcast', { event: 'request-state' }, ({ payload }) => {
        const a = apiRef.current;
        if (!a || !payload || payload.from === userId) return;
        const elements = a.getSceneElements();
        if (!elements?.length) return;
        const version = getSceneVersion(elements);
        channel.send({
          type: 'broadcast',
          event: 'scene',
          payload: { from: userId, version, elements },
        });
      })
      .subscribe((s) => {
        if (s === 'SUBSCRIBED') {
          // Ask any peers for the current board so we don't start blank.
          channel.send({
            type: 'broadcast',
            event: 'request-state',
            payload: { from: userId },
          });
        }
      });

    return () => {
      const t = throttleRef.current;
      if (t.timer) clearTimeout(t.timer);
      t.timer = null;
      t.queued = null;
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [channelName, userId, readOnly, ensureFiles, scheduleSave]);

  // Flush unsaved work when leaving the page or the room.
  useEffect(() => {
    if (readOnly) return;
    // keepalive caps the body at 64 KB, so it is only used where it is required.
    const flush = () => saveNow({ keepalive: true });
    window.addEventListener('pagehide', flush);
    return () => {
      window.removeEventListener('pagehide', flush);
      saveNow();
    };
  }, [readOnly, saveNow]);

  const uploadFile = useCallback(async (file) => {
    try {
      await uploadBoardFile(lessonId, file.id, dataURLToBlob(file.dataURL));
      channelRef.current?.send({
        type: 'broadcast',
        event: 'files',
        payload: { from: userId, id: file.id },
      });
    } catch (err) {
      knownFilesRef.current.delete(file.id);
      setNotice(err?.message ?? 'Could not upload the image.');
      setTimeout(() => setNotice(''), 6000);
    }
  }, [lessonId, userId]);

  const onChange = useCallback((elements, _appState, files) => {
    if (readOnly) return;

    if (files && lessonId) {
      for (const id of Object.keys(files)) {
        if (knownFilesRef.current.has(id)) continue;
        knownFilesRef.current.add(id);
        uploadFile(files[id]);
      }
    }

    const version = getSceneVersion(elements);
    if (version === lastSeenVersionRef.current) return;
    lastSeenVersionRef.current = version;
    broadcast(elements);
    scheduleSave();
  }, [readOnly, lessonId, uploadFile, broadcast, scheduleSave]);

  const handleClear = () => {
    const a = apiRef.current;
    if (!a) return;
    a.updateScene({ elements: [] });
    sendScene([]);
    scheduleSave();
  };

  const statusText = {
    loading: 'Loading…',
    saving: 'Saving…',
    saved: 'Saved',
    error: notice || 'Error',
  }[status];

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        {(statusText || notice) && (
          <span
            className={`px-2 py-1 rounded-md text-[11px] bg-[#FFFDF8]/90 border ${
              status === 'error' || notice ? 'border-[#E0A89F] text-[#7A3A33]' : 'border-[#DCC9A8] text-[#5A4A38]'
            }`}
          >
            {status === 'error' ? statusText : notice || statusText}
          </span>
        )}
        {!readOnly && (
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-1.5 rounded-md bg-[#F4ECDF] border border-[#DCC9A8] text-[#2A1F14] text-xs hover:bg-[#F4D9D5] hover:text-[#7A3A33] hover:border-[#E0A89F] transition-colors"
          >
            Clear board
          </button>
        )}
      </div>
      <Excalidraw
        excalidrawAPI={setApi}
        onChange={onChange}
        theme="dark"
        viewModeEnabled={readOnly}
        UIOptions={{ canvasActions: { saveToActiveFile: false, loadScene: false } }}
      />
    </div>
  );
}
