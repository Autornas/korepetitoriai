import Topbar from './components/Topbar';
import Link from 'next/link';

const stats = [
  { label: 'Lessons this week' },
  { label: 'Active students' },
  { label: 'New messages' },
  { label: 'Earnings this month' },
];

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
              <p className="text-2xl font-semibold text-slate-600 mt-1">—</p>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-[1fr_280px] gap-4">
          <div className="space-y-4">
            {/* Upcoming lessons */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white">Upcoming Lessons</h2>
                <Link href="/lessons" className="text-xs text-indigo-400 hover:text-indigo-300">View all →</Link>
              </div>
              <div className="flex flex-col items-center justify-center py-10 text-slate-600">
                <svg width="32" height="32" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1"><rect x="2.5" y="3.5" width="11" height="10" rx="1.5"/><path d="M2.5 6h11M5.5 2v3M10.5 2v3"/></svg>
                <p className="text-xs mt-3">No upcoming lessons</p>
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
          </div>
        </div>
      </div>
    </>
  );
}
