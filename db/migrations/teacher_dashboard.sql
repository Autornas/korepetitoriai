-- Teacher earnings dashboard, lesson ratings, admin-assigned students, and a
-- single platform payout account.
--
-- Four connected changes, in one file because they only make sense together:
--
--   1. Students no longer book lessons. An admin pairs a student with a
--      teacher (`teacher_students`) and the teacher creates the lessons. That
--      pairing is what authorises the lesson, so a lesson is born `accepted`
--      rather than waiting for the student to press a button.
--   2. A lesson carries the price the teacher set for it (`lessons.price`),
--      fixed at creation. Earnings are summed from it.
--   3. A student rates a lesson once it has ended (`lesson_ratings`); the
--      average is what the teacher's dashboard shows.
--   4. Money is paid to one platform account (`platform_billing`), not to the
--      teacher's own IBAN, and only an admin may change it.
--
-- Apply via Supabase SQL editor or `supabase db push`.
-- Must run after security_hardening_2.sql.
--
-- Take a database backup before running this: it replaces policies, drops the
-- student-insert path on `lessons`, and changes the return type of
-- `lesson_counterpart_profile`.

begin;

-- ---------------------------------------------------------------------------
-- 0. Shared rule: when has a lesson ended?
-- ---------------------------------------------------------------------------
-- `date` and `time` are wall-clock columns with no zone attached, and the
-- profile availability grid already tells teachers it means Europe/Vilnius.
-- Spelling that out here matters: Postgres on Supabase runs in UTC, so
-- comparing `date + time` against `now()` without a zone would call a lesson
-- finished two or three hours before it actually is -- and this predicate is
-- what decides whether money is earned and whether a student may rate.
--
-- Mirrored in JS by lessonEndMs() in src/server/services/schedule.js. Change
-- both or neither.
create or replace function public.lesson_ended(p_date date, p_time time)
returns boolean
language sql
stable
set search_path = public
as $fn$
  select ((p_date + p_time) at time zone 'Europe/Vilnius')
           + interval '60 minutes' < now();
$fn$;

grant execute on function public.lesson_ended(date, time) to authenticated;

-- How far from now a lesson may be *created*.
--
-- This is a money control, not a convenience check. A lesson is created
-- already `accepted` and carries its own price, and `lesson_ended` calls a
-- past-dated one taught the instant it exists — so without a floor here a
-- teacher can mint an unlimited back-catalogue of finished, priced lessons for
-- a student an admin paired them with once, mark each one paid (only the
-- teacher is asked), and hand the admin a fabricated payout figure that
-- `price`'s own immutability then makes impossible to correct.
--
-- Thirty days back keeps the legitimate case — logging a lesson taught last
-- week that nobody got round to entering — while bounding fabrication to a
-- window an admin can actually eyeball. Two years forward is a sanity bound
-- against a typo'd year rather than a threat.
create or replace function public.lesson_schedulable(p_date date, p_time time)
returns boolean
language sql
stable
set search_path = public
as $fn$
  select ((p_date + p_time) at time zone 'Europe/Vilnius')
           between now() - interval '30 days' and now() + interval '2 years';
$fn$;

grant execute on function public.lesson_schedulable(date, time) to authenticated;

-- ---------------------------------------------------------------------------
-- 1. teacher_students: who an admin has paired with whom
-- ---------------------------------------------------------------------------
-- This table replaces the student-initiated booking request as the thing that
-- authorises a teacher to put a lesson on a student's calendar. It is written
-- only through the service-role key, behind requireAdmin -- `authenticated`
-- gets SELECT on its own rows and nothing else, so a teacher cannot hand
-- themselves a student.
create table if not exists public.teacher_students (
  teacher_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (teacher_id, student_id),
  constraint teacher_students_distinct check (teacher_id <> student_id)
);

create index if not exists teacher_students_student_idx
  on public.teacher_students (student_id);

alter table public.teacher_students enable row level security;

revoke all on public.teacher_students from anon, authenticated;
grant select on public.teacher_students to authenticated;

-- Both sides may see that the pairing exists; neither may create one.
drop policy if exists "teacher_students_select_own" on public.teacher_students;
create policy "teacher_students_select_own"
  on public.teacher_students for select
  to authenticated
  using (auth.uid() = teacher_id or auth.uid() = student_id);

-- Backfill from the relationships that already exist.
--
-- Without this the table starts empty, and since it is now the only thing that
-- authorises a teacher to schedule, every teacher on the platform would be
-- unable to book their current students until an admin re-entered each pair by
-- hand. The app would look broken the moment this migration lands.
--
-- `accepted` only, deliberately. Under the old model any student could send a
-- request to any teacher, so backfilling from `pending` rows would mint
-- assignments out of unsolicited requests that were never agreed to -- exactly
-- the consent the rest of this file is trying to establish.
insert into public.teacher_students (teacher_id, student_id)
select distinct l.teacher_id, l.student_id
  from public.lessons l
 where l.status = 'accepted'
   and l.teacher_id <> l.student_id
on conflict (teacher_id, student_id) do nothing;

-- ---------------------------------------------------------------------------
-- 2. lessons.price: what this lesson is worth
-- ---------------------------------------------------------------------------
-- Set by the teacher when they create the lesson and never again. Earnings
-- are a sum over this column, so a mutable price would silently rewrite
-- history -- and rewrite what a student was told to pay.
alter table public.lessons
  add column if not exists price numeric(8, 2);

do $do$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'lessons_price_range'
  ) then
    alter table public.lessons
      add constraint lessons_price_range
      check (price is null or (price >= 0 and price <= 10000));
  end if;
end
$do$;

-- ---------------------------------------------------------------------------
-- 3. lessons: only a teacher inserts, only for an assigned student
-- ---------------------------------------------------------------------------
-- The student-insert path is gone entirely. The teacher path now writes
-- `accepted` directly, which the previous design deliberately forbade: a
-- teacher minting an accepted lesson against an arbitrary student id was
-- unsolicited DM access to anyone on the platform (see security_hardening.sql).
-- What makes it safe now is the `teacher_students` check below -- the teacher
-- can only reach students an admin already paired them with, and they cannot
-- write that table.
revoke all on public.lessons from anon, authenticated;

grant select on public.lessons to authenticated;
grant insert (student_id, teacher_id, date, time, subject, notes, status, created_by, price)
  on public.lessons to authenticated;
-- `price` is absent by design: fixed at creation.
grant update (status, meet_link, paid_at, updated_at)
  on public.lessons to authenticated;

drop policy if exists "lessons_insert_student" on public.lessons;

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
      select 1 from public.teacher_students ts
      where ts.teacher_id = auth.uid()
        and ts.student_id = lessons.student_id
    )
    -- Bounds when the lesson may be placed. Earnings are derived from rows
    -- that satisfy this policy, so the window is part of the money control,
    -- not input tidiness -- see lesson_schedulable() above.
    and public.lesson_schedulable(lessons.date, lessons.time)
  );

-- Either participant may still cancel (-> rejected). A cancelled lesson is
-- excluded from earnings, which is also how a reschedule is expressed: cancel
-- the old row, create a new one.
drop policy if exists "lessons_update_participants" on public.lessons;
create policy "lessons_update_participants"
  on public.lessons for update
  to authenticated
  using (auth.uid() = student_id or auth.uid() = teacher_id)
  with check (
    (auth.uid() = student_id or auth.uid() = teacher_id)
    and status in ('pending', 'accepted', 'rejected')
  );

-- ---------------------------------------------------------------------------
-- 4. lessons trigger: price joins the immutable set
-- ---------------------------------------------------------------------------
-- Same trigger as security_hardening_2.sql, with `price` added to the columns
-- that cannot change after insert. The GRANT above already withholds `price`
-- from UPDATE; re-checking here means a future re-grant cannot quietly reopen
-- it, which is the same reasoning applied to `role` on profiles.
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

  if new.id is distinct from old.id
     or new.student_id is distinct from old.student_id
     or new.teacher_id is distinct from old.teacher_id
     or new.created_by is distinct from old.created_by
     or new.payment_code is distinct from old.payment_code
     or new.price is distinct from old.price then
    raise exception 'This column cannot be changed' using errcode = '42501';
  end if;

  if new.status is distinct from old.status then
    -- A lesson is created `accepted` now, so the only move left is a
    -- cancellation. `pending` rows predate this migration and keep their
    -- original transitions so they can still be resolved.
    if not (
      (old.status = 'pending' and new.status in ('accepted', 'rejected'))
      or (old.status = 'accepted' and new.status = 'rejected')
    ) then
      raise exception 'Illegal lesson status transition (% -> %)',
        old.status, new.status using errcode = '42501';
    end if;

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

-- ---------------------------------------------------------------------------
-- 5. lesson_ratings: one rating per lesson, by the student, after it ended
-- ---------------------------------------------------------------------------
create table if not exists public.lesson_ratings (
  lesson_id  uuid primary key references public.lessons(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  teacher_id uuid not null references auth.users(id) on delete cascade,
  stars      smallint not null check (stars between 1 and 5),
  comment    text check (comment is null or length(comment) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists lesson_ratings_teacher_idx
  on public.lesson_ratings (teacher_id);

alter table public.lesson_ratings enable row level security;

revoke all on public.lesson_ratings from anon, authenticated;
grant select on public.lesson_ratings to authenticated;
-- `updated_at` is in the INSERT list because the service writes it on the
-- first rating too, so "last touched" is meaningful without a second write.
grant insert (lesson_id, student_id, teacher_id, stars, comment, updated_at)
  on public.lesson_ratings to authenticated;
-- The three columns that decide whose rating this is are absent from UPDATE on
-- purpose: a rating must not be movable onto another lesson or teacher. That
-- is also why src/server/services/ratings.js inserts or updates explicitly
-- rather than using PostgREST's upsert, which would need UPDATE on all of them.
grant update (stars, comment, updated_at) on public.lesson_ratings to authenticated;

-- Read: the student who wrote it and the teacher it is about. Ratings are
-- deliberately not part of the public profile -- the ask was to show a teacher
-- their own rating, not to publish a league table.
drop policy if exists "lesson_ratings_select_participants" on public.lesson_ratings;
create policy "lesson_ratings_select_participants"
  on public.lesson_ratings for select
  to authenticated
  using (auth.uid() = student_id or auth.uid() = teacher_id);

-- Write: only the student on that lesson, only once the lesson has actually
-- happened, and `teacher_id` must be the real teacher -- otherwise a student
-- could post a one-star review onto a teacher they never met.
drop policy if exists "lesson_ratings_insert_student" on public.lesson_ratings;
create policy "lesson_ratings_insert_student"
  on public.lesson_ratings for insert
  to authenticated
  with check (
    auth.uid() = student_id
    and exists (
      select 1 from public.lessons l
      where l.id = lesson_ratings.lesson_id
        and l.student_id = auth.uid()
        and l.teacher_id = lesson_ratings.teacher_id
        and l.status = 'accepted'
        and public.lesson_ended(l.date, l.time)
    )
  );

-- A student may revise their own rating; nobody may revise somebody else's.
drop policy if exists "lesson_ratings_update_student" on public.lesson_ratings;
create policy "lesson_ratings_update_student"
  on public.lesson_ratings for update
  to authenticated
  using (auth.uid() = student_id)
  with check (auth.uid() = student_id);

-- The columns that decide *whose* rating this is are fixed once written.
create or replace function public.lesson_ratings_guard_update()
returns trigger
language plpgsql
set search_path = public
as $fn$
begin
  if auth.uid() is null then
    return new;
  end if;
  if new.lesson_id is distinct from old.lesson_id
     or new.student_id is distinct from old.student_id
     or new.teacher_id is distinct from old.teacher_id then
    raise exception 'This column cannot be changed' using errcode = '42501';
  end if;
  return new;
end;
$fn$;

drop trigger if exists lesson_ratings_guard_update on public.lesson_ratings;
create trigger lesson_ratings_guard_update
  before update on public.lesson_ratings
  for each row execute function public.lesson_ratings_guard_update();

-- ---------------------------------------------------------------------------
-- 6. platform_billing: one payout account, admin-owned
-- ---------------------------------------------------------------------------
-- Single row, enforced by the primary key plus `check (id)` -- `true` is the
-- only value the column accepts, so a second row cannot exist.
--
-- No INSERT/UPDATE/DELETE grant to `authenticated` at all: the only writer is
-- the service-role client behind requireAdmin. That is the same reasoning as
-- ADMIN_EMAILS itself -- there is no admin flag in this database that the app
-- could flip, so the database cannot express "only an admin", and the right
-- answer is to let it express "nobody" and keep the decision in server env.
create table if not exists public.platform_billing (
  id         boolean primary key default true check (id),
  iban       text,
  holder     text,
  bank_name  text,
  note       text,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

insert into public.platform_billing (id) values (true) on conflict (id) do nothing;

alter table public.platform_billing enable row level security;

revoke all on public.platform_billing from anon, authenticated;
-- Payout columns only. `updated_by` says which admin touched it last and is
-- nobody else's business.
grant select (id, iban, holder, bank_name, note, updated_at)
  on public.platform_billing to authenticated;

-- Readable by any signed-in user: this is the account students are asked to
-- transfer to, so it is a payee address rather than a secret.
drop policy if exists "platform_billing_select_authenticated" on public.platform_billing;
create policy "platform_billing_select_authenticated"
  on public.platform_billing for select
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- 7. lesson_counterpart_profile: stop releasing the teacher's own IBAN
-- ---------------------------------------------------------------------------
-- Payment no longer goes to the teacher personally, so handing a student the
-- teacher's personal bank details is now pure PII leakage with no purpose.
-- `profiles.bank_iban` is left in place rather than dropped so existing values
-- are not destroyed, but nothing reads it any more and the profile form no
-- longer writes it. Drop the column once you are satisfied nothing needs it.
drop function if exists public.lesson_counterpart_profile(uuid);

create function public.lesson_counterpart_profile(p_lesson_id uuid)
returns table (
  id uuid, name text, email text, phone text, photo_url text,
  headline text, price_60 numeric, grade text,
  learning_struggles text, expectations text
)
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_lesson public.lessons%rowtype;
  v_is_student boolean;
begin
  select * into v_lesson from public.lessons l where l.id = p_lesson_id;
  if not found then
    raise exception 'Lesson not found' using errcode = 'PGRST116';
  end if;

  if auth.uid() <> v_lesson.student_id and auth.uid() <> v_lesson.teacher_id then
    raise exception 'Not a participant' using errcode = '42501';
  end if;

  v_is_student := auth.uid() = v_lesson.student_id;

  return query
  select p.id, p.name, p.email, p.phone, p.photo_url,
         p.headline, p.price_60,
         case when v_is_student then null else p.grade end,
         case when v_is_student then null else p.learning_struggles end,
         case when v_is_student then null else p.expectations end
  from public.profiles p
  where p.id = case when v_is_student then v_lesson.teacher_id
                    else v_lesson.student_id end;
end;
$fn$;

revoke all on function public.lesson_counterpart_profile(uuid) from public, anon;
grant execute on function public.lesson_counterpart_profile(uuid) to authenticated;

-- `bank_iban` also leaves the self-service UPDATE grant: the profile form no
-- longer offers the field, and nothing should be able to set it by hand.
revoke update (bank_iban) on public.profiles from authenticated;

commit;
