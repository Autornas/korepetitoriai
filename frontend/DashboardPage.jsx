import Topbar from './components/Topbar';
import Link from 'next/link';

const stats = [
  { label: 'Lessons this week', value: '14', bars: [2, 3, 1, 4, 3, 1, 0] },
  { label: 'Active students', value: '23', sub: '+2 this month' },
  { label: 'New messages', value: '5', sub: '3 from students · 2 system' },
  { label: 'Earnings this month', value: '€820', sub: '+12% vs April' },
];

const upcoming = [
  { title: 'Quadratic equations — intro', student: 'Lukas Jonaitis · Gr. 10', when: 'Today · 14:00', dot: 'bg-indigo-500', status: 'upcoming' },
  { title: 'Functions, properties', student: 'Emilija Petraitytė · Gr. 11', when: 'Today · 16:30', dot: 'bg-green-500', status: 'confirmed' },
  { title: 'Trigonometry — review', student: 'Mantas Vaičiulis · Gr. 12', when: 'Tomorrow · 09:00', dot: 'bg-green-500', status: 'confirmed' },
  { title: 'Statistics and probability', student: 'Ugnė Stankutė · Gr. 11', when: 'Friday · 11:00', dot: 'bg-amber-500', status: 'pending' },
];

const students = [
  { initials: 'LJ', name: 'Lukas Jonaitis', grade: 'Gr. 10', subj: 'Mathematics', lessons: 12, last: '2 days ago' },
  { initials: 'EP', name: 'Emilija Petraitytė', grade: 'Gr. 11', subj: 'Mathematics', lessons: 8, last: 'yesterday' },
  { initials: 'MV', name: 'Mantas Vaičiulis', grade: 'Gr. 12', subj: 'VBE Math', lessons: 24, last: 'today' },
  { initials: 'US', name: 'Ugnė Stankutė', grade: 'Gr. 11', subj: 'Mathematics', lessons: 5, last: '4 days ago' },
  { initials: 'AK', name: 'Augustė Kavaliauskaitė', grade: 'Gr. 9', subj: 'Mathematics', lessons: 18, last: 'yesterday' },
  { initials: 'TB', name: 'Tomas Bagdonas', grade: 'Gr. 12', subj: 'VBE Math', lessons: 16, last: '3 days ago' },
];

const notifications = [
  { dot: 'bg-indigo-500', title: 'New student: Tomas Bagdonas', sub: 'Registered for "VBE Mathematics"', when: '2h ago' },
  { dot: 'bg-green-500', title: 'Lesson booked', sub: 'Lukas booked 14:00 lesson today', when: '5h ago' },
  { dot: null, title: 'Payment received', sub: '€45 · Emilija Petraitytė', when: 'yesterday' },
  { dot: 'bg-amber-500', title: 'Lesson cancelled', sub: 'Mantas cancelled Wednesday lesson', when: 'yesterday' },
  { dot: null, title: 'New review', sub: '"Great teacher, explains everything clearly."', when: '2 days ago' },
];

const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
const events = [
  { s: 9, e: 10, title: 'Quadratic equations — intro', who: 'Lukas J. · Gr. 10', alt: false },
  { s: 11, e: 12, title: 'Functions — graphs', who: 'Augustė K. · Gr. 9', alt: true },
  { s: 14, e: 15, title: 'Quadratic equations II', who: 'Lukas J. · Gr. 10', alt: false },
  { s: 16.5, e: 17.5, title: 'Probability', who: 'Emilija P. · Gr. 11', alt: true },
];
const START = 8;
const PX = 44;

export default function DashboardPage() {
  return (
    <>
      <Topbar crumbs={['Dashboard']} />
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-mono text-slate-600 uppercase tracking-widest mb-1">03 / Dashboard</p>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Welcome back, Rasa.</h1>
            <p className="text-slate-500 text-sm mt-1">Here's your week at a glance and upcoming lessons.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/calendar" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-sm hover:bg-slate-800 transition-colors">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="2.5" y="3.5" width="11" height="10" rx="1.5"/><path d="M2.5 6h11M5.5 2v3M10.5 2v3"/></svg>
              Calendar
            </Link>
            <Link href="/lessons/create" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-500 transition-colors">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M8 3v10M3 8h10"/></svg>
              New Lesson
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="bg-slate-900 rounded-xl border border-slate-800 p-5">
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">{s.label}</p>
              <p className="text-2xl font-semibold text-white mt-1">{s.value}</p>
              {s.bars ? (
                <>
                  <div className="flex items-end gap-1 h-8 mt-3">
                    {s.bars.map((v, j) => (
                      <div key={j} className="flex-1 rounded-sm" style={{ height: `${(v / Math.max(...s.bars)) * 100}%`, background: j === s.bars.length - 1 ? 'rgb(99 102 241)' : 'rgb(99 102 241 / 0.3)', minHeight: 3 }} />
                    ))}
                  </div>
                  <div className="flex justify-between mt-1">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, j) => (
                      <span key={j} className="text-[9px] font-mono text-slate-700">{d}</span>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-500 mt-2">{s.sub}</p>
              )}
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-[1fr_280px] gap-4">
          <div className="space-y-4">
            {/* Today's schedule */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-white">Today's Schedule</h2>
                  <p className="text-[10px] font-mono text-slate-600 mt-0.5">Wednesday · May 6</p>
                </div>
                <div className="flex bg-slate-800 rounded-lg p-0.5">
                  <button className="px-3 py-1 rounded-md text-xs text-white bg-slate-700">Today</button>
                  <button className="px-3 py-1 rounded-md text-xs text-slate-400">Week</button>
                </div>
              </div>
              <div className="grid" style={{ gridTemplateColumns: '40px 1fr' }}>
                <div>
                  {hours.map(h => (
                    <div key={h} className="text-[9px] font-mono text-slate-700" style={{ height: PX }}>
                      {String(h).padStart(2, '0')}:00
                    </div>
                  ))}
                </div>
                <div className="relative border-l border-slate-800">
                  {hours.map(h => (
                    <div key={h} className="border-t border-slate-800/60" style={{ height: PX }} />
                  ))}
                  <div className="absolute left-0 right-0" style={{ top: (10.5 - START) * PX }}>
                    <div className="border-t border-dashed border-indigo-500/70" />
                    <div className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-indigo-500" />
                    <div className="absolute right-0 -top-2.5 text-[9px] font-mono text-indigo-400 bg-slate-900 px-1">10:30 · now</div>
                  </div>
                  {events.map((e, i) => (
                    <div key={i} className={`absolute left-1.5 right-1.5 rounded-lg px-2.5 py-1.5 ${e.alt ? 'bg-green-500/10 border border-green-500/20' : 'bg-indigo-500/10 border border-indigo-500/20'}`}
                      style={{ top: (e.s - START) * PX + 2, height: (e.e - e.s) * PX - 4 }}>
                      <p className={`text-[9px] font-mono ${e.alt ? 'text-green-400' : 'text-indigo-400'}`}>
                        {String(Math.floor(e.s)).padStart(2, '0')}:{e.s % 1 ? '30' : '00'} — {String(Math.floor(e.e)).padStart(2, '0')}:{e.e % 1 ? '30' : '00'}
                      </p>
                      <p className="text-xs font-medium text-white mt-0.5 leading-tight">{e.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{e.who}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Upcoming lessons */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white">Upcoming Lessons</h2>
                <Link href="/lessons" className="text-xs text-indigo-400 hover:text-indigo-300">View all →</Link>
              </div>
              <div className="space-y-0">
                {upcoming.map((l, i) => (
                  <div key={i} className="flex items-center gap-3 py-3 border-b border-slate-800 last:border-0">
                    <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-slate-300 font-medium shrink-0">
                      {l.student.split(' ').slice(0, 2).map(s => s[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{l.title}</p>
                      <p className="text-xs text-slate-500">{l.student}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-slate-400">{l.when}</p>
                      <span className="inline-flex items-center gap-1 mt-1 text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
                        <span className={`w-1 h-1 rounded-full ${l.dot}`} />{l.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Students */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white">Your Students</h2>
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 text-xs hover:bg-slate-700 transition-colors">
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3v10M3 8h10"/></svg>
                  Add student
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {students.map((s, i) => (
                  <div key={i} className="bg-slate-800/50 rounded-lg border border-slate-800 p-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-full bg-indigo-700 flex items-center justify-center text-white text-[10px] font-semibold shrink-0">{s.initials}</div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-white truncate">{s.name}</p>
                        <p className="text-[10px] text-slate-500">{s.grade} · {s.subj}</p>
                      </div>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-500 font-mono">{s.lessons} lessons</span>
                      <span className="text-slate-600">{s.last}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white">Notifications</h2>
                <button className="text-xs text-indigo-400 hover:text-indigo-300">Mark all read</button>
              </div>
              <div className="space-y-0">
                {notifications.map((n, i) => (
                  <div key={i} className="flex items-start gap-3 py-3 border-b border-slate-800 last:border-0">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.dot ?? ''}`} style={!n.dot ? { border: '1px solid rgb(51 65 85)' } : undefined} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white">{n.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{n.sub}</p>
                    </div>
                    <p className="text-[10px] text-slate-600 shrink-0">{n.when}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
              <h2 className="text-sm font-semibold text-white mb-3">Quick Actions</h2>
              <div className="space-y-2">
                {[
                  { href: '/lessons/create', label: 'Create a lesson' },
                  { href: '/materials', label: 'Upload material' },
                  { href: '/calendar', label: 'Edit availability' },
                ].map((a, i) => (
                  <Link key={i} href={a.href} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-800 text-slate-300 text-sm hover:bg-slate-800 hover:text-white transition-colors group">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                    <span className="flex-1">{a.label}</span>
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-slate-600 group-hover:text-slate-400"><path d="M6 4l4 4-4 4"/></svg>
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-white">Profile Completion</h2>
                <span className="text-xs font-mono text-indigo-400">82%</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '82%' }} />
              </div>
              <div className="space-y-2.5">
                {[
                  { ok: true, label: '3 subject categories added' },
                  { ok: true, label: 'Lesson price set' },
                  { ok: true, label: 'Bio written' },
                  { ok: false, label: 'Add intro video' },
                ].map((c, i) => (
                  <div key={i} className={`flex items-center gap-2.5 text-xs ${c.ok ? 'text-slate-300' : 'text-slate-600'}`}>
                    <span className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${c.ok ? 'bg-indigo-600' : 'border border-slate-700'}`}>
                      {c.ok && <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 8.5L6.5 12 13 4.5"/></svg>}
                    </span>
                    {c.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
