'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import VideoCall from './VideoCall';

// Excalidraw touches `window` at import time and can't be SSR'd.
const CollabWhiteboard = dynamic(
  () => import('./CollabWhiteboard'),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-full text-slate-500 text-sm">Loading whiteboard…</div> },
);

export default function CallRoomPage({ lessonId }) {
  const { user, loading } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!supabase || !user) return;
    let cancelled = false;
    (async () => {
      const { data, error: dbError } = await supabase
        .from('lessons')
        .select('id, student_id, teacher_id, status, subject, date, time')
        .eq('id', lessonId)
        .maybeSingle();
      if (cancelled) return;
      if (dbError) { setError(dbError.message); return; }
      if (!data) { setError('Lesson not found, or you do not have access.'); return; }
      setLesson(data);
    })();
    return () => { cancelled = true; };
  }, [lessonId, user]);

  if (loading || (!user && !error)) {
    return <div className="flex items-center justify-center h-full text-slate-400 text-sm">Loading…</div>;
  }
  if (error) {
    return (
      <div className="p-6 text-sm">
        <p className="text-rose-400 mb-2">{error}</p>
        <Link href="/lessons" className="text-indigo-400 hover:text-indigo-300 underline">Back to lessons</Link>
      </div>
    );
  }
  if (!lesson) {
    return <div className="flex items-center justify-center h-full text-slate-400 text-sm">Loading lesson…</div>;
  }

  const isParticipant = user.id === lesson.student_id || user.id === lesson.teacher_id;
  if (!isParticipant) {
    return (
      <div className="p-6 text-sm">
        <p className="text-rose-400 mb-2">You are not a participant of this lesson.</p>
        <Link href="/lessons" className="text-indigo-400 hover:text-indigo-300 underline">Back to lessons</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950">
      <header className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-900 shrink-0">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-600">Lesson Room</p>
          <h1 className="text-sm font-semibold text-white">
            {lesson.subject ?? 'Lesson'} · {lesson.date} {lesson.time?.slice(0, 5)}
          </h1>
        </div>
        <Link
          href="/lessons"
          className="px-3 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-slate-200 text-xs hover:bg-rose-500/20 hover:text-rose-300 transition-colors"
        >
          Leave
        </Link>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 flex-1 min-h-0">
        <div className="border-b md:border-b-0 md:border-r border-slate-800 min-h-0 min-w-0">
          <VideoCall lessonId={lesson.id} userId={user.id} />
        </div>
        <div className="min-h-0 min-w-0">
          <CollabWhiteboard lessonId={lesson.id} userId={user.id} />
        </div>
      </div>
    </div>
  );
}
