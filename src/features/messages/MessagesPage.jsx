import Topbar from '@/components/Topbar';

const tabs = ['All', 'Lessons', 'Students', 'Payments', 'System'];

export default function MessagesPage() {
  return (
    <>
      <Topbar crumbs={['Messages']} />
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-mono text-[#8A7556] uppercase tracking-widest mb-1">Messages</p>
            <h1 className="text-2xl font-semibold tracking-tight text-[#2A1F14]">Notifications</h1>
            <p className="text-[#8A7556] text-sm mt-1">All messages about lessons, students and platform news.</p>
          </div>
          <button className="px-3 py-2 rounded-lg bg-[#FFFDF8] border border-[#EADFCB] text-[#5A4A38] text-sm hover:bg-[#F4ECDF] transition-colors">
            Mark all read
          </button>
        </div>

        <div className="flex gap-1 border-b border-[#EADFCB]">
          {tabs.map((tab, i) => (
            <button key={i} className={`px-4 py-2.5 text-sm border-b-2 transition-colors ${i === 0 ? 'border-[#C8654A] text-[#B0533A]' : 'border-transparent text-[#8A7556] hover:text-[#5A4A38]'}`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="bg-[#FFFDF8] rounded-xl border border-[#EADFCB] overflow-hidden">
          <div className="flex flex-col items-center justify-center py-16 text-[#8A7556]">
            <svg width="36" height="36" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1"><path d="M8 2a4 4 0 014 4v2l1 2H3l1-2V6a4 4 0 014-4zM6.5 12a1.5 1.5 0 003 0"/></svg>
            <p className="text-sm mt-3">No notifications</p>
          </div>
        </div>
      </div>
    </>
  );
}
