'use client';

import { useLanguage } from '@/components/LanguageProvider';
import Stars from './Stars';

export function money(amount, currency = 'EUR') {
  const n = Number(amount ?? 0);
  const symbol = currency === 'EUR' ? '€' : '';
  return `${symbol}${n.toFixed(2)}`;
}

function Stat({ label, value, hint, tone = 'plain' }) {
  const valueTone =
    tone === 'good' ? 'text-[#4F5F36]' : tone === 'warn' ? 'text-[#8A6418]' : 'text-[#2A1F14]';
  return (
    <div className="bg-[#FFFDF8] rounded-xl border border-[#EADFCB] p-5">
      <p className="text-[10px] font-mono uppercase tracking-widest text-[#8A7556]">{label}</p>
      <p className={`text-2xl font-semibold mt-1 ${valueTone}`}>{value}</p>
      {hint && <p className="text-[11px] text-[#8A7556] mt-1">{hint}</p>}
    </div>
  );
}

/**
 * A teacher's lessons, money and rating.
 *
 * Used twice: on the teacher's own dashboard and, per teacher, on the admin
 * overview — so the two can never drift into telling different stories about
 * the same numbers.
 *
 * "Earned" counts every lesson that went ahead; "received" counts the subset
 * confirmed paid. Keeping them apart is the point: one number that silently
 * mixed "taught" with "was paid for" would hide exactly the gap a teacher
 * needs to see.
 */
export default function EarningsPanel({ stats, compact = false }) {
  const { t } = useLanguage();
  if (!stats) return null;

  const { lessons, earnings, rating } = stats;
  const currency = earnings?.currency ?? 'EUR';

  return (
    <div className="space-y-3">
      <div className={`grid gap-4 ${compact ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 lg:grid-cols-4'}`}>
        <Stat
          label={t('stats.taught')}
          value={lessons.taught}
          hint={t('stats.taughtHint')}
        />
        <Stat
          label={t('stats.earned')}
          value={money(earnings.earned, currency)}
          hint={t('stats.earnedHint')}
        />
        <Stat
          label={t('stats.received')}
          value={money(earnings.received, currency)}
          tone="good"
          hint={t('stats.receivedHint')}
        />
        <Stat
          label={t('stats.outstanding')}
          value={money(earnings.outstanding, currency)}
          tone={earnings.outstanding > 0 ? 'warn' : 'plain'}
          hint={t('stats.outstandingHint')}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#FFFDF8] rounded-xl border border-[#EADFCB] p-5">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#8A7556]">
            {t('stats.rating')}
          </p>
          {rating.count === 0 ? (
            <p className="text-sm text-[#8A7556] mt-2">{t('stats.noRatings')}</p>
          ) : (
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-semibold text-[#2A1F14]">
                {rating.average.toFixed(1)}
              </span>
              <Stars value={rating.average} size={15} />
              <span className="text-[11px] font-mono text-[#8A7556]">
                {t('stats.ofReviews').replace('{n}', rating.count)}
              </span>
            </div>
          )}
        </div>

        <Stat label={t('stats.upcoming')} value={lessons.upcoming} hint={t('stats.upcomingHint')} />
      </div>

      {lessons.unpriced > 0 && (
        <p className="text-[11px] text-[#8A6418] bg-[#FBEAC9] border border-[#EBC988] rounded-lg px-3 py-2">
          {t('stats.unpricedWarning').replace('{n}', lessons.unpriced)}
        </p>
      )}
    </div>
  );
}
