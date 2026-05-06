'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Topbar from '@/components/Topbar';
import { useAuth } from '@/components/AuthProvider';
import { useLanguage } from '@/components/LanguageProvider';
import LessonDetailModal, { STATUS_PILL } from './LessonDetailModal';
import {
  listLessonsForStudent,
  listLessonsForTeacher,
  updateLessonStatus,
} from '../../../app/lib/lessons';

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
            <p className="text-xs font-mono text-[#8A7556] uppercase tracking-widest mb-1">My Lessons</p>
            <h1 className="text-2xl font-semibold tracking-tight text-[#2A1F14]">My Lessons</h1>
            <p className="text-[#8A7556] text-sm mt-1">
              {isTeacher
                ? 'Incoming lesson requests and your scheduled sessions.'
                : 'Track every lesson request you have sent.'}
            </p>
          </div>
          {!isTeacher && (
            <Link href="/tutors" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#C8654A] text-white text-sm hover:bg-[#B0533A] transition-colors">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4"/><path d="M10 10l3 3"/></svg>
              Find a Tutor
            </Link>
          )}
        </div>

        {error && (
          <div className="px-4 py-3 rounded-lg bg-[#F4D9D5] border border-[#E0A89F] text-red-400 text-sm">{error}</div>
        )}

        <div className="flex gap-1 border-b border-[#EADFCB]">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm border-b-2 transition-colors ${
                tab === t
                  ? 'border-[#C8654A] text-[#B0533A]'
                  : 'border-transparent text-[#8A7556] hover:text-[#5A4A38]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-5 h-5 rounded-full border-2 border-[#C8654A] border-t-transparent animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#8A7556] bg-[#FFFDF8] rounded-2xl border border-[#EADFCB]">
              <svg width="36" height="36" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1"><rect x="2.5" y="3.5" width="11" height="10" rx="1.5"/><path d="M2.5 6h11M5.5 2v3M10.5 2v3"/></svg>
              <p className="text-sm mt-3">
                {tab === 'All' ? 'No lessons yet' : `No ${tab.toLowerCase()} lessons`}
              </p>
              {!isTeacher && tab === 'All' && (
                <Link href="/tutors" className="mt-4 px-4 py-2 rounded-lg bg-[#C8654A] text-white text-sm hover:bg-[#B0533A] transition-colors">
                  Find a Tutor
                </Link>
              )}
            </div>
          ) : (
            <ul className="space-y-3">
              {filtered.map(l => {
                const counterpart = isTeacher ? l.student : l.teacher;
                const STATUS_DOT = { pending: '#D89A3A', accepted: '#7A8C5C', rejected: '#B85A4F' };
                const dt = new Date(`${l.date}T00:00:00`);
                const month = dt.toLocaleDateString('en-US', { month: 'short' });
                const day = dt.getDate();
                const weekday = dt.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
                return (
                  <li
                    key={l.id}
                    onClick={() => setSelectedId(l.id)}
                    className="rounded-2xl p-4 flex items-center gap-5 relative overflow-hidden cursor-pointer transition-shadow hover:shadow-md"
                    style={{
                      background: 'linear-gradient(135deg, #FFFDF8 0%, #F4ECDF 100%)',
                      border: '1px solid #EADFCB',
                      borderLeft: `4px solid ${STATUS_DOT[l.status] ?? STATUS_DOT.pending}`,
                    }}
                  >
                    {/* Calendar tile */}
                    <div
                      className="rounded-xl shrink-0 flex flex-col items-center justify-center"
                      style={{ width: 64, height: 72, background: '#FFFDF8', border: '1px solid #DCC9A8' }}
                    >
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#C8654A]">{month}</span>
                      <span className="text-2xl font-semibold leading-none mt-0.5 text-[#2A1F14]" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>{day}</span>
                      <span className="text-[10px] font-mono mt-0.5 text-[#8A7556]">{weekday}</span>
                    </div>

                    {/* Body */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="text-base font-semibold text-[#2A1F14] truncate">{counterpart?.name ?? 'Unknown'}</p>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] ${STATUS_PILL[l.status] ?? STATUS_PILL.pending}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {l.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {l.subject && (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-[#F6E4DA] border border-[#E8B7A2] text-[#B0533A]">
                            {l.subject}
                          </span>
                        )}
                        <span className="text-[11px] font-mono text-[#8A7556]">{l.time?.slice(0, 5)} · 60 min</span>
                      </div>
                      {l.notes && <p className="text-xs truncate text-[#8A7556]">{l.notes}</p>}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                      {isTeacher && l.status === 'pending' && (
                        <>
                          <button
                            disabled={busyId === l.id}
                            onClick={() => handleStatus(l.id, 'accepted')}
                            className="px-3 py-2 rounded-lg bg-[#7A8C5C] text-white text-xs font-medium hover:bg-[#677A4D] transition-colors disabled:opacity-50"
                          >
                            Accept
                          </button>
                          <button
                            disabled={busyId === l.id}
                            onClick={() => handleStatus(l.id, 'rejected')}
                            className="px-3 py-2 rounded-lg bg-transparent border border-[#DCC9A8] text-[#5A4A38] text-xs hover:bg-[#F4D9D5] hover:text-[#7A3A33] transition-colors disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {isTeacher && l.status === 'accepted' && (
                        <button
                          disabled={busyId === l.id}
                          onClick={() => handleStatus(l.id, 'rejected')}
                          className="px-3 py-2 rounded-lg bg-transparent border border-[#DCC9A8] text-[#5A4A38] text-xs hover:bg-[#F4D9D5] hover:text-[#7A3A33] transition-colors disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      )}
                      {isTeacher && l.status === 'rejected' && (
                        <button
                          disabled={busyId === l.id}
                          onClick={() => handleStatus(l.id, 'accepted')}
                          className="px-3 py-2 rounded-lg bg-transparent border border-[#DCC9A8] text-[#5A4A38] text-xs hover:bg-[#677A4D]/10 hover:text-[#4F5F36] transition-colors disabled:opacity-50"
                        >
                          Accept
                        </button>
                      )}
                      {!isTeacher && l.status === 'accepted' && (
                        <button className="px-3 py-2 rounded-lg bg-[#C8654A] text-white text-xs font-medium hover:bg-[#B0533A] transition-colors">
                          Join lesson
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
