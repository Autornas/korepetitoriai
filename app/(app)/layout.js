import Sidebar from '@/components/Sidebar';
import ProtectedLayout from '@/components/ProtectedLayout';

export default function AppLayout({ children }) {
  return (
    <ProtectedLayout>
      <div className="flex h-screen bg-[#FBF7F0] text-[#2A1F14] overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </ProtectedLayout>
  );
}
