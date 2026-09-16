import BoardViewPage from '@/features/call/BoardViewPage';

export const metadata = { title: 'Lesson Board — Korepetitor' };

export default async function Page({ params }) {
  const { id } = await params;
  return <BoardViewPage lessonId={id} />;
}
