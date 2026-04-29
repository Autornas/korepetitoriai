import Topbar from './components/Topbar';

const teachers = [
  { initials: 'RK', name: 'Rasa Kazlauskė', subj: 'Mathematics · VBE · Algebra', years: 8, price: 35, rating: 4.9, reviews: 47, next: 'Tomorrow 14:00', accepting: true },
  { initials: 'TP', name: 'Tomas Petrauskas', subj: 'Mathematics · Physics', years: 5, price: 28, rating: 4.7, reviews: 32, next: 'Today 16:00', accepting: true },
  { initials: 'EV', name: 'Eglė Vaitkutė', subj: 'Mathematics · Statistics', years: 12, price: 42, rating: 5.0, reviews: 89, next: 'Tomorrow 10:00', accepting: true },
  { initials: 'KA', name: 'Karolis Adomaitis', subj: 'VBE Mathematics', years: 6, price: 30, rating: 4.8, reviews: 24, next: 'Monday 18:00', accepting: false },
];

export default function TutorsPage() {
  return (
    <>
      <Topbar crumbs={['Find a Tutor']} />
      <div className="p-6 space-y-6">
        <div>
          <p className="text-xs font-mono text-slate-600 uppercase tracking-widest mb-1">10 / Find a Tutor</p>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Find a Tutor</h1>
          <p className="text-slate-500 text-sm mt-1">Choose a subject and grade — the system shows suitable tutors that match your schedule.</p>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
          <div className="grid grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Subject</label>
              <select className="w-full px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-200 text-sm outline-none appearance-none cursor-pointer">
                <option>Mathematics</option>
                <option>Physics</option>
                <option>Lithuanian</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Grade</label>
              <select className="w-full px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-200 text-sm outline-none appearance-none cursor-pointer">
                <option>Grade 10</option>
                <option>Grade 11</option>
                <option>Grade 12</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Max price</label>
              <div className="flex items-center bg-slate-800/60 border border-slate-700 rounded-lg overflow-hidden focus-within:border-indigo-500 transition-colors">
                <span className="px-2.5 text-slate-500 text-sm">€</span>
                <input className="flex-1 py-2 bg-transparent text-slate-100 text-sm outline-none" defaultValue="40" />
              </div>
            </div>
            <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-500 transition-colors">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4"/><path d="M10 10l3 3"/></svg>
              Search
            </button>
          </div>
        </div>

        <p className="text-xs font-mono text-slate-500">
          Found <span className="text-white">24</span> tutors · sorted by: <span className="text-white">rating ↓</span>
        </p>

        <div className="grid grid-cols-2 gap-4">
          {teachers.map((t, i) => (
            <div key={i} className="bg-slate-900 rounded-xl border border-slate-800 p-5">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 text-sm font-semibold shrink-0">
                  {t.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-base font-semibold text-white">{t.name}</p>
                    <p className="text-xs font-mono text-indigo-400 shrink-0">★ {t.rating} <span className="text-slate-600">· {t.reviews}</span></p>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{t.subj}</p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] text-slate-400">{t.years} yrs experience</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] text-slate-400">individual lessons</span>
                    {t.accepting && (
                      <span className="px-2 py-0.5 rounded-full bg-green-500/15 border border-green-500/25 text-[10px] text-green-400">accepting new</span>
                    )}
                  </div>
                </div>
              </div>
              <hr className="border-slate-800 my-4" />
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] text-slate-600 uppercase tracking-wide">Price</p>
                  <p className="text-lg font-semibold text-white mt-1">€{t.price} <span className="text-xs font-normal text-slate-500">/ lesson</span></p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-600 uppercase tracking-wide">Next available</p>
                  <p className="text-sm font-medium text-slate-300 mt-1">{t.next}</p>
                </div>
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-500 transition-colors">
                  View
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
