import Topbar from './components/Topbar';

const items = [
  { dot: 'bg-indigo-500', title: 'New student: Tomas Bagdonas', sub: 'Registered for "VBE Mathematics" and awaiting confirmation.', when: '2h ago', read: false },
  { dot: 'bg-green-500', title: 'Lesson booked', sub: "Lukas Jonaitis booked today's 14:00 lesson — \"Quadratic equations — discriminant\".", when: '5h ago', read: false },
  { dot: null, title: 'Payment received', sub: '€45 · Emilija Petraitytė for lesson "Functions — graphs"', when: 'yesterday', read: true },
  { dot: 'bg-amber-500', title: 'Lesson cancelled', sub: 'Mantas Vaičiulis cancelled Wednesday 16:00 lesson (reason: illness).', when: 'yesterday', read: true },
  { dot: null, title: 'New review', sub: '"Great teacher, explains everything clearly and motivates students." — Augustė K.', when: '2 days ago', read: true },
  { dot: 'bg-indigo-500', title: 'Profile viewed 12 times', sub: 'This week your profile was viewed by 12 students, 3 of whom booked an intro lesson.', when: '2 days ago', read: true },
  { dot: null, title: 'System update', sub: 'New feature added — automatic reminders for students before lessons.', when: '4 days ago', read: true },
];

export default function MessagesPage() {
  return (
    <>
      <Topbar crumbs={['Messages']} />
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-mono text-slate-600 uppercase tracking-widest mb-1">03 / Messages</p>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Notifications</h1>
            <p className="text-slate-500 text-sm mt-1">All messages about lessons, students and platform news.</p>
          </div>
          <button className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-sm hover:bg-slate-800 transition-colors">
            Mark all read
          </button>
        </div>

        <div className="flex gap-1 border-b border-slate-800">
          {['All · 12', 'Lessons · 5', 'Students · 4', 'Payments · 2', 'System · 1'].map((tab, i) => (
            <button key={i} className={`px-4 py-2.5 text-sm border-b-2 transition-colors ${i === 0 ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          {items.map((n, i) => (
            <div key={i} className={`grid items-start px-5 py-4 border-b border-slate-800 last:border-0 hover:bg-slate-800/30 transition-colors ${!n.read ? 'bg-indigo-500/5' : ''}`}
              style={{ gridTemplateColumns: '16px 1fr 90px' }}>
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.dot ?? ''}`} style={!n.dot ? { border: '1px solid rgb(71 85 105)' } : undefined} />
              <div className="min-w-0 pr-4">
                <p className={`text-sm font-medium ${n.read ? 'text-slate-300' : 'text-white'}`}>{n.title}</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{n.sub}</p>
              </div>
              <p className="text-[10px] font-mono text-slate-600 text-right">{n.when}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
