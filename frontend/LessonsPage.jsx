import Topbar from './components/Topbar';
import Link from 'next/link';

const lessons = [
  { title: 'Quadratic equations — discriminant', student: 'Lukas Jonaitis', grade: 'Gr. 10', when: 'Fri 2026-05-08 · 14:00–15:00', status: 'confirmed', dot: 'bg-green-500' },
  { title: 'Probability', student: 'Emilija Petraitytė', grade: 'Gr. 11', when: 'Today · 16:30–17:30', status: 'upcoming', dot: 'bg-indigo-500' },
  { title: 'VBE consultation', student: 'Mantas Vaičiulis', grade: 'Gr. 12', when: 'Thu 2026-05-07 · 15:00–16:00', status: 'confirmed', dot: 'bg-green-500' },
  { title: 'Statistics', student: 'Ugnė Stankutė', grade: 'Gr. 11', when: 'Fri 2026-05-08 · 11:00–12:00', status: 'pending', dot: 'bg-amber-500' },
  { title: 'Algebra — review', student: 'Augustė Kavaliauskaitė', grade: 'Gr. 9', when: 'Mon 2026-05-04 · 09:00–10:00', status: 'completed', dot: 'bg-slate-600' },
  { title: 'Functions — graphs', student: 'Emilija Petraitytė', grade: 'Gr. 11', when: 'Tue 2026-05-05 · 11:00–12:00', status: 'completed', dot: 'bg-slate-600' },
  { title: 'Geometry', student: 'Tomas Bagdonas', grade: 'Gr. 12', when: 'Thu 2026-05-07 · 10:00–11:00', status: 'completed', dot: 'bg-slate-600' },
];

export default function LessonsPage() {
  return (
    <>
      <Topbar crumbs={['My Lessons']} />
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-mono text-slate-600 uppercase tracking-widest mb-1">07 / My Lessons</p>
            <h1 className="text-2xl font-semibold tracking-tight text-white">My Lessons</h1>
            <p className="text-slate-500 text-sm mt-1">All your upcoming and past teaching sessions.</p>
          </div>
          <Link href="/lessons/create" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-500 transition-colors">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3v10M3 8h10"/></svg>
            New Lesson
          </Link>
        </div>

        <div className="flex gap-1 border-b border-slate-800">
          {['All', 'Upcoming', 'Confirmed', 'Pending', 'Completed'].map((tab, i) => (
            <button key={i} className={`px-4 py-2.5 text-sm border-b-2 transition-colors ${i === 0 ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="grid border-b border-slate-800 px-5 py-3" style={{ gridTemplateColumns: '1fr 180px 200px 100px 80px' }}>
            {['Lesson', 'Student', 'When', 'Status', ''].map((h, i) => (
              <span key={i} className="text-[10px] font-mono uppercase tracking-widest text-slate-600">{h}</span>
            ))}
          </div>
          {lessons.map((l, i) => (
            <div key={i} className="grid items-center px-5 py-4 border-b border-slate-800 last:border-0 hover:bg-slate-800/30 transition-colors" style={{ gridTemplateColumns: '1fr 180px 200px 100px 80px' }}>
              <p className="text-sm font-medium text-white">{l.title}</p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-indigo-700 flex items-center justify-center text-white text-[9px] font-semibold shrink-0">
                  {l.student.split(' ').map(s => s[0]).join('')}
                </div>
                <div>
                  <p className="text-xs text-slate-300">{l.student}</p>
                  <p className="text-[10px] text-slate-600">{l.grade}</p>
                </div>
              </div>
              <p className="text-xs font-mono text-slate-400">{l.when}</p>
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className={`w-1.5 h-1.5 rounded-full ${l.dot}`} />{l.status}
              </span>
              <div className="flex justify-end">
                <button className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 text-xs hover:bg-slate-700 transition-colors">Open</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
