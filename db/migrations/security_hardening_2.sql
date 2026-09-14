-- Security hardening, pass 2.
--
-- `security_hardening.sql` fixed *who* may read and write each table and
-- column. What it could not express is *how a row may change*: a policy's
-- WITH CHECK sees only the new row, never the old one. So three rules the API
-- enforces in JS had no equivalent in the database:
--
--   * a lesson's status may only move pending -> accepted|rejected and
--     accepted -> rejected
--   * `paid_at` may be set only by the teacher, only on an accepted lesson,
--     and only once
--   * `photo_url` and `meet_link` must point somewhere we chose
--
-- That mattered because the anon key ships in the browser bundle, so
-- PostgREST is directly reachable and the JS layer can simply be skipped. A
-- student could PATCH `paid_at` onto their own lesson and never pay; either
-- party could resurrect a rejected lesson into `accepted` and regain DM and
-- lesson-room access.
--
-- BEFORE UPDATE triggers are the right tool: they see OLD and NEW, and they
-- fire on every write path -- API, direct PostgREST, or some future SQL
-- function -- rather than only the one the app happens to use today. The
-- column GRANTs from pass 1 stay exactly as they are, so existing API code
-- keeps working unchanged; these triggers are the authority underneath it.
--
-- Both triggers no-op when `auth.uid()` is null, i.e. a service-role or
-- direct-SQL connection. Those bypass RLS by definition already; pretending
-- otherwise here would only break `ensureProfile` and the backup script.
--
-- Apply via Supabase SQL editor or `supabase db push`.
-- Must run after security_hardening.sql.

begin;

-- ---------------------------------------------------------------------------
-- 1. profiles: self-service INSERT can only ever create a student
-- ---------------------------------------------------------------------------
-- Pass 1 granted INSERT on `role` (needed by `ensureProfile`'s non-privileged
-- fallback) but the policy checked only `auth.uid() = id`. A user whose
-- profile row did not exist yet -- the exact case `ensureProfile` was written
-- for, a project where the `handle_new_user` trigger is missing -- could
-- therefore insert their own row as `role = 'teacher'`. Every other control in
-- these two files assumes `role` is not forgeable.

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id and role = 'student');

-- ---------------------------------------------------------------------------
-- 2. profiles: role is immutable, photo_url must be your own avatar object
-- ---------------------------------------------------------------------------
-- `photo_url` is in pass 1's UPDATE grant and is rendered as `<img src>` to
-- other users, so a direct PATCH could point it at any third-party server and
-- collect the IP and User-Agent of everyone who views the profile. The only
-- legitimate value is an object this user owns in the public avatars bucket,
-- written by src/server/services/storage.js (which appends a `?v=<ms>`
-- cache-buster).
--
-- `role` is already outside the UPDATE grant; re-checking it here costs
-- nothing and means a future re-grant cannot silently reopen it.

create or replace function public.profiles_guard_update()
returns trigger
language plpgsql
set search_path = public
as $fn$
begin
  if auth.uid() is null then
    return new;
  end if;

  if new.role is distinct from old.role then
    raise exception 'role is not self-assignable' using errcode = '42501';
  end if;

  if new.id is distinct from old.id then
    raise exception 'id is immutable' using errcode = '42501';
  end if;

  if new.photo_url is distinct from old.photo_url
     and new.photo_url is not null
     and new.photo_url !~ ('^https://[A-Za-z0-9.-]+/storage/v1/object/public/avatars/'
                           || old.id::text
                           || '/[A-Za-z0-9._-]+(\?v=[0-9]+)?$') then
    raise exception 'photo_url must point at your own avatar object'
      using errcode = '42501';
  end if;

  return new;
end;
$fn$;

drop trigger if exists profiles_guard_update on public.profiles;
create trigger profiles_guard_update
  before update on public.profiles
  for each row execute function public.profiles_guard_update();

-- ---------------------------------------------------------------------------
-- 3. lessons: state machine, write-once payment, allow-listed meeting link
-- ---------------------------------------------------------------------------
-- Mirrors updateLessonStatus / markLessonPaid / setLessonMeetLink in
-- src/server/services/lessons.js. The API still runs those checks first so the
-- user gets a readable message; reaching an exception raised here means the
-- API was bypassed.

create or replace function public.lessons_guard_update()
returns trigger
language plpgsql
set search_path = public
as $fn$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    return new;
  end if;

  if v_uid <> old.student_id and v_uid <> old.teacher_id then
    raise exception 'Not a participant' using errcode = '42501';
  end if;

  -- Who the lesson is between, who proposed it, and the code a bank transfer
  -- is matched on are all fixed once the row exists.
  if new.id is distinct from old.id
     or new.student_id is distinct from old.student_id
     or new.teacher_id is distinct from old.teacher_id
     or new.created_by is distinct from old.created_by
     or new.payment_code is distinct from old.payment_code then
    raise exception 'This column cannot be changed' using errcode = '42501';
  end if;

  if new.status is distinct from old.status then
    if not (
      (old.status = 'pending' and new.status in ('accepted', 'rejected'))
      or (old.status = 'accepted' and new.status = 'rejected')
    ) then
      raise exception 'Illegal lesson status transition (% -> %)',
        old.status, new.status using errcode = '42501';
    end if;

    -- Whoever proposed the lesson cannot also accept it.
    if new.status = 'accepted' and v_uid = old.created_by then
      raise exception 'The other party has to accept this lesson'
        using errcode = '42501';
    end if;
  end if;

  if new.paid_at is distinct from old.paid_at then
    if old.paid_at is not null then
      raise exception 'Payment confirmation cannot be changed'
        using errcode = '42501';
    end if;
    if v_uid <> old.teacher_id then
      raise exception 'Only the teacher can confirm payment'
        using errcode = '42501';
    end if;
    if old.status <> 'accepted' then
      raise exception 'Only an accepted lesson can be marked paid'
        using errcode = '42501';
    end if;
  end if;

  -- Same allow list as assertSafeMeetLink in src/server/services/calendar.js.
  -- The host is matched up to a '/' or to end-of-string, so neither
  -- https://meet.google.com@evil.tld/ nor https://meet.google.com.evil.tld/
  -- gets through.
  if new.meet_link is distinct from old.meet_link
     and new.meet_link is not null
     and new.meet_link !~ '^https://(meet\.google\.com|meet\.jit\.si)(/[^\s]*)?$' then
    raise exception 'Meeting link host is not allowed' using errcode = '42501';
  end if;

  return new;
end;
$fn$;

drop trigger if exists lessons_guard_update on public.lessons;
create trigger lessons_guard_update
  before update on public.lessons
  for each row execute function public.lessons_guard_update();

commit;
