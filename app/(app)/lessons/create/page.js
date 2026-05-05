import { Suspense } from 'react';
import CreateLessonPage from '@/frontend/CreateLessonPage';
import RoleGuard from '@/frontend/components/RoleGuard';

export const metadata = { title: 'Request Lesson — Korepetitor' };

export default function Page() {
  return (
    <RoleGuard allow="student">
      <Suspense fallback={null}>
        <CreateLessonPage />
      </Suspense>
    </RoleGuard>
  );
}
