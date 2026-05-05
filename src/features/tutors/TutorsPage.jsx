'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Topbar from '@/components/Topbar';
import { listTeachers } from '@/lib/lessons';

export default function TutorsPage() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subject, setSubject] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    let cancelled = false;
    listTeachers()
      .then(data => { if (!cancelled) setTeachers(data); })
      .catch(e   => { if (!cancelled) setError(e.message ?? 'Failed to load tutors.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const subjects = useMemo(() => {
    const set = new Set();
    teachers.forEach(t => (t.subjects ?? []).forEach(s => s?.name && set.add(s.name)));
    return [...set].sort();
  }, [teachers]);

  const filtered = teachers.filter(t => {
    if (subject && !(t.subjects ?? []).some(s => s.name === subject)) return false;
    if (maxPrice && t.price_60 != null && Number(t.price_60) > Number(maxPrice)) return false;
    return true;
  });

  return (
    <>
      <Topbar crumbs={['Find a Tutor']} />
      <div className="p-6 space-y-6">
        <div>
          <p className="text-xs font-mono text-slate-600 uppercase tracking-widest mb-1">Find a Tutor</p>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Find a Tutor</h1>
          <p className="text-slate-500 text-sm mt-1">Browse available teachers and send a lesson request.</p>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
          <div className="grid grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Subject</label>
              <select
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-200 text-sm outline-none appearance-none cursor-pointer"
              >
                <option value="">Any subject</option>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Max price (60 min)</label>
              <div className="flex items-center bg-slate-800/60 border border-slate-700 rounded-lg overflow-hidden focus-within:border-indigo-500 transition-colors">
                <span className="px-2.5 text-slate-500 text-sm">€</span>
                <input
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value.replace(/[^0-9]/g, ''))}
                  className="flex-1 py-2 bg-transparent text-slate-100 text-sm outline-none"
                  placeholder="Any"
                />
              </div>
            </div>
            <button
              onClick={() => { setSubject(''); setMaxPrice(''); }}
              className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-sm hover:bg-slate-700 transition-colors"
            >
              Clear filters
            </button>
          </div>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-600">
            <svg width="40" height="40" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="7" cy="7" r="4"/><path d="M10 10l3 3"/></svg>
            <p className="text-sm mt-3">{teachers.length === 0 ? 'No tutors available yet' : 'No tutors match your filters'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filtered.map(t => {
              const initials = (t.name ?? '?').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
              return (
                <div key={t.id} className="bg-slate-900 rounded-xl border border-slate-800 p-5 flex gap-4">
                  <div className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center text-slate-300 text-sm font-medium shrink-0">
                    {t.photo_url ? <img src={t.photo_url} alt={t.name ?? ''} className="w-full h-full object-cover" /> : initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-white truncate">{t.name ?? 'Unnamed tutor'}</p>
                    {t.headline && <p className="text-xs text-slate-400 truncate mt-0.5">{t.headline}</p>}
                    {(t.subjects?.length ?? 0) > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {t.subjects.filter(s => s.name).slice(0, 3).map((s, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-[10px] text-indigo-300">
                            {s.name}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-xs text-slate-500">
                        {t.price_60 != null ? <><span className="text-slate-200 font-semibold">€{t.price_60}</span> / 60 min</> : 'Price on request'}
                      </p>
                      <Link
                        href={`/lessons/create?teacherId=${t.id}`}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-500 transition-colors"
                      >
                        Request lesson
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
