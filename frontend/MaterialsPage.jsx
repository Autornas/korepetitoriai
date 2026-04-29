import Topbar from './components/Topbar';

const files = [
  { ext: 'PDF', name: 'VBE mathematics — formulas', subj: 'VBE Math', size: '2.4 MB', date: '2026-05-04', shared: true },
  { ext: 'PPTX', name: 'Quadratic equations — slides', subj: 'Mathematics · Gr. 10', size: '4.8 MB', date: '2026-05-03', shared: true },
  { ext: 'PDF', name: 'Trigonometry — exercises', subj: 'Mathematics · Gr. 11', size: '8.1 MB', date: '2026-04-29', shared: false },
  { ext: 'DOCX', name: 'Lesson plan — functions', subj: 'Mathematics · Gr. 11', size: '120 KB', date: '2026-04-28', shared: false },
  { ext: 'URL', name: 'Khan Academy: Quadratic formula', subj: 'Mathematics', size: '—', date: '2026-04-27', shared: true },
  { ext: 'PDF', name: 'Geometry — self-assessment', subj: 'Mathematics · Gr. 12', size: '1.6 MB', date: '2026-04-25', shared: true },
  { ext: 'JPG', name: 'Whiteboard photos — lecture', subj: 'Mathematics', size: '600 KB', date: '2026-04-22', shared: false },
  { ext: 'PDF', name: 'Statistics — exercises', subj: 'Mathematics · Gr. 11', size: '3.2 MB', date: '2026-04-20', shared: true },
];

const extColor = { PDF: 'text-red-400', PPTX: 'text-amber-400', DOCX: 'text-blue-400', URL: 'text-green-400', JPG: 'text-purple-400' };

export default function MaterialsPage() {
  return (
    <>
      <Topbar crumbs={['Materials']} />
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-mono text-slate-600 uppercase tracking-widest mb-1">06 / Materials</p>
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
          {[
            { label: 'All files', n: 32, active: true },
            { label: 'Slides', n: 8 },
            { label: 'Exercises', n: 12 },
            { label: 'Links', n: 6 },
          ].map((c, i) => (
            <div key={i} className={`rounded-xl border p-4 cursor-pointer transition-colors ${c.active ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800 hover:bg-slate-800/50'}`}>
              <p className="text-xs text-slate-500">{c.label}</p>
              <p className="text-2xl font-semibold text-white mt-2">{c.n}</p>
            </div>
          ))}
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="grid border-b border-slate-800 px-5 py-3" style={{ gridTemplateColumns: '36px 1fr 180px 90px 110px 60px' }}>
            {['', 'Name', 'Subject', 'Size', 'Updated', ''].map((h, i) => (
              <span key={i} className="text-[10px] font-mono uppercase tracking-widest text-slate-600">{h}</span>
            ))}
          </div>
          {files.map((f, i) => (
            <div key={i} className="grid items-center px-5 py-3.5 border-b border-slate-800 last:border-0 hover:bg-slate-800/30 transition-colors" style={{ gridTemplateColumns: '36px 1fr 180px 90px 110px 60px' }}>
              <span className={`text-[10px] font-mono font-bold ${extColor[f.ext] ?? 'text-slate-400'}`}>{f.ext}</span>
              <div>
                <p className="text-sm font-medium text-white">{f.name}</p>
                {f.shared && <p className="text-[10px] text-green-500 mt-0.5">· shared with 3 students</p>}
              </div>
              <p className="text-xs text-slate-400">{f.subj}</p>
              <p className="text-xs font-mono text-slate-500">{f.size}</p>
              <p className="text-xs font-mono text-slate-500">{f.date}</p>
              <div className="flex justify-end gap-1">
                <button className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-700 hover:text-slate-300 transition-colors">
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z"/><circle cx="8" cy="8" r="2"/></svg>
                </button>
                <button className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-700 hover:text-slate-300 transition-colors">
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><circle cx="3" cy="8" r="1.2"/><circle cx="8" cy="8" r="1.2"/><circle cx="13" cy="8" r="1.2"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
