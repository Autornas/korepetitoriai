/**
 * When a lesson starts and ends, in real time.
 *
 * `lessons.date` and `lessons.time` are wall-clock columns with no zone
 * attached. The profile availability grid already tells teachers that means
 * Europe/Vilnius, so that is what this module assumes — explicitly, rather
 * than by accident.
 *
 * It has to be explicit, because the previous `Date.parse(`${date}T${time}`)`
 * resolved against *the server's* timezone. In development that is a Lithuanian
 * laptop and the answer is right; in production the container runs in UTC, so
 * a row reading `10:00` — meaning 08:00Z — was read as 10:00Z, and every lesson
 * appeared to start two or three hours later than it really did. That was
 * survivable when the only consumer was a join-button countdown. It is not
 * survivable now: the same comparison decides whether a lesson counts as
 * taught, whether its price is added to a teacher's earnings, and whether a
 * student is allowed to rate it.
 *
 * `public.lesson_ended(date, time)` in db/migrations/teacher_dashboard.sql is
 * the SQL half of this rule and must agree with it.
 */

export const LESSON_TIMEZONE = 'Europe/Vilnius';

/** How long a lesson is assumed to run. Also the join window's back edge. */
export const LESSON_DURATION_MS = 60 * 60 * 1000;

/**
 * Offset of `timeZone` from UTC at a given instant, in milliseconds.
 *
 * Formats the instant *as* that zone's wall clock, reads the pieces back as
 * though they were UTC, and takes the difference. That is the offset the zone
 * was actually using at that moment — DST included — without shipping a
 * timezone table of our own.
 */
function zoneOffsetMs(instantMs, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(instantMs);

  const at = {};
  for (const part of parts) at[part.type] = part.value;

  const asIfUtc = Date.UTC(
    Number(at.year),
    Number(at.month) - 1,
    Number(at.day),
    Number(at.hour),
    Number(at.minute),
    Number(at.second),
  );
  return asIfUtc - instantMs;
}

/**
 * Turn a stored `YYYY-MM-DD` + `HH:MM[:SS]` pair into a real instant.
 *
 * The offset is applied twice on purpose. The first pass asks "what offset is
 * in force near this wall-clock time?" using a UTC-shaped guess, which is off
 * by the offset itself; the second pass re-asks at the corrected instant. Only
 * the hour or two either side of a DST switch can disagree between the two,
 * and the second answer is the right one there.
 *
 * @returns {number} epoch milliseconds, or NaN if the row is malformed.
 */
export function lessonStartMs(date, time) {
  const day = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(date ?? ''));
  const clock = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(String(time ?? ''));
  if (!day || !clock) return Number.NaN;

  const naiveUtc = Date.UTC(
    Number(day[1]),
    Number(day[2]) - 1,
    Number(day[3]),
    Number(clock[1]),
    Number(clock[2]),
    Number(clock[3] ?? 0),
  );

  const firstPass = zoneOffsetMs(naiveUtc, LESSON_TIMEZONE);
  const settled = zoneOffsetMs(naiveUtc - firstPass, LESSON_TIMEZONE);
  return naiveUtc - settled;
}

/** Instant the lesson is considered finished. */
export function lessonEndMs(date, time) {
  return lessonStartMs(date, time) + LESSON_DURATION_MS;
}

/**
 * Has this lesson been taught?
 *
 * `accepted` and finished. A cancelled lesson (`rejected`) never counts, which
 * is also how a reschedule is expressed — the old row is cancelled and a new
 * one created — so a moved lesson is neither double-counted nor counted at its
 * original time.
 */
export function isLessonTaught(lesson, now = Date.now()) {
  if (lesson?.status !== 'accepted') return false;
  const end = lessonEndMs(lesson.date, lesson.time);
  return Number.isFinite(end) && end <= now;
}

/**
 * How far from now a lesson may be *created*.
 *
 * Mirrors `public.lesson_schedulable(date, time)` in
 * db/migrations/teacher_dashboard.sql, which is the authority — this half
 * exists so the teacher gets a sentence instead of a row-level-security
 * denial. Change both or neither.
 */
export const SCHEDULE_BACKDATE_LIMIT_MS = 30 * 24 * 60 * 60 * 1000;
export const SCHEDULE_FUTURE_LIMIT_MS = 2 * 365 * 24 * 60 * 60 * 1000;

/**
 * May a lesson be placed at this date and time?
 *
 * A money control rather than input validation. Lessons are created already
 * `accepted` and carry their own price, and a past-dated one counts as taught
 * immediately — so an unbounded date lets a teacher fabricate a back-catalogue
 * of finished, priced lessons and inflate the payout figure an admin works
 * from.
 */
export function isSchedulable(date, time, now = Date.now()) {
  const start = lessonStartMs(date, time);
  if (!Number.isFinite(start)) return false;
  return start >= now - SCHEDULE_BACKDATE_LIMIT_MS
    && start <= now + SCHEDULE_FUTURE_LIMIT_MS;
}

/** Accepted and still ahead of us. */
export function isLessonUpcoming(lesson, now = Date.now()) {
  if (lesson?.status !== 'accepted') return false;
  const end = lessonEndMs(lesson.date, lesson.time);
  return Number.isFinite(end) && end > now;
}
