import Topbar from './components/Topbar';
import Link from 'next/link';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 11 }, (_, i) => i + 8);
const START = 8;
const PX = 54;

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

export default function CalendarPage() {
  const dates = getWeekDates();
  const todayDate = new Date().getDate();

  return (
    <>
      <Topbar crumbs={['Calendar']} />
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-mono text-slate-600 uppercase tracking-widest mb-1">Calendar</p>
            <h1 className="text-2xl font-semibold tracking-tight text-white">My Calendar</h1>
            <p className="text-slate-500 text-sm mt-1">All scheduled sessions and free slots in one place.</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 text-sm hover:bg-slate-800 transition-colors">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M10 4l-4 4 4 4"/></svg>
            </button>
            <span className="text-xs font-mono text-slate-400 px-2">This week</span>
            <button className="flex items-center px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 text-sm hover:bg-slate-800 transition-colors">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 4l4 4-4 4"/></svg>
            </button>
            <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5 ml-2">
              <button className="px-3 py-1 rounded-md text-xs text-slate-400">Day</button>
              <button className="px-3 py-1 rounded-md text-xs text-white bg-slate-700">Week</button>
              <button className="px-3 py-1 rounded-md text-xs text-slate-400">Month</button>
            </div>
            <Link href="/lessons/create" className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-500 transition-colors">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M8 3v10M3 8h10"/></svg>
              New Lesson
            </Link>
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="grid" style={{ gridTemplateColumns: '56px repeat(7, 1fr)' }}>
            <div className="border-b border-slate-800 h-12" />
            {DAYS.map((d, i) => (
              <div key={i} className="border-b border-slate-800 border-l h-12 flex flex-col items-center justify-center">
                <span className="text-[10px] text-slate-600">{d}</span>
                <span className={`text-sm font-semibold mt-0.5 w-7 h-7 flex items-center justify-center rounded-full ${dates[i] === todayDate ? 'bg-indigo-600 text-white' : 'text-slate-300'}`}>
                  {dates[i]}
                </span>
              </div>
            ))}

            {HOURS.map(h => (
              <>
                <div key={`t-${h}`} className="border-t border-slate-800 text-[9px] font-mono text-slate-700 flex items-start justify-end pr-2 pt-1" style={{ height: PX }}>
                  {String(h).padStart(2, '0')}:00
                </div>
                {DAYS.map((_, d) => (
                  <div key={`c-${h}-${d}`} className="border-t border-slate-800 border-l relative" style={{ height: PX }} />
                ))}
              </>
            ))}
          </div>
        </div>

        <div className="flex gap-5 text-xs text-slate-500">
          <span className="flex items-center gap-2">
            <span className="w-3 h-2 rounded-sm bg-indigo-500/20 border-l-2 border-indigo-500" />Confirmed lesson
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-2 rounded-sm bg-green-500/20 border-l-2 border-green-500" />Student booking
          </span>
        </div>
      </div>
    </>
  );
}
