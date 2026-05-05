'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Topbar from './components/Topbar';
import { useAuth } from './components/AuthProvider';
import { useLanguage } from './components/LanguageProvider';
import { listTeachers, createLessonRequest, setLessonMeetLink } from '@/backend/lessons';
import { createMeetEvent } from '@/backend/google';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function ymd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function startOfWeek(d = new Date()) {
  const day = d.getDay();
  const monday = new Date(d);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(d.getDate() - ((day + 6) % 7));
  return monday;
}

function SlotCalendarHeader({ weekStart, onShift, prevTitle, nextTitle }) {
  const dates = Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(weekStart);
    dt.setDate(weekStart.getDate() + i);
    return dt;
  });
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onShift(-1)}
        title={prevTitle}
        className="flex items-center px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700 transition-colors"
      >
        <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M10 4l-4 4 4 4"/></svg>
      </button>
      <span className="text-[11px] font-mono text-slate-400">
        {dates[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – {dates[6].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
      </span>
      <button
        type="button"
        onClick={() => onShift(1)}
        title={nextTitle}
        className="flex items-center px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700 transition-colors"
      >
        <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 4l4 4-4 4"/></svg>
      </button>
    </div>
  );
}

function SlotCalendar({ availSet, weekStart, selectedDate, selectedHour, onSelect }) {
  const dates = Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(weekStart);
    dt.setDate(weekStart.getDate() + i);
    return dt;
  });
  const todayKey = ymd(new Date());
  const now = new Date();

  // Compute hour range from teacher's availability so the grid stays compact.
  const hours = (() => {
    const set = new Set();
    availSet.forEach(k => {
      const h = parseInt(k.split('-')[1], 10);
      if (!Number.isNaN(h)) set.add(h);
    });
    if (set.size === 0) return [];
    const arr = [...set].sort((a, b) => a - b);
    return Array.from({ length: arr[arr.length - 1] - arr[0] + 1 }, (_, i) => arr[0] + i);
  })();

  return (
    <div className="rounded-lg border border-slate-800 overflow-hidden">
      <div className="grid" style={{ gridTemplateColumns: '52px repeat(7, 1fr)' }}>
        <div className="border-b border-slate-800 h-11 bg-slate-950/40" />
        {dates.map((d, i) => {
          const isToday = ymd(d) === todayKey;
          return (
            <div key={i} className="border-b border-slate-800 border-l h-11 flex flex-col items-center justify-center bg-slate-950/40">
              <span className="text-[10px] text-slate-600">{DAYS[i]}</span>
              <span className={`text-xs font-semibold mt-0.5 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white' : 'text-slate-300'}`}>
                {d.getDate()}
              </span>
            </div>
          );
        })}

        {hours.map(h => (
          <div key={`row-${h}`} className="contents">
            <div className="border-t border-slate-800 text-[10px] font-mono text-slate-600 flex items-start justify-end pr-2 pt-1.5" style={{ height: 36 }}>
              {String(h).padStart(2, '0')}:00
            </div>
            {dates.map((d, di) => {
              const dKey = ymd(d);
              const isAvailable = availSet.has(`${di}-${h}`);
              const slotDate = new Date(d);
              slotDate.setHours(h, 0, 0, 0);
              const isPast = slotDate.getTime() < now.getTime();
              const enabled = isAvailable && !isPast;
              const isSelected = enabled && selectedDate === dKey && selectedHour === String(h).padStart(2, '0');
              return (
                <button
                  key={`c-${h}-${di}`}
                  type="button"
                  disabled={!enabled}
                  onClick={() => onSelect(dKey, String(h).padStart(2, '0'))}
                  title={enabled ? `${dKey} ${String(h).padStart(2,'0')}:00` : ''}
                  className={`border-t border-l border-slate-800 transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 hover:bg-indigo-500'
                      : enabled
                        ? 'bg-indigo-500/15 hover:bg-indigo-500/30 cursor-pointer'
                        : 'bg-slate-950/20'
                  }`}
                  style={{ height: 36 }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CreateLessonPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, googleToken } = useAuth();
  const { t } = useLanguage();

  const [teachers, setTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [teacherId, setTeacherId] = useState(params.get('teacherId') ?? '');
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState('');
  const [hour, setHour] = useState('');
  const time = hour ? `${hour}:00` : '';
  const [notes, setNotes] = useState('');
  const [weekStart, setWeekStart] = useState(() => startOfWeek());

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const teacher = teachers.find(tt => tt.id === teacherId);
  const availSet = useMemo(
    () => new Set(teacher?.availability ?? []),
    [teacher],
  );

  // Reset selected slot and subject when the teacher changes.
  useEffect(() => {
    setDate('');
    setHour('');
    setSubject('');
  }, [teacherId]);

  const teacherSubjects = useMemo(
    () => (teacher?.subjects ?? []).filter(s => s?.name).map(s => s.name),
    [teacher],
  );

  useEffect(() => {
    let cancelled = false;
    listTeachers()
      .then(data => { if (!cancelled) setTeachers(data); })
      .catch(e   => { if (!cancelled) setError(e.message ?? 'Failed to load tutors.'); })
      .finally(() => { if (!cancelled) setLoadingTeachers(false); });
    return () => { cancelled = true; };
  }, []);

  const isValid =
    teacherId
    && date
    && hour
    && (teacherSubjects.length === 0 || subject);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !isValid || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const lesson = await createLessonRequest({ studentId: user.id, teacherId, date, time, subject, notes });

      // Best-effort: create a Google Calendar event with a Meet link. Only
      // possible if the student signed in with Google in this session.
      if (googleToken && teacher?.email) {
        try {
          const { meetLink } = await createMeetEvent({
            token: googleToken,
            lessonId: lesson.id,
            summary: subject ? `${subject} lesson with ${teacher.name ?? ''}`.trim() : `Lesson with ${teacher.name ?? ''}`.trim(),
            description: notes || '',
            date,
            time: `${time}:00`,
            durationMin: 60,
            attendeeEmails: [user.email, teacher.email],
          });
          if (meetLink) await setLessonMeetLink(lesson.id, meetLink);
        } catch (calendarErr) {
          // Don't block the booking on calendar failures — the lesson still
          // exists and JoinSection falls back to a Jitsi room.
          console.warn('Calendar event creation failed:', calendarErr);
        }
      }

      router.replace('/lessons');
    } catch (err) {
      setError(err.message ?? 'Failed to send request.');
      setSubmitting(false);
    }
  };

  return (
    <>
      <Topbar crumbs={[t('create.crumb')]} />
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-mono text-slate-600 uppercase tracking-widest mb-1">{t('create.kicker')}</p>
            <h1 className="text-2xl font-semibold tracking-tight text-white">{t('create.title')}</h1>
            <p className="text-slate-500 text-sm mt-1">{t('create.subtitle')}</p>
          </div>
          <button
            type="submit"
            disabled={!isValid || submitting}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8.5L6.5 12 13 4.5"/></svg>
            {submitting ? t('create.sending') : t('create.send')}
          </button>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
        )}

        <div className="grid grid-cols-[1fr_300px] gap-4">
          <div className="space-y-4">
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4">
              <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">{t('create.tutor')}</p>
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">{t('create.chooseTutor')}</label>
                <select
                  value={teacherId}
                  onChange={e => setTeacherId(e.target.value)}
                  disabled={loadingTeachers}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-200 text-sm outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="">{loadingTeachers ? t('common.loading') : t('create.selectTutor')}</option>
                  {teachers.map(tt => (
                    <option key={tt.id} value={tt.id}>
                      {tt.name ?? '—'} {tt.headline ? `· ${tt.headline}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {teacher && (
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5">
                    {t('create.subject')} <span className="text-rose-400">*</span>
                  </label>
                  {teacherSubjects.length === 0 ? (
                    <p className="text-[11px] text-amber-400">{t('create.noSubjects')}</p>
                  ) : (
                    <select
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-200 text-sm outline-none focus:border-indigo-500 transition-colors"
                    >
                      <option value="">{t('create.subjectPh')}</option>
                      {teacherSubjects.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">{t('create.dateTime')}</p>
                {teacher && availSet.size > 0 && (
                  <SlotCalendarHeader
                    weekStart={weekStart}
                    onShift={(delta) => {
                      const next = new Date(weekStart);
                      next.setDate(weekStart.getDate() + delta * 7);
                      setWeekStart(next);
                    }}
                    prevTitle={t('create.weekPrev')}
                    nextTitle={t('create.weekNext')}
                  />
                )}
              </div>

              {!teacher ? (
                <p className="text-xs text-slate-500">{t('create.pickTutorFirst')}</p>
              ) : availSet.size === 0 ? (
                <p className="text-xs text-amber-400">{t('create.noAvailability')}</p>
              ) : (
                <SlotCalendar
                  availSet={availSet}
                  weekStart={weekStart}
                  selectedDate={date}
                  selectedHour={hour}
                  onSelect={(d, h) => { setDate(d); setHour(h); }}
                />
              )}
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">{t('create.notes')}</p>
                <span className="text-xs font-mono text-slate-500">{notes.length} / 500</span>
              </div>
              <textarea
                rows={5}
                value={notes}
                onChange={e => setNotes(e.target.value.slice(0, 500))}
                placeholder={t('create.notesPh')}
                className="w-full px-3 py-3 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-200 text-sm outline-none focus:border-indigo-500 transition-colors resize-none"
              />
            </div>
          </div>

          <div>
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white">{t('create.preview')}</h2>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] text-amber-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />{t('status.pending').toLowerCase()}
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-600">
                {date && time ? `${date} · ${time}` : t('create.notSet')}
              </p>
              <p className="text-base font-semibold text-slate-200 mt-2 leading-snug">
                {teacher?.name ?? t('create.noTutor')}
              </p>
              {teacher?.headline && <p className="text-xs text-slate-500 mt-1">{teacher.headline}</p>}
              {subject && (
                <span className="inline-flex mt-2 px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-[11px] text-indigo-300">
                  {subject}
                </span>
              )}
              <hr className="border-slate-800 my-4" />
              <div className="space-y-2.5 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                  {teacher?.price_60 != null ? `€${teacher.price_60} / 60 min` : t('create.priceOnReq')}
                </div>
                {notes && (
                  <div className="text-xs text-slate-400 leading-relaxed line-clamp-4">{notes}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
