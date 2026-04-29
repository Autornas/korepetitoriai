import Topbar from './components/Topbar';

export default function TutorsPage() {
  return (
    <>
      <Topbar crumbs={['Find a Tutor']} />
      <div className="p-6 space-y-6">
        <div>
          <p className="text-xs font-mono text-slate-600 uppercase tracking-widest mb-1">Find a Tutor</p>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Find a Tutor</h1>
          <p className="text-slate-500 text-sm mt-1">Choose a subject and grade — the system shows suitable tutors that match your schedule.</p>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
          <div className="grid grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Subject</label>
              <select className="w-full px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-200 text-sm outline-none appearance-none cursor-pointer">
                <option value="">Select subject</option>
                <option>Mathematics</option>
                <option>Physics</option>
                <option>Lithuanian</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Grade</label>
              <select className="w-full px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-200 text-sm outline-none appearance-none cursor-pointer">
                <option value="">Select grade</option>
                <option>Grade 10</option>
                <option>Grade 11</option>
                <option>Grade 12</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Max price</label>
              <div className="flex items-center bg-slate-800/60 border border-slate-700 rounded-lg overflow-hidden focus-within:border-indigo-500 transition-colors">
                <span className="px-2.5 text-slate-500 text-sm">€</span>
                <input className="flex-1 py-2 bg-transparent text-slate-100 text-sm outline-none" placeholder="Any" />
              </div>
            </div>
            <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-500 transition-colors">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4"/><path d="M10 10l3 3"/></svg>
              Search
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-16 text-slate-600">
          <svg width="40" height="40" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="7" cy="7" r="4"/><path d="M10 10l3 3"/></svg>
          <p className="text-sm mt-3">Search to find tutors</p>
        </div>
      </div>
    </>
  );
}
