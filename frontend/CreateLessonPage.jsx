'use client';

import { useState } from 'react';
import Topbar from './components/Topbar';

export default function CreateLessonPage() {
  const [hasMeet, setHasMeet] = useState(true);
  const [hasBoard, setHasBoard] = useState(true);
  const [notify, setNotify] = useState(true);
  const [duration, setDuration] = useState(60);

  const Toggle = ({ on, setOn }) => (
    <button onClick={() => setOn(!on)} className={`w-8 h-4 rounded-full transition-colors relative ${on ? 'bg-indigo-600' : 'bg-slate-700'}`}>
      <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </button>
  );

  return (
    <>
      <Topbar crumbs={['New Lesson']} />
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-mono text-slate-600 uppercase tracking-widest mb-1">05 / New Lesson</p>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Create a Lesson</h1>
            <p className="text-slate-500 text-sm mt-1">Schedule a new lesson and attach materials.</p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-sm hover:bg-slate-800 transition-colors">Save Draft</button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-500 transition-colors">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8.5L6.5 12 13 4.5"/></svg>
              Create Lesson
            </button>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_300px] gap-4">
          <div className="space-y-4">
            {/* Topic */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
              <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mb-4">01 — Topic & Context</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5">Lesson topic</label>
                  <input className="w-full px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-100 text-sm outline-none focus:border-indigo-500 transition-colors" defaultValue="Quadratic equations — discriminant" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5">Student</label>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700 cursor-pointer hover:border-slate-600 transition-colors">
                      <div className="w-5 h-5 rounded-full bg-indigo-700 flex items-center justify-center text-white text-[9px] font-semibold shrink-0">LJ</div>
                      <span className="text-sm text-slate-200 flex-1">Lukas Jonaitis</span>
                      <span className="text-[10px] font-mono text-slate-600">Gr. 10 · 12 lessons</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5">Subject</label>
                    <select className="w-full px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-200 text-sm outline-none appearance-none">
                      <option>Mathematics</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
              <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mb-4">02 — Date & Time</p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5">Date</label>
                  <input className="w-full px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-200 text-sm outline-none focus:border-indigo-500 transition-colors" defaultValue="2026-05-08 (Friday)" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5">Time</label>
                  <input className="w-full px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-200 text-sm outline-none focus:border-indigo-500 transition-colors" defaultValue="14:00" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5">Duration</label>
                  <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700">
                    {[45, 60, 90].map(d => (
                      <button key={d} onClick={() => setDuration(d)} className={`flex-1 py-1.5 rounded-md text-xs transition-colors ${duration === d ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
                        {d} min
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-3 px-3 py-3 bg-green-500/5 border border-green-500/20 rounded-lg">
                <span className="text-green-400 text-xs font-semibold shrink-0">✓</span>
                <p className="text-xs text-slate-400">This time matches your free slots and Lukas's schedule. <strong className="text-slate-200">No conflicts found.</strong></p>
              </div>
            </div>

            {/* Meeting link */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">03 — Meeting Link</p>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs text-slate-400">Enable</span>
                  <Toggle on={hasMeet} setOn={setHasMeet} />
                </label>
              </div>
              {hasMeet && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-3 py-3 bg-slate-800/50 border border-slate-700 rounded-lg">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0">
                      <span className="font-mono text-[10px] font-bold text-emerald-700">M</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Google Meet</p>
                      <p className="text-[10px] font-mono text-slate-500">Auto-generated link · requires Google account</p>
                    </div>
                    <button className="ml-auto px-3 py-1.5 rounded-lg bg-slate-700 border border-slate-600 text-slate-300 text-xs hover:bg-slate-600 transition-colors">Generate</button>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg">
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" className="text-slate-500 shrink-0"><path d="M7 9l2-2m-1.5 4l-2 2a2.5 2.5 0 01-3.5-3.5l2-2M9.5 4l2-2a2.5 2.5 0 013.5 3.5l-2 2"/></svg>
                    <span className="text-xs font-mono text-slate-400 flex-1">meet.google.com/xqp-mvtk-fjz</span>
                    <button className="px-2 py-1 rounded-md bg-slate-700 border border-slate-600 text-slate-400 text-xs">Copy</button>
                  </div>
                </div>
              )}
            </div>

            {/* Whiteboard */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">04 — Digital Whiteboard</p>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs text-slate-400">Enable board</span>
                  <Toggle on={hasBoard} setOn={setHasBoard} />
                </label>
              </div>
              {hasBoard && (
                <div className="border border-slate-700 rounded-lg overflow-hidden">
                  <div className="flex items-center gap-1 px-3 py-2 border-b border-slate-700 bg-slate-800/50">
                    {['B', 'I', '—', '≡', '⊞'].map((ic, i) => (
                      <button key={i} className={`px-2 py-1 rounded text-xs ${ic === '—' ? 'text-slate-700 px-0.5' : 'text-slate-400 hover:bg-slate-700 hover:text-white transition-colors'}`}>{ic}</button>
                    ))}
                    <span className="ml-auto text-[10px] font-mono text-slate-600">∑ math formulas</span>
                    <span className="ml-3 px-2 py-0.5 rounded-full bg-slate-700 text-[10px] text-slate-400">real-time collaboration</span>
                  </div>
                  <div className="p-4 bg-slate-800/20 min-h-[120px] text-sm">
                    <p className="font-semibold text-white"># Discriminant</p>
                    <p className="mt-2 text-slate-300">Quadratic equation <code className="font-mono text-indigo-300 text-xs">ax² + bx + c = 0</code> discriminant:</p>
                    <div className="mt-3 px-3 py-2 bg-slate-800 rounded-lg font-mono text-indigo-400 text-sm">D = b² – 4ac</div>
                    <p className="mt-3 text-slate-500 text-xs">Examples in lesson: x² – 5x + 6 = 0; 2x² + 3x – 2 = 0…</p>
                  </div>
                </div>
              )}
            </div>

            {/* Materials */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">05 — Materials</p>
                <div className="flex gap-2">
                  <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 text-xs hover:bg-slate-700 transition-colors">
                    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3v10M3 8h10"/></svg>Add file
                  </button>
                  <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 text-xs hover:bg-slate-700 transition-colors">
                    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M7 9l2-2m-1.5 4l-2 2a2.5 2.5 0 01-3.5-3.5l2-2M9.5 4l2-2a2.5 2.5 0 013.5 3.5l-2 2"/></svg>Add link
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { ext: 'PDF', name: 'Quadratic equations — theory.pdf', size: '1.2 MB' },
                  { ext: 'PPTX', name: 'Discriminant — slides.pptx', size: '4.8 MB' },
                  { ext: 'URL', name: 'Khan Academy: Quadratic formula', size: 'link' },
                ].map((m, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-slate-800/40 rounded-lg border border-slate-800">
                    <span className="px-1.5 py-0.5 rounded bg-slate-700 text-[9px] font-mono font-semibold text-slate-300 shrink-0">{m.ext}</span>
                    <span className="flex-1 text-sm text-slate-300 truncate">{m.name}</span>
                    <span className="text-[10px] font-mono text-slate-600">{m.size}</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] text-slate-400">visible</span>
                    <button className="text-slate-600 hover:text-slate-400 transition-colors">
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M4 4l8 8M12 4l-8 8"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Notify */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
              <label className="flex items-start gap-3 cursor-pointer" onClick={() => setNotify(!notify)}>
                <span className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors ${notify ? 'bg-indigo-600' : 'border border-slate-700'}`}>
                  {notify && <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 8.5L6.5 12 13 4.5"/></svg>}
                </span>
                <div>
                  <p className="text-sm font-medium text-white">Notify student by email</p>
                  <p className="text-xs text-slate-500 mt-0.5">Lukas will receive an email with lesson details and the Meet link immediately.</p>
                </div>
              </label>
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white">Lesson Preview</h2>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-xs text-indigo-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />draft
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-600">2026-05-08 · 14:00 – {duration === 60 ? '15:00' : duration === 90 ? '15:30' : '14:45'}</p>
              <p className="text-base font-semibold text-white mt-2 leading-snug">Quadratic equations — discriminant</p>
              <hr className="border-slate-800 my-4" />
              <div className="space-y-2.5 text-sm text-slate-400">
                <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-600" />Lukas Jonaitis · Gr. 10</div>
                <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-600" />{duration} min</div>
                {hasMeet && <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-600" />Google Meet</div>}
                {hasBoard && <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-600" />Digital whiteboard</div>}
                <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-600" />3 materials attached</div>
              </div>
              <hr className="border-slate-800 my-4" />
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-500">Payment</span>
                <span className="text-base font-semibold text-white">€35</span>
              </div>
              <div className="flex justify-between items-baseline mt-1">
                <span className="text-xs text-slate-600">Collected after lesson</span>
                <span className="text-[10px] font-mono text-slate-600">automatic</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
