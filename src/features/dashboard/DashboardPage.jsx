'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Topbar from '@/components/Topbar';
import { useAuth } from '@/components/AuthProvider';
import { useLanguage } from '@/components/LanguageProvider';
import LessonDetailModal from '@/features/lessons/LessonDetailModal';
import {
  listLessonsForStudent,
  listLessonsForTeacher,
  updateLessonStatus,
} from '../../../app/lib/lessons';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 11 }, (_, i) => i + 8);
const PX = 48;

const STATUS_STYLES = {
  pending:  { dot: 'bg-[#D89A3A]',   pill: 'bg-[#FBEAC9] border-[#EBC988] text-[#8A6418]',     bar: 'bg-[#FBEAC9] border-[#D89A3A]',     labelKey: 'status.pending'  },
  accepted: { dot: 'bg-[#7A8C5C]', pill: 'bg-[#E6EBD5] border-[#BDC79A] text-[#4F5F36]', bar: 'bg-[#E6EBD5] border-[#7A8C5C]', labelKey: 'status.accepted' },
  rejected: { dot: 'bg-[#B85A4F]',    pill: 'bg-[#F4D9D5] border-[#E0A89F] text-[#7A3A33]',         bar: 'bg-[#F4D9D5] border-[#B85A4F]',         labelKey: 'status.rejected' },
};

function startOfWeek(d = new Date()) {
  const day = d.getDay();
  const monday = new Date(d);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(d.getDate() - ((day + 6) % 7));
  return monday;
}

function getWeekDates(monday) {
  return Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(monday);
    dt.setDate(monday.getDate() + i);
    return dt;
  });
}

function ymd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseTime(t) {
  if (!t) return { h: 0, m: 0 };
  const [h, m] = t.split(':').map(Number);
  return { h: h ?? 0, m: m ?? 0 };
}

function WeekCalendar({ lessons, onSelect }) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek());
  const dates = getWeekDates(weekStart);
  const todayKey = ymd(new Date());
  const startMs = weekStart.getTime();
  const endMs   = startMs + 7 * 24 * 60 * 60 * 1000;

  const visible = lessons.filter(l => {
    const t = new Date(`${l.date}T00:00:00`).getTime();
    return t >= startMs && t < endMs;
  });

  const shift = (delta) => {
    const next = new Date(weekStart);
    next.setDate(weekStart.getDate() + delta * 7);
    setWeekStart(next);
  };

  return (
    <div>
      <div className="flex items-center justify-end gap-2 mb-3">
        <button onClick={() => shift(-1)} className="flex items-center px-2 py-1.5 rounded-lg bg-[#F4ECDF] border border-[#DCC9A8] text-[#5A4A38] hover:bg-[#EBDFC6] transition-colors">
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M10 4l-4 4 4 4"/></svg>
        </button>
        <span className="text-[11px] font-mono text-[#5A4A38]">
          {dates[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – {dates[6].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </span>
        <button onClick={() => shift(1)} className="flex items-center px-2 py-1.5 rounded-lg bg-[#F4ECDF] border border-[#DCC9A8] text-[#5A4A38] hover:bg-[#EBDFC6] transition-colors">
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 4l4 4-4 4"/></svg>
        </button>
      </div>

      <div className="rounded-lg border border-[#EADFCB] overflow-hidden">
        <div className="grid" style={{ gridTemplateColumns: '48px repeat(7, 1fr)' }}>
          <div className="border-b border-[#EADFCB] h-11 bg-[#F4ECDF]" />
          {dates.map((d, i) => (
            <div key={i} className="border-b border-[#EADFCB] border-l h-11 flex flex-col items-center justify-center bg-[#F4ECDF]">
              <span className="text-[10px] text-[#8A7556]">{DAYS[i]}</span>
              <span className={`text-xs font-semibold mt-0.5 w-6 h-6 flex items-center justify-center rounded-full ${ymd(d) === todayKey ? 'bg-[#C8654A] text-white' : 'text-[#5A4A38]'}`}>
                {d.getDate()}
              </span>
            </div>
          ))}

          {HOURS.map(h => (
            <div key={`row-${h}`} className="contents">
              <div className="border-t border-[#EADFCB] text-[9px] font-mono text-[#B5A07F] flex items-start justify-end pr-1.5 pt-1" style={{ height: PX }}>
                {String(h).padStart(2, '0')}:00
              </div>
              {dates.map((d, di) => {
                const dKey = ymd(d);
                const events = visible.filter(l => {
                  if (l.date !== dKey) return false;
                  const { h: lh } = parseTime(l.time);
                  return lh === h;
                });
                return (
                  <div key={`c-${h}-${di}`} className="border-t border-[#EADFCB] border-l relative" style={{ height: PX }}>
                    {events.map(ev => {
                      const { h: lh, m: lm } = parseTime(ev.time);
                      const top = (lm / 60) * PX;
                      const s = STATUS_STYLES[ev.status] ?? STATUS_STYLES.pending;
                      return (
                        <button
                          key={ev.id}
                          onClick={() => onSelect?.(ev)}
                          title={`${ev.status} — ${ev.time}`}
                          className={`absolute left-0.5 right-0.5 px-1.5 py-0.5 rounded border-l-2 text-left text-[10px] hover:brightness-110 transition ${s.bar}`}
                          style={{ top, height: PX - 4 }}
                        >
                          <div className="font-mono text-[9px] opacity-80">{String(lh).padStart(2,'0')}:{String(lm).padStart(2,'0')}</div>
                          <div className="truncate text-[#2A1F14] text-[10px] font-medium">
                            {ev.student?.name ?? ev.teacher?.name ?? '—'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <StatusLegend />
    </div>
  );
}

function StatusLegend() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-wrap gap-5 text-xs text-[#8A7556] mt-4">
      {Object.entries(STATUS_STYLES).map(([k, s]) => (
        <span key={k} className="flex items-center gap-2">
          <span className={`w-3 h-2 rounded-sm border-l-2 ${s.bar}`} />
          {t(s.labelKey)}
        </span>
      ))}
    </div>
  );
}

function StatusPill({ status }) {
  const { t } = useLanguage();
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.pending;
  return (
    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] ${s.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {t(s.labelKey)}
    </span>
  );
}

function TeacherDashboard({ lessons, onUpdate, busyId }) {
  const { t } = useLanguage();
  const [selectedId, setSelectedId] = useState(null);
  const pending = lessons.filter(l => l.status === 'pending');
  const accepted = lessons.filter(l => l.status === 'accepted');
  const upcoming = accepted.filter(l => new Date(`${l.date}T${l.time}`) >= new Date());
  const selectedLesson = selectedId ? lessons.find(l => l.id === selectedId) : null;

  return (
    <>
      {selectedLesson && (
        <LessonDetailModal
          lesson={selectedLesson}
          perspective="teacher"
          onClose={() => setSelectedId(null)}
        />
      )}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#FFFDF8] rounded-xl border border-[#EADFCB] p-5">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#8A7556]">{t('dashboard.upcoming')}</p>
          <p className="text-2xl font-semibold text-[#2A1F14] mt-1">{upcoming.length}</p>
        </div>
        <div className="bg-[#FFFDF8] rounded-xl border border-[#EADFCB] p-5">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#8A7556]">{t('dashboard.pending')}</p>
          <p className="text-2xl font-semibold text-[#2A1F14] mt-1">{pending.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-4">
        <div className="bg-[#FFFDF8] rounded-xl border border-[#EADFCB] p-5">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="text-sm font-semibold text-[#2A1F14]">{t('dashboard.calendar')}</h2>
              <p className="text-xs text-[#8A7556] mt-0.5">{t('dashboard.calendarSub')}</p>
            </div>
            <Link href="/lessons" className="text-xs text-[#B0533A] hover:text-[#B0533A]">{t('common.viewAll')}</Link>
          </div>
          <WeekCalendar lessons={lessons} onSelect={(ev) => setSelectedId(ev.id)} />
        </div>

        <div className="bg-[#FFFDF8] rounded-xl border border-[#EADFCB] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#2A1F14]">{t('dashboard.pendingTitle')}</h2>
            <span className="text-[10px] font-mono text-[#8A7556]">{pending.length}</span>
          </div>
          {pending.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-[#8A7556]">
              <p className="text-xs">{t('dashboard.noPending')}</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {pending.map(l => (
                <li key={l.id} className="rounded-lg border border-[#EADFCB] bg-[#F4ECDF] p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-[#2A1F14] truncate">{l.student?.name ?? t('dashboard.student')}</p>
                    <StatusPill status={l.status} />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[11px] font-mono text-[#8A7556]">
                      {l.date} · {l.time?.slice(0, 5)}
                    </p>
                    {l.subject && (
                      <span className="px-1.5 py-0.5 rounded-full bg-[#F6E4DA] border border-[#E8B7A2] text-[10px] text-[#B0533A]">
                        {l.subject}
                      </span>
                    )}
                    {l.student?.grade && (
                      <span className="px-1.5 py-0.5 rounded-full bg-[#F6E4DA] border border-[#E8B7A2] text-[10px] text-[#B0533A]">
                        {l.student.grade}
                      </span>
                    )}
                  </div>

                  {(l.student?.learning_struggles || l.student?.expectations || l.notes) && (
                    <div className="mt-2 space-y-1.5">
                      {l.notes && (
                        <div>
                          <p className="text-[9px] font-mono uppercase tracking-widest text-[#8A7556]">{t('dashboard.notes')}</p>
                          <p className="text-xs text-[#5A4A38] line-clamp-2">{l.notes}</p>
                        </div>
                      )}
                      {l.student?.learning_struggles && (
                        <div>
                          <p className="text-[9px] font-mono uppercase tracking-widest text-[#8A7556]">{t('dashboard.struggles')}</p>
                          <p className="text-xs text-[#5A4A38] line-clamp-3">{l.student.learning_struggles}</p>
                        </div>
                      )}
                      {l.student?.expectations && (
                        <div>
                          <p className="text-[9px] font-mono uppercase tracking-widest text-[#8A7556]">{t('dashboard.expects')}</p>
                          <p className="text-xs text-[#5A4A38] line-clamp-3">{l.student.expectations}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 mt-3">
                    <button
                      disabled={busyId === l.id}
                      onClick={() => onUpdate(l.id, 'accepted')}
                      className="flex-1 px-2 py-1.5 rounded-md bg-[#7A8C5C] text-white text-xs font-medium hover:bg-[#677A4D] transition-colors disabled:opacity-50"
                    >
                      {t('dashboard.accept')}
                    </button>
                    <button
                      disabled={busyId === l.id}
                      onClick={() => onUpdate(l.id, 'rejected')}
                      className="flex-1 px-2 py-1.5 rounded-md bg-[#F4ECDF] border border-[#DCC9A8] text-[#5A4A38] text-xs font-medium hover:bg-[#F4D9D5] hover:text-[#7A3A33] transition-colors disabled:opacity-50"
                    >
                      {t('dashboard.reject')}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

function StudentDashboard({ lessons }) {
  const { t } = useLanguage();
  const [selectedId, setSelectedId] = useState(null);
  const upcoming = lessons.filter(l => new Date(`${l.date}T${l.time}`) >= new Date());
  const pending  = lessons.filter(l => l.status === 'pending');
  const selectedLesson = selectedId ? lessons.find(l => l.id === selectedId) : null;

  const quickActions = [
    { href: '/tutors',         label: t('dashboard.findTutor') },
  ];

  return (
    <>
      {selectedLesson && (
        <LessonDetailModal
          lesson={selectedLesson}
          perspective="student"
          onClose={() => setSelectedId(null)}
        />
      )}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#FFFDF8] rounded-xl border border-[#EADFCB] p-5">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#8A7556]">{t('dashboard.upcoming')}</p>
          <p className="text-2xl font-semibold text-[#2A1F14] mt-1">{upcoming.length}</p>
        </div>
        <div className="bg-[#FFFDF8] rounded-xl border border-[#EADFCB] p-5">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#8A7556]">{t('dashboard.awaiting')}</p>
          <p className="text-2xl font-semibold text-[#2A1F14] mt-1">{pending.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_280px] gap-4">
        <div className="bg-[#FFFDF8] rounded-xl border border-[#EADFCB] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-[#2A1F14]">{t('dashboard.myRequests')}</h2>
              <p className="text-xs text-[#8A7556] mt-0.5">{t('dashboard.myRequestsSub')}</p>
            </div>
            <Link href="/lessons" className="text-xs text-[#B0533A] hover:text-[#B0533A]">{t('common.viewAll')}</Link>
          </div>

          {lessons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-[#8A7556]">
              <svg width="36" height="36" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1"><rect x="2.5" y="3.5" width="11" height="10" rx="1.5"/><path d="M2.5 6h11M5.5 2v3M10.5 2v3"/></svg>
              <p className="text-sm mt-3">{t('dashboard.noRequests')}</p>
              <Link href="/tutors" className="mt-4 px-4 py-2 rounded-lg bg-[#C8654A] text-white text-sm hover:bg-[#B0533A] transition-colors">
                {t('nav.findTutor')}
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {lessons.slice(0, 6).map(l => {
                const STATUS_HEX = { pending: '#D89A3A', accepted: '#7A8C5C', rejected: '#B85A4F' };
                const stripe = STATUS_HEX[l.status] ?? STATUS_HEX.pending;
                const dt = new Date(`${l.date}T00:00:00`);
                const month = dt.toLocaleDateString(undefined, { month: 'short' }).toUpperCase();
                const day = dt.getDate();
                const weekday = dt.toLocaleDateString(undefined, { weekday: 'short' });
                return (
                  <li
                    key={l.id}
                    onClick={() => setSelectedId(l.id)}
                    className="relative rounded-xl overflow-hidden border border-[#EADFCB] hover:border-[#DCC9A8] cursor-pointer transition-shadow hover:shadow-md"
                    style={{ background: 'linear-gradient(135deg, #FFFDF8 0%, #F7EFDF 100%)' }}
                  >
                    <span className="absolute left-0 top-0 bottom-0 w-1" style={{ background: stripe }} />
                    <div className="flex items-center gap-3 pl-4 pr-3 py-3">
                      <div className="shrink-0 w-12 rounded-lg border border-[#EADFCB] bg-[#FFFDF8] flex flex-col items-center py-1.5">
                        <span className="text-[8px] font-mono uppercase tracking-widest text-[#8A7556]">{month}</span>
                        <span className="text-lg font-semibold leading-tight text-[#2A1F14]" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>{day}</span>
                        <span className="text-[8px] font-mono uppercase text-[#B5A07F]">{weekday}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <p className="text-sm font-medium text-[#2A1F14] truncate">{l.teacher?.name ?? t('dashboard.teacher')}</p>
                          {l.subject && (
                            <span className="shrink-0 px-1.5 py-0.5 rounded-full bg-[#F6E4DA] border border-[#E8B7A2] text-[9px] text-[#B0533A]">{l.subject}</span>
                          )}
                        </div>
                        <p className="text-[11px] font-mono text-[#8A7556] truncate">{l.time?.slice(0,5)}{l.notes ? ` · ${l.notes}` : ''}</p>
                      </div>
                      <StatusPill status={l.status} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-[#FFFDF8] rounded-xl border border-[#EADFCB] p-5">
            <h2 className="text-sm font-semibold text-[#2A1F14] mb-3">{t('dashboard.quickActions')}</h2>
            <div className="space-y-2">
              {quickActions.map((a, i) => (
                <Link key={i} href={a.href} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#F4ECDF] border border-[#EADFCB] text-[#5A4A38] text-sm hover:bg-[#F4ECDF] hover:text-[#2A1F14] transition-colors group">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C8654A] shrink-0" />
                  <span className="flex-1">{a.label}</span>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-[#8A7556] group-hover:text-[#5A4A38]"><path d="M6 4l4 4-4 4"/></svg>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function DashboardPage() {
  const { user, role, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!user || !role) return;
    setLoading(true);
    setError('');
    try {
      const data = role === 'teacher'
        ? await listLessonsForTeacher(user.id)
        : await listLessonsForStudent(user.id);
      setLessons(data);
    } catch (e) {
      setError(e.message ?? 'Failed to load lessons.');
    } finally {
      setLoading(false);
    }
  }, [user, role]);

  useEffect(() => { refresh(); }, [refresh]);

  const handleUpdate = async (id, status) => {
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

  const isTeacher = role === 'teacher';

  return (
    <>
      <Topbar crumbs={[t('dashboard.crumb')]} />
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-mono text-[#8A7556] uppercase tracking-widest mb-1">{t('dashboard.kicker')}</p>
            <h1 className="text-2xl font-semibold tracking-tight text-[#2A1F14]">{t('dashboard.welcome')}</h1>
            <p className="text-[#8A7556] text-sm mt-1">
              {isTeacher ? t('dashboard.subtitleTeacher') : t('dashboard.subtitleStudent')}
            </p>
          </div>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-lg bg-[#F4D9D5] border border-[#E0A89F] text-red-400 text-sm">
            {error}
          </div>
        )}

        {(authLoading || loading) ? (
          <div className="flex justify-center py-16">
            <div className="w-5 h-5 rounded-full border-2 border-[#C8654A] border-t-transparent animate-spin" />
          </div>
        ) : isTeacher ? (
          <TeacherDashboard lessons={lessons} onUpdate={handleUpdate} busyId={busyId} />
        ) : (
          <StudentDashboard lessons={lessons} />
        )}
      </div>
    </>
  );
}
