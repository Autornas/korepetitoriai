import Sidebar from '@/frontend/components/Sidebar';
import ProtectedLayout from '@/frontend/components/ProtectedLayout';

export default function AppLayout({ children }) {
  return (
    <ProtectedLayout>
      <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </ProtectedLayout>
  );
}
