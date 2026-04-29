import Topbar from './components/Topbar';
import Link from 'next/link';

export default function LessonsPage() {
  return (
    <>
      <Topbar crumbs={['My Lessons']} />
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-mono text-slate-600 uppercase tracking-widest mb-1">My Lessons</p>
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
          <div className="flex flex-col items-center justify-center py-16 text-slate-600">
            <svg width="36" height="36" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1"><rect x="2.5" y="3.5" width="11" height="10" rx="1.5"/><path d="M2.5 6h11M5.5 2v3M10.5 2v3"/></svg>
            <p className="text-sm mt-3">No lessons yet</p>
            <Link href="/lessons/create" className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-500 transition-colors">
              Create your first lesson
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
