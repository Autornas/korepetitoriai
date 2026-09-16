'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { getLessonRating, rateLesson } from '@/lib/api/lessons';
import Stars from '@/features/dashboard/Stars';

/**
 * Star rating for a finished lesson.
 *
 * `canRate` comes from the server rather than being re-derived here. The
 * window depends on the lesson timezone (see src/server/services/schedule.js)
 * and on the lesson not having been cancelled; deciding it in the browser
 * would mean two rules that can disagree, and the browser's clock is not
 * evidence anyway — the API and the RLS policy both check again.
 *
 * Renders nothing at all until the server says there is something to show, so
 * a teacher and a student in a still-upcoming lesson simply never see it.
 */
export default function RateLessonSection({ lesson, perspective }) {
  const { t } = useLanguage();
  const [state, setState] = useState(null); // { rating, canRate }
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    getLessonRating(lesson.id, { signal: controller.signal })
      .then((data) => {
        setState(data);
        if (data?.rating) {
          setStars(data.rating.stars);
          setComment(data.rating.comment ?? '');
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, [lesson.id]);

  if (!state) return null;

  const existing = state.rating;
  const isStudent = perspective === 'student';

  // Teacher's view: the rating they were given, once it exists.
  if (!isStudent) {
    if (!existing) return null;
    return (
      <div className="mt-4 p-3 rounded-lg border border-[#EADFCB] bg-[#F4ECDF]">
        <p className="text-[10px] font-mono uppercase tracking-widest text-[#8A7556] mb-2">
          {t('rating.studentRated')}
        </p>
        <div className="flex items-center gap-2">
          <Stars value={existing.stars} size={18} />
          <span className="text-sm font-semibold text-[#2A1F14]">{existing.stars}/5</span>
        </div>
        {existing.comment && (
          <p className="text-xs text-[#5A4A38] mt-2 whitespace-pre-wrap">{existing.comment}</p>
        )}
      </div>
    );
  }

  // Student's view: nothing to do if the lesson has not finished and they
  // have not already rated it.
  if (!state.canRate && !existing) return null;

  const submit = async () => {
    if (!stars || saving) return;
    setSaving(true);
    setError('');
    try {
      const row = await rateLesson(lesson.id, {
        stars,
        comment: comment.trim() || null,
      });
      setState((s) => ({ ...s, rating: row }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e.message ?? t('rating.failed'));
    } finally {
      setSaving(false);
    }
  };

  const changed = !existing || existing.stars !== stars || (existing.comment ?? '') !== comment.trim();

  return (
    <div className="mt-4 p-3 rounded-lg border border-[#EADFCB] bg-[#F4ECDF]">
      <p className="text-[10px] font-mono uppercase tracking-widest text-[#8A7556] mb-2">
        {existing ? t('rating.yourRating') : t('rating.rateThis')}
      </p>

      {error && (
        <div className="mb-2 px-3 py-2 rounded-lg bg-[#F4D9D5] border border-[#E0A89F] text-[#7A3A33] text-xs">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Stars value={stars} onChange={setStars} size={24} label={t('rating.rateThis')} />
        {stars > 0 && <span className="text-sm text-[#5A4A38]">{stars}/5</span>}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value.slice(0, 1000))}
        rows={2}
        placeholder={t('rating.commentPlaceholder')}
        className="mt-2 w-full px-3 py-2 rounded-lg bg-[#FFFDF8] border border-[#DCC9A8] text-[#2A1F14] text-xs outline-none focus:border-[#C8654A] transition-colors resize-none"
      />

      <button
        type="button"
        disabled={!stars || saving || !changed}
        onClick={submit}
        className="mt-2 w-full px-3 py-1.5 rounded-lg bg-[#7A8C5C] text-white text-xs font-medium hover:bg-[#677A4D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? t('common.saving') : saved ? t('common.saved') : existing ? t('rating.update') : t('rating.submit')}
      </button>

      <p className="text-[10px] text-[#8A7556] mt-1.5 text-center">
        {t('rating.visibleToTutor')}
        {existing ? ` ${t('rating.canChange')}` : ''}
      </p>
    </div>
  );
}
