import Topbar from './components/Topbar';

const extColor = { PDF: 'text-red-400', PPTX: 'text-amber-400', DOCX: 'text-blue-400', URL: 'text-green-400', JPG: 'text-purple-400' };

const categories = [
  { label: 'All files', active: true },
  { label: 'Slides' },
  { label: 'Exercises' },
  { label: 'Links' },
];

export default function MaterialsPage() {
  return (
    <>
      <Topbar crumbs={['Materials']} />
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-mono text-slate-600 uppercase tracking-widest mb-1">Materials</p>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Materials Library</h1>
            <p className="text-slate-500 text-sm mt-1">Manage your files, slides and links for lessons.</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-sm hover:bg-slate-800 transition-colors">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M2.5 4.5a1 1 0 011-1h3l1.5 1.5h4.5a1 1 0 011 1v6a1 1 0 01-1 1h-9a1 1 0 01-1-1v-7.5z"/></svg>
              New Folder
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-500 transition-colors">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3v10M3 8h10"/></svg>
              Upload
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {categories.map((c, i) => (
            <div key={i} className={`rounded-xl border p-4 cursor-pointer transition-colors ${c.active ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800 hover:bg-slate-800/50'}`}>
              <p className="text-xs text-slate-500">{c.label}</p>
              <p className="text-2xl font-semibold text-slate-600 mt-2">0</p>
            </div>
          ))}
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="grid border-b border-slate-800 px-5 py-3" style={{ gridTemplateColumns: '36px 1fr 180px 90px 110px 60px' }}>
            {['', 'Name', 'Subject', 'Size', 'Updated', ''].map((h, i) => (
              <span key={i} className="text-[10px] font-mono uppercase tracking-widest text-slate-600">{h}</span>
            ))}
          </div>
          <div className="flex flex-col items-center justify-center py-16 text-slate-600">
            <svg width="36" height="36" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1"><path d="M2.5 4.5a1 1 0 011-1h3l1.5 1.5h4.5a1 1 0 011 1v6a1 1 0 01-1 1h-9a1 1 0 01-1-1v-7.5z"/></svg>
            <p className="text-sm mt-3">No files yet</p>
            <button className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-500 transition-colors">
              Upload your first file
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
