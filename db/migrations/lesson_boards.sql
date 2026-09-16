-- Saved lesson whiteboards and the images placed on them.
--
-- Both are reachable only through the service-role client behind the API,
-- which checks that the caller is on the lesson first. `authenticated` gets
-- nothing, and the bucket is private (images are served as signed URLs).
--
-- Apply via Supabase SQL editor or `supabase db push`.

begin;

create table if not exists public.lesson_boards (
  lesson_id  uuid primary key references public.lessons(id) on delete cascade,
  elements   jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

alter table public.lesson_boards enable row level security;
revoke all on public.lesson_boards from anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'lesson-files', 'lesson-files', false, 10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

commit;
