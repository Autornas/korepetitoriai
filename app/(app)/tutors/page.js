import TutorsPage from '@/frontend/TutorsPage';
import RoleGuard from '@/frontend/components/RoleGuard';

export const metadata = { title: 'Find a Tutor — Korepetitor' };

export default function Page() {
  return (
    <RoleGuard allow="student">
      <TutorsPage />
    </RoleGuard>
  );
}
