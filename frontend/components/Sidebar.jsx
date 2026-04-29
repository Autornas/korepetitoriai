'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { signOut } from '@/backend/auth';

const Icons = {
  Grid:     () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/></svg>,
  Cal:      () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="2.5" y="3.5" width="11" height="10" rx="1.5"/><path d="M2.5 6h11M5.5 2v3M10.5 2v3"/></svg>,
  Bell:     () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M4 7a4 4 0 018 0v3l1 2H3l1-2V7z"/><path d="M6.5 13a1.5 1.5 0 003 0"/></svg>,
  User:     () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="8" cy="6" r="2.8"/><path d="M3 14c.5-2.5 2.5-4 5-4s4.5 1.5 5 4"/></svg>,
  Plus:     () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M8 3v10M3 8h10"/></svg>,
  Folder:   () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M2.5 4.5a1 1 0 011-1h3l1.5 1.5h4.5a1 1 0 011 1v6a1 1 0 01-1 1h-9a1 1 0 01-1-1v-7.5z"/></svg>,
  Video:    () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="2" y="4" width="9" height="8" rx="1.5"/><path d="M11 7l3-2v6l-3-2"/></svg>,
  Search:   () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="7" cy="7" r="4"/><path d="M10 10l3 3"/></svg>,
  Logout:   () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M6 3H3a1 1 0 00-1 1v8a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6"/></svg>,
};

const sections = [
  {
    label: 'OVERVIEW',
    items: [
      { href: '/dashboard',      label: 'Dashboard',       num: '01', icon: 'Grid'   },
      { href: '/calendar',       label: 'Calendar',        num: '02', icon: 'Cal'    },
      { href: '/messages',       label: 'Messages',        num: '03', icon: 'Bell'   },
    ],
  },
  {
    label: 'TEACHING',
    items: [
      { href: '/profile',        label: 'Profile Settings', num: '04', icon: 'User'   },
      { href: '/lessons/create', label: 'New Lesson',       num: '05', icon: 'Plus'   },
      { href: '/materials',      label: 'Materials',        num: '06', icon: 'Folder' },
      { href: '/lessons',        label: 'My Lessons',       num: '07', icon: 'Video'  },
    ],
  },
  {
    label: 'DISCOVER',
    items: [
      { href: '/tutors',         label: 'Find a Tutor',    num: '08', icon: 'Search' },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, profile } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  const displayName = profile?.name ?? user?.email ?? '';
  const initials = displayName
    ? displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <aside className="w-60 shrink-0 bg-slate-950 border-r border-slate-800 flex flex-col overflow-y-auto">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
          K
        </div>
        <div>
          <div className="text-white font-semibold text-sm tracking-tight">Korepetitor</div>
          <div className="text-slate-600 text-[10px] font-mono">v 0.1</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4">
        {sections.map((sec) => (
          <div key={sec.label} className="mb-6">
            <div className="px-2 mb-2 text-[9px] font-semibold tracking-[0.1em] text-slate-600 uppercase">
              {sec.label}
            </div>
            <ul className="space-y-0.5">
              {sec.items.map((item) => {
                const Icon   = Icons[item.icon];
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors group ${
                        active
                          ? 'bg-slate-800 text-white'
                          : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                      }`}
                    >
                      <span className={active ? 'text-indigo-400' : 'text-slate-600 group-hover:text-slate-400'}>
                        <Icon />
                      </span>
                      <span className="flex-1">{item.label}</span>
                      <span className="text-[10px] font-mono text-slate-700">{item.num}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="flex items-center gap-3 px-4 py-4 border-t border-slate-800">
        <div className="w-7 h-7 rounded-full bg-indigo-700 flex items-center justify-center text-white text-[10px] font-semibold shrink-0">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-slate-200 text-xs font-medium truncate">
            {displayName || '—'}
          </div>
          <div className="text-slate-500 text-[10px] truncate">{user?.email ?? ''}</div>
        </div>
        <button
          onClick={handleSignOut}
          title="Sign out"
          className="text-slate-600 hover:text-red-400 transition-colors"
        >
          <Icons.Logout />
        </button>
      </div>
    </aside>
  );
}
