export default function Topbar({ crumbs }) {
  return (
    <div className="h-12 border-b border-slate-800 bg-slate-950 flex items-center px-6 gap-4 shrink-0">
      <div className="flex items-center gap-1.5 text-xs text-slate-500 flex-1 min-w-0">
        <span>Korepetitor</span>
        {crumbs?.map((c, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M6 4l4 4-4 4" />
            </svg>
            <span className={i === crumbs.length - 1 ? 'text-slate-300' : ''}>{c}</span>
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-500 text-xs w-56 cursor-text">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="7" cy="7" r="4" /><path d="M10 10l3 3" />
        </svg>
        <span className="flex-1">Search lessons, students…</span>
        <span className="font-mono bg-slate-800 px-1 py-0.5 rounded text-[10px]">⌘K</span>
      </div>

      <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors relative">
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M4 7a4 4 0 018 0v3l1 2H3l1-2V7z" /><path d="M6.5 13a1.5 1.5 0 003 0" />
        </svg>
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
      </button>

      <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors">
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
          <circle cx="8" cy="8" r="2" />
          <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.5 1.5M11.5 11.5L13 13M3 13l1.5-1.5M11.5 4.5L13 3" />
        </svg>
      </button>
    </div>
  );
}
