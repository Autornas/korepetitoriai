-- Lesson requests between students and teachers.
-- Apply via Supabase SQL editor or `supabase db push`.

create table if not exists public.lessons (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references auth.users(id) on delete cascade,
  teacher_id   uuid not null references auth.users(id) on delete cascade,
  date         date not null,
  time         time not null,
  subject      text,
  notes        text,
  status       text not null default 'pending'
                 check (status in ('pending', 'accepted', 'rejected')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Follow-up columns; idempotent for existing tables.
alter table public.lessons add column if not exists subject   text;
alter table public.lessons add column if not exists meet_link text;

create index if not exists lessons_student_idx on public.lessons (student_id, date);
create index if not exists lessons_teacher_idx on public.lessons (teacher_id, date);

alter table public.lessons enable row level security;

-- Read: only the student or teacher on the lesson.
drop policy if exists "lessons_select_participants" on public.lessons;
create policy "lessons_select_participants"
  on public.lessons for select
  using (auth.uid() = student_id or auth.uid() = teacher_id);

-- NOTE: these three policies are the baseline shape only. `security_hardening.sql`
-- replaces all of them (pinning `created_by`, requiring `pending` on both insert
-- paths, and allowing either participant to update), and `security_hardening_2.sql`
-- adds the transition trigger on top. They are kept here so this file still
-- produces a coherent table on a fresh project.
--
-- There used to be an `auth.email() = any (array['<a real gmail address>'])`
-- escape hatch on each of them, so that one hardcoded account bypassed the role
-- check. Anyone who managed to register that address would have inherited it.
-- Removed — do not reintroduce a per-email bypass in a policy; admin powers live
-- in ADMIN_EMAILS server env (see src/server/session.js requireAdmin).

-- Insert: only the student themselves, only as pending.
drop policy if exists "lessons_insert_student" on public.lessons;
create policy "lessons_insert_student"
  on public.lessons for insert
  with check (
    auth.uid() = student_id
    and status = 'pending'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'student'
    )
  );

-- Insert: only the teacher themselves, only as pending — the student still has
-- to accept a lesson a teacher proposed.
drop policy if exists "lessons_insert_teacher" on public.lessons;
create policy "lessons_insert_teacher"
  on public.lessons for insert
  with check (
    auth.uid() = teacher_id
    and status = 'pending'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'teacher'
    )
  );

-- Update: either participant on the lesson.
drop policy if exists "lessons_update_teacher" on public.lessons;
create policy "lessons_update_participants"
  on public.lessons for update
  using (auth.uid() = student_id or auth.uid() = teacher_id)
  with check (
    (auth.uid() = student_id or auth.uid() = teacher_id)
    and status in ('pending', 'accepted', 'rejected')
  );
