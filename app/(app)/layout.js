import Sidebar from '@/frontend/components/Sidebar';

export default function AppLayout({ children }) {
  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
