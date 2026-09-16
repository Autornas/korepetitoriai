'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { useLanguage } from '@/components/LanguageProvider';
import { getLesson } from '@/lib/api/lessons';

const CollabWhiteboard = dynamic(() => import('./CollabWhiteboard'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-[#8A7556] text-sm">…</div>
  ),
});

/** The saved whiteboard of a lesson, read-only, for either participant. */
export default function BoardViewPage({ lessonId }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [lesson, setLesson] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    getLesson(lessonId, { signal: controller.signal })
      .then(setLesson)
      .catch((err) => {
        if (err?.name !== 'AbortError') setError(err?.message ?? 'Could not open this lesson.');
      });
    return () => controller.abort();
  }, [lessonId, user]);

  if (error) {
    return (
      <div className="p-6 text-sm">
        <p className="text-[#7A3A33] mb-2">{error}</p>
        <Link href="/lessons" className="text-[#B0533A] underline">{t('board.back')}</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#FFFDF8]">
      <header className="flex items-center justify-between pl-14 pr-5 py-3 border-b border-[#EADFCB] shrink-0">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#8A7556]">
            {t('board.kicker')}
          </p>
          <h1 className="text-sm font-semibold text-[#2A1F14]">
            {lesson ? `${lesson.subject ?? t('board.lesson')} · ${lesson.date} ${lesson.time?.slice(0, 5)}` : '…'}
          </h1>
        </div>
        <Link
          href="/lessons"
          className="px-3 py-1.5 rounded-md bg-[#F4ECDF] border border-[#DCC9A8] text-[#2A1F14] text-xs hover:bg-[#EADFCB] transition-colors"
        >
          {t('board.back')}
        </Link>
      </header>
      <div className="flex-1 min-h-0">
        {lesson && <CollabWhiteboard lessonId={lesson.id} userId={user?.id} readOnly />}
      </div>
    </div>
  );
}
