// Google Calendar API helpers.
//
// The browser holds a Google OAuth access token (Supabase `provider_token`)
// after the student signs in via Google. We use it to create a Calendar
// event with `conferenceData.createRequest`, which makes Google attach a
// Meet link to the event automatically.
//
// Setup required outside this file:
//   1. Enable "Google Calendar API" in your Google Cloud project.
//   2. In Supabase → Authentication → Providers → Google, set the scope to
//      include `https://www.googleapis.com/auth/calendar.events`.
//   3. Make sure the student logs in via Google (email/password users have
//      no provider_token, so this call will fail gracefully).

const CALENDAR_ENDPOINT =
  'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1';

/**
 * Create a Calendar event with a Google Meet link attached.
 * @param {Object} args
 * @param {string} args.token        Google OAuth access token (provider_token).
 * @param {string} args.lessonId     Used as the conference requestId.
 * @param {string} args.summary      Event title.
 * @param {string} args.description  Event description.
 * @param {string} args.date         YYYY-MM-DD.
 * @param {string} args.time         HH:MM:SS.
 * @param {number} args.durationMin  Lesson duration in minutes (default 60).
 * @param {string} args.timeZone     IANA tz, default Europe/Vilnius.
 * @param {string[]} args.attendeeEmails  Emails of student + teacher.
 * @returns {Promise<{ meetLink: string, eventId: string }>}
 */
export async function createMeetEvent({
  token,
  lessonId,
  summary,
  description,
  date,
  time,
  durationMin = 60,
  timeZone = 'Europe/Vilnius',
  attendeeEmails = [],
}) {
  if (!token) throw new Error('Missing Google OAuth token.');
  if (!lessonId || !date || !time) throw new Error('Missing event fields.');

  const startISO = `${date}T${time.length === 5 ? `${time}:00` : time}`;
  const endDate = new Date(`${startISO}`);
  endDate.setMinutes(endDate.getMinutes() + durationMin);
  const pad = (n) => String(n).padStart(2, '0');
  const endISO =
    `${endDate.getFullYear()}-${pad(endDate.getMonth() + 1)}-${pad(endDate.getDate())}` +
    `T${pad(endDate.getHours())}:${pad(endDate.getMinutes())}:00`;

  const body = {
    summary,
    description,
    start: { dateTime: startISO, timeZone },
    end:   { dateTime: endISO,   timeZone },
    attendees: attendeeEmails.filter(Boolean).map(email => ({ email })),
    conferenceData: {
      createRequest: {
        requestId: lessonId,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
    guestsCanInviteOthers: false,
    guestsCanModify: false,
  };

  const res = await fetch(CALENDAR_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const err = new Error(`Calendar API error: ${res.status} ${text}`);
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  const meetLink =
    data.hangoutLink ??
    data.conferenceData?.entryPoints?.find(e => e.entryPointType === 'video')?.uri ??
    null;

  return { meetLink, eventId: data.id };
}
