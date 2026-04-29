import Topbar from './components/Topbar';
import Link from 'next/link';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DATES = [4, 5, 6, 7, 8, 9, 10];
const TODAY = 6;
const HOURS = Array.from({ length: 11 }, (_, i) => i + 8);
const START = 8;
const PX = 54;

const events = [
  { d: 0, s: 9, e: 10, title: 'Algebra — review', who: 'Augustė K.', alt: true },
  { d: 0, s: 14, e: 15, title: 'VBE prep', who: 'Mantas V.', alt: false },
  { d: 1, s: 11, e: 12, title: 'Functions — graphs', who: 'Emilija P.', alt: true },
  { d: 1, s: 16, e: 17, title: 'Probability', who: 'Ugnė S.', alt: false },
  { d: 2, s: 9, e: 10, title: 'Quadratic eq.', who: 'Lukas J.', alt: false },
  { d: 2, s: 14, e: 15, title: 'Quadratic eq. II', who: 'Lukas J.', alt: false },
  { d: 2, s: 16.5, e: 17.5, title: 'Probability', who: 'Emilija P.', alt: true },
  { d: 3, s: 10, e: 11, title: 'Geometry', who: 'Tomas B.', alt: false },
  { d: 3, s: 15, e: 16, title: 'VBE consultation', who: 'Mantas V.', alt: false },
  { d: 4, s: 11, e: 12, title: 'Statistics', who: 'Ugnė S.', alt: true },
  { d: 4, s: 14, e: 15, title: 'Discriminant', who: 'Lukas J.', alt: false },
];

export default function CalendarPage() {
  return (
    <>
      <Topbar crumbs={['Calendar']} />
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-mono text-slate-600 uppercase tracking-widest mb-1">02 / Calendar</p>
            <h1 className="text-2xl font-semibold tracking-tight text-white">My Calendar</h1>
            <p className="text-slate-500 text-sm mt-1">All scheduled sessions and free slots in one place.</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 text-sm hover:bg-slate-800 transition-colors">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M10 4l-4 4 4 4"/></svg>
            </button>
            <span className="text-xs font-mono text-slate-400 px-2">2026 · May · Week 19</span>
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
                <span className={`text-sm font-semibold mt-0.5 w-7 h-7 flex items-center justify-center rounded-full ${DATES[i] === TODAY ? 'bg-indigo-600 text-white' : 'text-slate-300'}`}>
                  {DATES[i]}
                </span>
              </div>
            ))}

            {HOURS.map(h => (
              <>
                <div key={`t-${h}`} className="border-t border-slate-800 text-[9px] font-mono text-slate-700 flex items-start justify-end pr-2 pt-1" style={{ height: PX }}>
                  {String(h).padStart(2, '0')}:00
                </div>
                {DAYS.map((_, d) => {
                  const evs = events.filter(e => e.d === d && Math.floor(e.s) === h);
                  return (
                    <div key={`c-${h}-${d}`} className="border-t border-slate-800 border-l relative" style={{ height: PX }}>
                      {evs.map((e, i) => (
                        <div key={i}
                          className={`absolute left-0.5 right-0.5 rounded-md px-2 py-1 text-[10px] overflow-hidden ${e.alt ? 'bg-green-500/10 border border-green-500/20' : 'bg-indigo-500/10 border border-indigo-500/20'}`}
                          style={{ top: (e.s - h) * PX + 1, height: (e.e - e.s) * PX - 2 }}>
                          <p className={`font-mono text-[9px] ${e.alt ? 'text-green-500' : 'text-indigo-400'}`}>
                            {String(Math.floor(e.s)).padStart(2, '0')}:{e.s % 1 ? '30' : '00'}
                          </p>
                          <p className="font-medium text-white leading-tight truncate">{e.title}</p>
                          <p className="text-slate-400 truncate">{e.who}</p>
                        </div>
                      ))}
                    </div>
                  );
                })}
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
