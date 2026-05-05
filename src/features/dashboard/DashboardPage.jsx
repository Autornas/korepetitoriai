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
} from '@/lib/lessons';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 11 }, (_, i) => i + 8);
const PX = 48;

const STATUS_STYLES = {
  pending:  { dot: 'bg-amber-400',   pill: 'bg-amber-500/20 border-amber-500/40 text-amber-300',     bar: 'bg-amber-500/20 border-amber-500',     labelKey: 'status.pending'  },
  accepted: { dot: 'bg-emerald-400', pill: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300', bar: 'bg-emerald-500/20 border-emerald-500', labelKey: 'status.accepted' },
  rejected: { dot: 'bg-rose-400',    pill: 'bg-rose-500/20 border-rose-500/40 text-rose-300',         bar: 'bg-rose-500/20 border-rose-500',         labelKey: 'status.rejected' },
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
        <button onClick={() => shift(-1)} className="flex items-center px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700 transition-colors">
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M10 4l-4 4 4 4"/></svg>
        </button>
        <span className="text-[11px] font-mono text-slate-400">
          {dates[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – {dates[6].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </span>
        <button onClick={() => shift(1)} className="flex items-center px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700 transition-colors">
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 4l4 4-4 4"/></svg>
        </button>
      </div>

      <div className="rounded-lg border border-slate-800 overflow-hidden">
        <div className="grid" style={{ gridTemplateColumns: '48px repeat(7, 1fr)' }}>
          <div className="border-b border-slate-800 h-11 bg-slate-950/40" />
          {dates.map((d, i) => (
            <div key={i} className="border-b border-slate-800 border-l h-11 flex flex-col items-center justify-center bg-slate-950/40">
              <span className="text-[10px] text-slate-600">{DAYS[i]}</span>
              <span className={`text-xs font-semibold mt-0.5 w-6 h-6 flex items-center justify-center rounded-full ${ymd(d) === todayKey ? 'bg-indigo-600 text-white' : 'text-slate-300'}`}>
                {d.getDate()}
              </span>
            </div>
          ))}

          {HOURS.map(h => (
            <div key={`row-${h}`} className="contents">
              <div className="border-t border-slate-800 text-[9px] font-mono text-slate-700 flex items-start justify-end pr-1.5 pt-1" style={{ height: PX }}>
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
                  <div key={`c-${h}-${di}`} className="border-t border-slate-800 border-l relative" style={{ height: PX }}>
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
                          <div className="truncate text-slate-100 text-[10px] font-medium">
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
    <div className="flex flex-wrap gap-5 text-xs text-slate-500 mt-4">
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
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">{t('dashboard.upcoming')}</p>
          <p className="text-2xl font-semibold text-slate-200 mt-1">{upcoming.length}</p>
        </div>
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">{t('dashboard.pending')}</p>
          <p className="text-2xl font-semibold text-slate-200 mt-1">{pending.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-4">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="text-sm font-semibold text-white">{t('dashboard.calendar')}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{t('dashboard.calendarSub')}</p>
            </div>
            <Link href="/lessons" className="text-xs text-indigo-400 hover:text-indigo-300">{t('common.viewAll')}</Link>
          </div>
          <WeekCalendar lessons={lessons} onSelect={(ev) => setSelectedId(ev.id)} />
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">{t('dashboard.pendingTitle')}</h2>
            <span className="text-[10px] font-mono text-slate-500">{pending.length}</span>
          </div>
          {pending.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-600">
              <p className="text-xs">{t('dashboard.noPending')}</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {pending.map(l => (
                <li key={l.id} className="rounded-lg border border-slate-800 bg-slate-800/40 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-slate-100 truncate">{l.student?.name ?? t('dashboard.student')}</p>
                    <StatusPill status={l.status} />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[11px] font-mono text-slate-500">
                      {l.date} · {l.time?.slice(0, 5)}
                    </p>
                    {l.subject && (
                      <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-[10px] text-indigo-300">
                        {l.subject}
                      </span>
                    )}
                    {l.student?.grade && (
                      <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-[10px] text-indigo-300">
                        {l.student.grade}
                      </span>
                    )}
                  </div>

                  {(l.student?.learning_struggles || l.student?.expectations || l.notes) && (
                    <div className="mt-2 space-y-1.5">
                      {l.notes && (
                        <div>
                          <p className="text-[9px] font-mono uppercase tracking-widest text-slate-600">{t('dashboard.notes')}</p>
                          <p className="text-xs text-slate-400 line-clamp-2">{l.notes}</p>
                        </div>
                      )}
                      {l.student?.learning_struggles && (
                        <div>
                          <p className="text-[9px] font-mono uppercase tracking-widest text-slate-600">{t('dashboard.struggles')}</p>
                          <p className="text-xs text-slate-400 line-clamp-3">{l.student.learning_struggles}</p>
                        </div>
                      )}
                      {l.student?.expectations && (
                        <div>
                          <p className="text-[9px] font-mono uppercase tracking-widest text-slate-600">{t('dashboard.expects')}</p>
                          <p className="text-xs text-slate-400 line-clamp-3">{l.student.expectations}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 mt-3">
                    <button
                      disabled={busyId === l.id}
                      onClick={() => onUpdate(l.id, 'accepted')}
                      className="flex-1 px-2 py-1.5 rounded-md bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-500 transition-colors disabled:opacity-50"
                    >
                      {t('dashboard.accept')}
                    </button>
                    <button
                      disabled={busyId === l.id}
                      onClick={() => onUpdate(l.id, 'rejected')}
                      className="flex-1 px-2 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium hover:bg-rose-500/10 hover:text-rose-300 transition-colors disabled:opacity-50"
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
  const upcoming = lessons.filter(l => new Date(`${l.date}T${l.time}`) >= new Date());
  const pending  = lessons.filter(l => l.status === 'pending');

  const quickActions = [
    { href: '/tutors',         label: t('dashboard.findTutor') },
  ];

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">{t('dashboard.upcoming')}</p>
          <p className="text-2xl font-semibold text-slate-200 mt-1">{upcoming.length}</p>
        </div>
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">{t('dashboard.awaiting')}</p>
          <p className="text-2xl font-semibold text-slate-200 mt-1">{pending.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_280px] gap-4">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">{t('dashboard.myRequests')}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{t('dashboard.myRequestsSub')}</p>
            </div>
            <Link href="/lessons" className="text-xs text-indigo-400 hover:text-indigo-300">{t('common.viewAll')}</Link>
          </div>

          {lessons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-600">
              <svg width="36" height="36" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1"><rect x="2.5" y="3.5" width="11" height="10" rx="1.5"/><path d="M2.5 6h11M5.5 2v3M10.5 2v3"/></svg>
              <p className="text-sm mt-3">{t('dashboard.noRequests')}</p>
              <Link href="/tutors" className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-500 transition-colors">
                {t('nav.findTutor')}
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-slate-800">
              {lessons.slice(0, 6).map(l => (
                <li key={l.id} className="py-3 flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 text-xs font-medium shrink-0">
                    {(l.teacher?.name ?? '?').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-100 truncate">{l.teacher?.name ?? t('dashboard.teacher')}</p>
                    <p className="text-[11px] font-mono text-slate-500">{l.date} · {l.time?.slice(0,5)}</p>
                  </div>
                  <StatusPill status={l.status} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <h2 className="text-sm font-semibold text-white mb-3">{t('dashboard.quickActions')}</h2>
            <div className="space-y-2">
              {quickActions.map((a, i) => (
                <Link key={i} href={a.href} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-800 text-slate-300 text-sm hover:bg-slate-800 hover:text-white transition-colors group">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                  <span className="flex-1">{a.label}</span>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-slate-600 group-hover:text-slate-400"><path d="M6 4l4 4-4 4"/></svg>
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
            <p className="text-xs font-mono text-slate-600 uppercase tracking-widest mb-1">{t('dashboard.kicker')}</p>
            <h1 className="text-2xl font-semibold tracking-tight text-white">{t('dashboard.welcome')}</h1>
            <p className="text-slate-500 text-sm mt-1">
              {isTeacher ? t('dashboard.subtitleTeacher') : t('dashboard.subtitleStudent')}
            </p>
          </div>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {(authLoading || loading) ? (
          <div className="flex justify-center py-16">
            <div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
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
