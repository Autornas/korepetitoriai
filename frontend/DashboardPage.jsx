import Topbar from './components/Topbar';
import Link from 'next/link';

const stats = [
  { label: 'Lessons this week' },
  { label: 'Active students' },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 11 }, (_, i) => i + 8);
const PX = 48;

function getWeekDates() {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.getDate();
  });
}

function WeekCalendar() {
  const dates = getWeekDates();
  const todayDate = new Date().getDate();

  return (
    <div className="rounded-lg border border-slate-800 overflow-hidden">
      <div className="grid" style={{ gridTemplateColumns: '48px repeat(7, 1fr)' }}>
        <div className="border-b border-slate-800 h-11 bg-slate-950/40" />
        {DAYS.map((d, i) => (
          <div key={i} className="border-b border-slate-800 border-l h-11 flex flex-col items-center justify-center bg-slate-950/40">
            <span className="text-[10px] text-slate-600">{d}</span>
            <span className={`text-xs font-semibold mt-0.5 w-6 h-6 flex items-center justify-center rounded-full ${dates[i] === todayDate ? 'bg-indigo-600 text-white' : 'text-slate-300'}`}>
              {dates[i]}
            </span>
          </div>
        ))}

        {HOURS.map(h => (
          <div key={`row-${h}`} className="contents">
            <div className="border-t border-slate-800 text-[9px] font-mono text-slate-700 flex items-start justify-end pr-1.5 pt-1" style={{ height: PX }}>
              {String(h).padStart(2, '0')}:00
            </div>
            {DAYS.map((_, d) => (
              <div key={`c-${h}-${d}`} className="border-t border-slate-800 border-l relative" style={{ height: PX }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <>
      <Topbar crumbs={['Dashboard']} />
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-mono text-slate-600 uppercase tracking-widest mb-1">Dashboard</p>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Welcome back.</h1>
            <p className="text-slate-500 text-sm mt-1">Here's your week at a glance and upcoming lessons.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="bg-slate-900 rounded-xl border border-slate-800 p-5">
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">{s.label}</p>
              <p className="text-2xl font-semibold text-slate-600 mt-1">—</p>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-[1fr_280px] gap-4">
          <div className="space-y-4">
            {/* Upcoming lessons (calendar) */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-white">Upcoming Lessons</h2>
                  <p className="text-xs text-slate-500 mt-0.5">This week's schedule.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700 transition-colors">
                    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M10 4l-4 4 4 4"/></svg>
                  </button>
                  <span className="text-[11px] font-mono text-slate-400">This week</span>
                  <button className="flex items-center px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700 transition-colors">
                    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 4l4 4-4 4"/></svg>
                  </button>
                  <Link href="/lessons" className="text-xs text-indigo-400 hover:text-indigo-300 ml-2">View all →</Link>
                </div>
              </div>

              <WeekCalendar />

              <div className="flex gap-5 text-xs text-slate-500 mt-4">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-2 rounded-sm bg-indigo-500/20 border-l-2 border-indigo-500" />Confirmed lesson
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-2 rounded-sm bg-green-500/20 border-l-2 border-green-500" />Student booking
                </span>
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
              <div className="flex flex-col items-center justify-center py-10 text-slate-600">
                <svg width="32" height="32" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="8" cy="6" r="2.5"/><path d="M2.5 13c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/></svg>
                <p className="text-xs mt-3">No students yet</p>
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
              <div className="flex flex-col items-center justify-center py-8 text-slate-600">
                <svg width="28" height="28" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1"><path d="M8 2a4 4 0 014 4v2l1 2H3l1-2V6a4 4 0 014-4zM6.5 12a1.5 1.5 0 003 0"/></svg>
                <p className="text-xs mt-3">No notifications</p>
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
              <h2 className="text-sm font-semibold text-white mb-3">Quick Actions</h2>
              <div className="space-y-2">
                {[
                  { href: '/lessons/create', label: 'Create a lesson' },
                ].map((a, i) => (
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
      </div>
    </>
  );
}
