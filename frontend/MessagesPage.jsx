import Topbar from './components/Topbar';

const tabs = ['All', 'Lessons', 'Students', 'Payments', 'System'];

export default function MessagesPage() {
  return (
    <>
      <Topbar crumbs={['Messages']} />
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-mono text-slate-600 uppercase tracking-widest mb-1">Messages</p>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Notifications</h1>
            <p className="text-slate-500 text-sm mt-1">All messages about lessons, students and platform news.</p>
          </div>
          <button className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-sm hover:bg-slate-800 transition-colors">
            Mark all read
          </button>
        </div>

        <div className="flex gap-1 border-b border-slate-800">
          {tabs.map((tab, i) => (
            <button key={i} className={`px-4 py-2.5 text-sm border-b-2 transition-colors ${i === 0 ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="flex flex-col items-center justify-center py-16 text-slate-600">
            <svg width="36" height="36" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1"><path d="M8 2a4 4 0 014 4v2l1 2H3l1-2V6a4 4 0 014-4zM6.5 12a1.5 1.5 0 003 0"/></svg>
            <p className="text-sm mt-3">No notifications</p>
          </div>
        </div>
      </div>
    </>
  );
}
