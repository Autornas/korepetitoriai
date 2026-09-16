'use client';

import { useEffect, useMemo, useState } from 'react';
import Topbar from '@/components/Topbar';
import { useLanguage } from '@/components/LanguageProvider';
import { listTeacherStats } from '@/lib/api/stats';
import { getBilling, saveBilling } from '@/lib/api/billing';
import EarningsPanel, { money } from '@/features/dashboard/EarningsPanel';
import Stars from '@/features/dashboard/Stars';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8);

const card = 'bg-[#FFFDF8] rounded-xl border border-[#EADFCB] p-5';
const input =
  'w-full px-3 py-2 rounded-lg bg-[#F4ECDF]/60 border border-[#DCC9A8] text-[#2A1F14] text-sm outline-none focus:border-[#C8654A] transition-colors';

/**
 * Read-only mirror of the availability grid on the teacher's own profile.
 *
 * Teachers already mark the hours they can teach there; showing an admin the
 * same grid is what lets a slot be agreed and handed over without a round of
 * messages. Same `"<dayIndex>-<hour>"` keys the profile writes.
 */
function AvailabilityGrid({ slots }) {
  const set = useMemo(() => new Set(slots ?? []), [slots]);
  if (set.size === 0) return null;

  return (
    <div className="overflow-x-auto">
      <div className="grid" style={{ gridTemplateColumns: '34px repeat(7, 1fr)', minWidth: 340 }}>
        <div className="h-5" />
        {DAYS.map((d) => (
          <div key={d} className="h-5 text-[9px] font-mono text-[#8A7556] flex items-center justify-center">
            {d}
          </div>
        ))}
        {HOURS.map((h) => (
          <div key={h} className="contents">
            <div
              className="text-[8px] font-mono text-[#8A7556] flex items-center justify-end pr-1"
              style={{ height: 14 }}
            >
              {String(h).padStart(2, '0')}
            </div>
            {DAYS.map((day, d) => (
              <div
                key={`${h}-${day}`}
                className={`border border-[#EADFCB] ${set.has(`${d}-${h}`) ? 'bg-[#7A8C5C]/40' : ''}`}
                style={{ height: 14 }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function TeacherCard({ teacher }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  const initials = (teacher.name ?? '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={card}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 text-left"
      >
        <div className="w-10 h-10 rounded-full bg-[#F4ECDF] flex items-center justify-center text-[#5A4A38] text-xs font-medium shrink-0 overflow-hidden">
          {teacher.photo_url ? (
            <img src={teacher.photo_url} alt="" className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#2A1F14] truncate">{teacher.name ?? '—'}</p>
          <p className="text-[11px] text-[#8A7556] truncate">{teacher.email}</p>
        </div>

        <div className="hidden sm:flex items-center gap-5 shrink-0 mr-2">
          <div className="text-right">
            <p className="text-[9px] font-mono uppercase tracking-widest text-[#8A7556]">
              {t('stats.taught')}
            </p>
            <p className="text-sm font-semibold text-[#2A1F14]">{teacher.lessons.taught}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-mono uppercase tracking-widest text-[#8A7556]">
              {t('stats.earned')}
            </p>
            <p className="text-sm font-semibold text-[#2A1F14]">
              {money(teacher.earnings.earned, teacher.earnings.currency)}
            </p>
          </div>
          <div className="text-right min-w-[68px]">
            <p className="text-[9px] font-mono uppercase tracking-widest text-[#8A7556]">
              {t('stats.rating')}
            </p>
            {teacher.rating.count === 0 ? (
              <p className="text-sm text-[#B5A07F]">—</p>
            ) : (
              <p className="text-sm font-semibold text-[#2A1F14] flex items-center gap-1 justify-end">
                {teacher.rating.average.toFixed(1)}
                <Stars value={teacher.rating.average} size={11} />
              </p>
            )}
          </div>
        </div>

        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className={`text-[#8A7556] shrink-0 transition-transform ${open ? 'rotate-90' : ''}`}
        >
          <title>{open ? t('common.collapse') : t('common.expand')}</title>
          <path d="M6 4l4 4-4 4" />
        </svg>
      </button>

      {open && (
        <div className="mt-5 space-y-5">
          <EarningsPanel stats={teacher} compact />

          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#8A7556] mb-2">
              {t('admin.availability')}
            </p>
            {teacher.availability.length === 0 ? (
              <p className="text-xs text-[#8A7556]">{t('admin.noAvailability')}</p>
            ) : (
              <div className="max-w-md">
                <AvailabilityGrid slots={teacher.availability} />
                <p className="text-[10px] font-mono text-[#8A7556] mt-2">Europe/Vilnius</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function BillingCard() {
  const { t } = useLanguage();
  const [form, setForm] = useState({ iban: '', holder: '', bank_name: '', note: '' });
  const [status, setStatus] = useState('idle'); // idle | saving | saved | error
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    getBilling({ signal: controller.signal })
      .then((b) =>
        setForm({
          iban: b?.iban ?? '',
          holder: b?.holder ?? '',
          bank_name: b?.bank_name ?? '',
          note: b?.note ?? '',
        }),
      )
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = async () => {
    setStatus('saving');
    setError('');
    try {
      const saved = await saveBilling({
        iban: form.iban.trim() || null,
        holder: form.holder.trim() || null,
        bank_name: form.bank_name.trim() || null,
        note: form.note.trim() || null,
      });
      // The server normalises the IBAN (spaces stripped, upper-cased), so show
      // what was actually stored rather than what was typed.
      setForm({
        iban: saved?.iban ?? '',
        holder: saved?.holder ?? '',
        bank_name: saved?.bank_name ?? '',
        note: saved?.note ?? '',
      });
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (e) {
      setError(e.message ?? t('admin.billingFailed'));
      setStatus('error');
    }
  };

  return (
    <div className={card}>
      <h2 className="text-sm font-semibold text-[#2A1F14]">{t('admin.billingTitle')}</h2>
      <p className="text-xs text-[#8A7556] mt-1 mb-4">{t('admin.billingSub')}</p>

      {error && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-[#F4D9D5] border border-[#E0A89F] text-[#7A3A33] text-xs">
          {error}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <div className="md:col-span-2">
          <label htmlFor="billing-iban" className="block text-xs text-[#8A7556] mb-1.5">
            {t('admin.iban')}
          </label>
          <input
            id="billing-iban"
            value={form.iban}
            onChange={set('iban')}
            placeholder="LT00 0000 0000 0000 0000"
            className={`${input} font-mono`}
          />
        </div>
        <div>
          <label htmlFor="billing-holder" className="block text-xs text-[#8A7556] mb-1.5">
            {t('admin.holder')}
          </label>
          <input id="billing-holder" value={form.holder} onChange={set('holder')} className={input} />
        </div>
        <div>
          <label htmlFor="billing-bank" className="block text-xs text-[#8A7556] mb-1.5">
            {t('admin.bankName')}
          </label>
          <input id="billing-bank" value={form.bank_name} onChange={set('bank_name')} className={input} />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="billing-note" className="block text-xs text-[#8A7556] mb-1.5">
            {t('admin.note')}
          </label>
          <input
            id="billing-note"
            value={form.note}
            onChange={set('note')}
            placeholder={t('admin.notePh')}
            className={input}
          />
        </div>
      </div>

      <button
        type="button"
        disabled={status === 'saving'}
        onClick={save}
        className="mt-4 px-4 py-2 rounded-lg bg-[#C8654A] text-white text-sm font-medium hover:bg-[#B0533A] transition-colors disabled:opacity-50"
      >
        {status === 'saving'
          ? t('common.saving')
          : status === 'saved'
            ? t('common.saved')
            : t('common.save')}
      </button>
    </div>
  );
}

/**
 * Admin overview.
 *
 * Hidden from the sidebar unless /api/auth/session says isAdmin, but that is
 * cosmetic — every endpoint behind this page runs `requireAdmin` server-side,
 * so landing here directly just produces 403s.
 */
export default function AdminOverviewPage() {
  const { t } = useLanguage();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    listTeacherStats({ signal: controller.signal })
      .then(setTeachers)
      .catch((e) => {
        if (e?.name !== 'AbortError') setError(e.message ?? t('admin.loadFailed'));
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [t]);

  const totals = useMemo(
    () =>
      teachers.reduce(
        (acc, x) => ({
          taught: acc.taught + x.lessons.taught,
          earned: acc.earned + x.earnings.earned,
          outstanding: acc.outstanding + x.earnings.outstanding,
        }),
        { taught: 0, earned: 0, outstanding: 0 },
      ),
    [teachers],
  );

  return (
    <>
      <Topbar crumbs={[t('admin.crumb')]} />
      <div className="p-6 space-y-6">
        <div>
          <p className="text-xs font-mono text-[#8A7556] uppercase tracking-widest mb-1">
            {t('admin.kicker')}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-[#2A1F14]">
            {t('admin.title')}
          </h1>
          <p className="text-[#8A7556] text-sm mt-1">{t('admin.subtitle')}</p>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-lg bg-[#F4D9D5] border border-[#E0A89F] text-[#7A3A33] text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-5 h-5 rounded-full border-2 border-[#C8654A] border-t-transparent animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={card}>
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#8A7556]">
                  {t('admin.totalTeachers')}
                </p>
                <p className="text-2xl font-semibold text-[#2A1F14] mt-1">{teachers.length}</p>
              </div>
              <div className={card}>
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#8A7556]">
                  {t('admin.totalTaught')}
                </p>
                <p className="text-2xl font-semibold text-[#2A1F14] mt-1">{totals.taught}</p>
              </div>
              <div className={card}>
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#8A7556]">
                  {t('admin.totalEarned')}
                </p>
                <p className="text-2xl font-semibold text-[#2A1F14] mt-1">{money(totals.earned)}</p>
              </div>
              <div className={card}>
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#8A7556]">
                  {t('admin.totalOutstanding')}
                </p>
                <p className="text-2xl font-semibold text-[#8A6418] mt-1">
                  {money(totals.outstanding)}
                </p>
              </div>
            </div>

            <BillingCard />

            <div>
              <h2 className="text-sm font-semibold text-[#2A1F14] mb-1">{t('admin.teachers')}</h2>
              <p className="text-xs text-[#8A7556] mb-3">{t('admin.teachersSub')}</p>
              {teachers.length === 0 ? (
                <p className={`${card} text-sm text-[#8A7556]`}>{t('admin.noTeachers')}</p>
              ) : (
                <div className="space-y-3">
                  {teachers.map((teacher) => (
                    <TeacherCard key={teacher.id} teacher={teacher} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
