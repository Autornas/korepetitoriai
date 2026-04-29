'use client';

import { useState } from 'react';
import Topbar from './components/Topbar';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8);

export default function ProfilePage() {
  const [avail, setAvail] = useState(new Set());

  const toggle = (d, h) => {
    const k = `${d}-${h}`;
    const ns = new Set(avail);
    ns.has(k) ? ns.delete(k) : ns.add(k);
    setAvail(ns);
  };

  return (
    <>
      <Topbar crumbs={['Profile Settings']} />
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-mono text-slate-600 uppercase tracking-widest mb-1">Profile Settings</p>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Profile Settings</h1>
            <p className="text-slate-500 text-sm mt-1">Complete your profile so students can find and book you.</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-sm hover:bg-slate-800 transition-colors">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z"/><circle cx="8" cy="8" r="2"/></svg>
              Preview Profile
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-500 transition-colors">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8.5L6.5 12 13 4.5"/></svg>
              Save Changes
            </button>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_260px] gap-4">
          <div className="space-y-4">
            {/* Basic info */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
              <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mb-1">01 — Basic Information</p>
              <div className="grid grid-cols-[120px_1fr] gap-5 mt-4">
                <div>
                  <p className="text-xs text-slate-500 mb-2">Photo</p>
                  <div className="w-[120px] h-[120px] rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-600 text-xs">1:1</div>
                  <button className="mt-2 w-full text-xs px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700 transition-colors">Upload photo</button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5">Full name</label>
                    <input className="w-full px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-100 text-sm outline-none focus:border-indigo-500 transition-colors" placeholder="Your full name" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5">Headline</label>
                    <input className="w-full px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-100 text-sm outline-none focus:border-indigo-500 transition-colors" placeholder="e.g. Mathematics teacher · 8 years experience" />
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
              <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mb-4">02 — Pricing</p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Price per lesson (60 min)', suffix: '/ 60 min' },
                  { label: '90 min lesson', suffix: '/ 90 min' },
                  { label: 'Intro lesson', suffix: 'free' },
                ].map((p, i) => (
                  <div key={i}>
                    <label className="block text-xs text-slate-500 mb-1.5">{p.label}</label>
                    <div className="flex items-center bg-slate-800/60 border border-slate-700 rounded-lg overflow-hidden focus-within:border-indigo-500 transition-colors">
                      <span className="px-2.5 text-slate-500 text-sm">€</span>
                      <input className="flex-1 py-2 bg-transparent text-slate-100 text-sm outline-none min-w-0" placeholder="0" />
                      <span className="px-2.5 text-slate-600 text-xs font-mono">{p.suffix}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Subjects */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">03 — Subjects & Modules</p>
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 text-xs hover:bg-slate-700 transition-colors">
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3v10M3 8h10"/></svg>
                  Add subject
                </button>
              </div>
              <div className="flex flex-col items-center justify-center py-6 text-slate-600">
                <p className="text-xs">No subjects added yet</p>
              </div>
              <div className="mt-4">
                <p className="text-xs text-slate-500 mb-2">Topic tags</p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-1 text-xs text-slate-600">+ add…</span>
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">04 — Availability</p>
                <div className="flex bg-slate-800 rounded-lg p-0.5">
                  <button className="px-3 py-1 rounded-md text-xs text-white bg-slate-700">Week</button>
                  <button className="px-3 py-1 rounded-md text-xs text-slate-400">Month</button>
                </div>
              </div>
              <p className="text-xs text-slate-600 mb-4 mt-2">Click cells to mark when you're free. Students can only book in marked slots.</p>
              <div className="overflow-x-auto">
                <div className="grid" style={{ gridTemplateColumns: '40px repeat(7, 1fr)', minWidth: 480 }}>
                  <div className="h-7" />
                  {DAYS.map(d => (
                    <div key={d} className="h-7 text-[10px] font-mono text-slate-500 flex items-center justify-center">{d}</div>
                  ))}
                  {HOURS.map(h => (
                    <>
                      <div key={`h-${h}`} className="text-[9px] font-mono text-slate-600 flex items-center justify-end pr-1.5" style={{ height: 28 }}>
                        {String(h).padStart(2, '0')}:00
                      </div>
                      {DAYS.map((_, d) => {
                        const k = `${d}-${h}`;
                        const on = avail.has(k);
                        return (
                          <button key={`c-${h}-${d}`} onClick={() => toggle(d, h)}
                            className={`border border-slate-800 transition-colors ${on ? 'bg-indigo-500/30 hover:bg-indigo-500/40' : 'hover:bg-slate-800'}`}
                            style={{ height: 28 }} />
                        );
                      })}
                    </>
                  ))}
                </div>
              </div>
              <div className="flex gap-5 mt-3 text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm bg-indigo-500/40" />Free</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm bg-slate-800 border border-slate-700" />Busy</span>
                <span className="ml-auto font-mono text-slate-600 text-[10px]">Timezone: Europe/Vilnius</span>
              </div>
            </div>

            {/* Bio */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">05 — About You</p>
                <span className="text-xs font-mono text-slate-500">0 / 800</span>
              </div>
              <textarea className="w-full px-3 py-3 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-200 text-sm outline-none focus:border-indigo-500 transition-colors resize-none" rows={7}
                placeholder="Introduce yourself — your experience, teaching style, and what students can expect from your lessons." />
            </div>
          </div>

          {/* Preview */}
          <div>
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white">Public Preview</h2>
                <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-full bg-slate-800 border border-slate-700 text-slate-400">
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z"/><circle cx="8" cy="8" r="2"/></svg>
                  live
                </span>
              </div>
              <div className="aspect-video bg-slate-800 rounded-lg border border-slate-700 flex items-center justify-center text-slate-600 text-xs mb-4">photo · 16:9</div>
              <p className="text-base font-semibold text-slate-500">Your name</p>
              <p className="text-xs text-slate-600 mt-1">Headline appears here</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-600">No subjects yet</span>
              </div>
              <hr className="border-slate-800 my-4" />
              <div className="flex justify-between">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">Price</p>
                  <p className="text-lg font-semibold text-slate-600 mt-1">— <span className="text-xs font-normal text-slate-600">/ 60 min</span></p>
                </div>
              </div>
              <button className="mt-4 w-full py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-colors">Book a Lesson</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
