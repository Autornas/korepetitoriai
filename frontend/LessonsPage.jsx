'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Topbar from './components/Topbar';
import { useAuth } from './components/AuthProvider';
import { useLanguage } from './components/LanguageProvider';
import LessonDetailModal, { STATUS_PILL } from './components/LessonDetailModal';
import {
  listLessonsForStudent,
  listLessonsForTeacher,
  updateLessonStatus,
} from '@/backend/lessons';

const TABS = ['All', 'Pending', 'Accepted', 'Rejected'];

export default function LessonsPage() {
  const { user, role } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('All');
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const isTeacher = role === 'teacher';
  const counterpartLabel = isTeacher ? 'Student' : 'Tutor';

  const refresh = useCallback(async () => {
    if (!user || !role) return;
    setLoading(true);
    setError('');
    try {
      const data = isTeacher
        ? await listLessonsForTeacher(user.id)
        : await listLessonsForStudent(user.id);
      setLessons(data);
    } catch (e) {
      setError(e.message ?? 'Failed to load lessons.');
    } finally {
      setLoading(false);
    }
  }, [user, role, isTeacher]);

  useEffect(() => { refresh(); }, [refresh]);

  const filtered = useMemo(() => {
    if (tab === 'All') return lessons;
    return lessons.filter(l => l.status === tab.toLowerCase());
  }, [tab, lessons]);

  const handleStatus = async (id, status) => {
    setBusyId(id);
    try {
      await updateLessonStatus(id, status);
      setLessons(ls => ls.map(l => l.id === id ? { ...l, status } : l));
    } catch (e) {
      setError(e.message ?? 'Failed to update lesson.');
    } finally {
      setBusyId(null);
    }
  };

  const selectedLesson = selectedId ? lessons.find(l => l.id === selectedId) : null;

  return (
    <>
      {selectedLesson && (
        <LessonDetailModal
          lesson={selectedLesson}
          perspective={isTeacher ? 'teacher' : 'student'}
          onClose={() => setSelectedId(null)}
        />
      )}
      <Topbar crumbs={['My Lessons']} />
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-mono text-slate-600 uppercase tracking-widest mb-1">My Lessons</p>
            <h1 className="text-2xl font-semibold tracking-tight text-white">My Lessons</h1>
            <p className="text-slate-500 text-sm mt-1">
              {isTeacher
                ? 'Incoming lesson requests and your scheduled sessions.'
                : 'Track every lesson request you have sent.'}
            </p>
          </div>
          {!isTeacher && (
            <Link href="/tutors" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-500 transition-colors">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4"/><path d="M10 10l3 3"/></svg>
              Find a Tutor
            </Link>
          )}
        </div>

        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
        )}

        <div className="flex gap-1 border-b border-slate-800">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm border-b-2 transition-colors ${
                tab === t
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div
            className="grid border-b border-slate-800 px-5 py-3"
            style={{ gridTemplateColumns: '1fr 180px 200px 120px 160px' }}
          >
            {[counterpartLabel, 'Date', 'Time', 'Status', ''].map((h, i) => (
              <span key={i} className="text-[10px] font-mono uppercase tracking-widest text-slate-600">{h}</span>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-600">
              <svg width="36" height="36" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1"><rect x="2.5" y="3.5" width="11" height="10" rx="1.5"/><path d="M2.5 6h11M5.5 2v3M10.5 2v3"/></svg>
              <p className="text-sm mt-3">
                {tab === 'All' ? 'No lessons yet' : `No ${tab.toLowerCase()} lessons`}
              </p>
              {!isTeacher && tab === 'All' && (
                <Link href="/tutors" className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-500 transition-colors">
                  Find a Tutor
                </Link>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-slate-800">
              {filtered.map(l => {
                const counterpart = isTeacher ? l.student : l.teacher;
                const initials = (counterpart?.name ?? '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                return (
                  <li
                    key={l.id}
                    onClick={() => setSelectedId(l.id)}
                    className="grid px-5 py-3 items-center gap-3 cursor-pointer hover:bg-slate-800/40 transition-colors"
                    style={{ gridTemplateColumns: '1fr 180px 200px 120px 160px' }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 text-[10px] font-medium shrink-0">
                        {counterpart?.photo_url
                          ? <img src={counterpart.photo_url} alt="" className="w-full h-full rounded-full object-cover" />
                          : initials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <p className="text-sm text-slate-100 truncate">{counterpart?.name ?? 'Unknown'}</p>
                          {l.subject && (
                            <span className="shrink-0 px-1.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-[10px] text-indigo-300">
                              {l.subject}
                            </span>
                          )}
                        </div>
                        {l.notes && <p className="text-xs text-slate-500 truncate">{l.notes}</p>}
                      </div>
                    </div>
                    <span className="text-sm text-slate-300 font-mono">{l.date}</span>
                    <span className="text-sm text-slate-300 font-mono">{l.time?.slice(0, 5)}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] w-fit ${STATUS_PILL[l.status] ?? STATUS_PILL.pending}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {l.status}
                    </span>
                    <div className="flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                      {isTeacher && l.status === 'pending' && (
                        <>
                          <button
                            disabled={busyId === l.id}
                            onClick={() => handleStatus(l.id, 'accepted')}
                            className="px-2.5 py-1 rounded-md bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-500 transition-colors disabled:opacity-50"
                          >
                            Accept
                          </button>
                          <button
                            disabled={busyId === l.id}
                            onClick={() => handleStatus(l.id, 'rejected')}
                            className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium hover:bg-rose-500/10 hover:text-rose-300 transition-colors disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {isTeacher && l.status === 'accepted' && (
                        <button
                          disabled={busyId === l.id}
                          onClick={() => handleStatus(l.id, 'rejected')}
                          className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-xs hover:bg-rose-500/10 hover:text-rose-300 transition-colors disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      )}
                      {isTeacher && l.status === 'rejected' && (
                        <button
                          disabled={busyId === l.id}
                          onClick={() => handleStatus(l.id, 'accepted')}
                          className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-xs hover:bg-emerald-500/10 hover:text-emerald-300 transition-colors disabled:opacity-50"
                        >
                          Accept
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
