-- Teachers may schedule lessons with any student; admin pairing is gone.
--
-- Apply via Supabase SQL editor or `supabase db push`.
-- Must run after teacher_dashboard.sql.

begin;

drop policy if exists "lessons_insert_teacher" on public.lessons;
create policy "lessons_insert_teacher"
  on public.lessons for insert
  to authenticated
  with check (
    auth.uid() = teacher_id
    and auth.uid() = created_by
    and status = 'accepted'
    and student_id <> teacher_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'teacher'
    )
    and exists (
      select 1 from public.profiles p
      where p.id = lessons.student_id and p.role = 'student'
    )
    -- Money control: see lesson_schedulable() in teacher_dashboard.sql.
    and public.lesson_schedulable(lessons.date, lessons.time)
  );

drop table if exists public.teacher_students;

commit;
