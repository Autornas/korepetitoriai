'use client';

import { useState } from 'react';
import Topbar from './components/Topbar';

export default function CreateLessonPage() {
  const [hasMeet, setHasMeet] = useState(false);
  const [hasBoard, setHasBoard] = useState(false);
  const [notify, setNotify] = useState(false);
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
            <p className="text-xs font-mono text-slate-600 uppercase tracking-widest mb-1">New Lesson</p>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Create a Lesson</h1>
            <p className="text-slate-500 text-sm mt-1">Schedule a new lesson.</p>
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
                  <input className="w-full px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-100 text-sm outline-none focus:border-indigo-500 transition-colors" placeholder="e.g. Quadratic equations — discriminant" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5">Student</label>
                    <input className="w-full px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-200 text-sm outline-none focus:border-indigo-500 transition-colors" placeholder="Search student…" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5">Subject</label>
                    <select className="w-full px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-200 text-sm outline-none appearance-none">
                      <option value="">Select subject</option>
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
                  <input type="date" className="w-full px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-200 text-sm outline-none focus:border-indigo-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5">Time</label>
                  <input type="time" className="w-full px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-200 text-sm outline-none focus:border-indigo-500 transition-colors" />
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
                    <span className="text-xs font-mono text-slate-500 flex-1">Link will appear after generating</span>
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
                  <div className="p-4 bg-slate-800/20 min-h-[120px] text-sm text-slate-600">
                    Start typing your lesson notes…
                  </div>
                </div>
              )}
            </div>

            {/* Notify */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
              <label className="flex items-start gap-3 cursor-pointer" onClick={() => setNotify(!notify)}>
                <span className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors ${notify ? 'bg-indigo-600' : 'border border-slate-700'}`}>
                  {notify && <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 8.5L6.5 12 13 4.5"/></svg>}
                </span>
                <div>
                  <p className="text-sm font-medium text-white">Notify student by email</p>
                  <p className="text-xs text-slate-500 mt-0.5">The student will receive an email with lesson details and the Meet link.</p>
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
              <p className="text-[10px] font-mono text-slate-600">Date and time not set</p>
              <p className="text-base font-semibold text-slate-500 mt-2 leading-snug">No topic yet</p>
              <hr className="border-slate-800 my-4" />
              <div className="space-y-2.5 text-sm text-slate-500">
                <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-700" />No student selected</div>
                <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-700" />{duration} min</div>
                {hasMeet && <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-600" />Google Meet</div>}
                {hasBoard && <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-600" />Digital whiteboard</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
