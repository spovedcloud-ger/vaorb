const crypto = require('crypto');
const { google } = require('googleapis');
const { getCallTypeLabel } = require('../utils/bookingFormat');

const SITE_NAME = process.env.SITE_NAME || 'The VA Orbit';
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'accounts@thevaorbit.com';
const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar';

const DURATION_MINUTES = {
  discovery: 15,
  strategy: 30,
  consultation: 15,
};

/** Service account + Workspace domain delegation */
function isServiceAccountConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_EMAIL &&
      process.env.GOOGLE_PRIVATE_KEY &&
      (process.env.GOOGLE_CALENDAR_IMPERSONATE || CONTACT_EMAIL)
  );
}

/** OAuth refresh token for accounts@thevaorbit.com (no service account needed) */
function isOAuthConfigured() {
  return Boolean(
    process.env.GOOGLE_OAUTH_CLIENT_ID &&
      process.env.GOOGLE_OAUTH_CLIENT_SECRET &&
      process.env.GOOGLE_OAUTH_REFRESH_TOKEN
  );
}

function isGoogleCalendarConfigured() {
  return isServiceAccountConfigured() || isOAuthConfigured();
}

async function getCalendarAuth() {
  if (isServiceAccountConfigured()) {
    const key = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key,
      scopes: [CALENDAR_SCOPE],
      subject: process.env.GOOGLE_CALENDAR_IMPERSONATE || CONTACT_EMAIL,
    });
    return auth;
  }

  if (isOAuthConfigured()) {
    const oauth2 = new google.auth.OAuth2(
      process.env.GOOGLE_OAUTH_CLIENT_ID,
      process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      process.env.GOOGLE_OAUTH_REDIRECT_URI || 'http://localhost:8765/oauth2callback'
    );
    oauth2.setCredentials({
      refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN,
    });
    return oauth2;
  }

  return null;
}

function getCalendarId() {
  return (
    process.env.GOOGLE_CALENDAR_ID ||
    process.env.GOOGLE_CALENDAR_IMPERSONATE ||
    CONTACT_EMAIL
  );
}

function buildEventTimes(booking) {
  const tz = booking.timezone || 'UTC';
  const [h, mi] = booking.time.split(':').map(Number);
  const duration = DURATION_MINUTES[booking.callType] || 15;
  const endTotal = h * 60 + mi + duration;
  const endH = String(Math.floor(endTotal / 60)).padStart(2, '0');
  const endM = String(endTotal % 60).padStart(2, '0');

  return {
    start: { dateTime: `${booking.date}T${booking.time}:00`, timeZone: tz },
    end: { dateTime: `${booking.date}T${endH}:${endM}:00`, timeZone: tz },
  };
}

function extractMeetLink(event) {
  if (event.hangoutLink) return event.hangoutLink;
  const video = event.conferenceData?.entryPoints?.find(
    (e) => e.entryPointType === 'video' || /meet\.google\.com/i.test(e.uri || '')
  );
  return video?.uri || null;
}

/**
 * Creates a Calendar event with a unique Google Meet link (real link from Google).
 * Auth: service account (Workspace) OR OAuth refresh token for accounts@thevaorbit.com.
 *
 * Note: GOOGLE_API_KEY alone cannot create events or Meet links.
 */
async function createCalendarEventWithMeet(booking) {
  if (!isGoogleCalendarConfigured()) {
    return { meetLink: null, calendarEventId: null, source: 'none' };
  }

  try {
    const auth = await getCalendarAuth();
    if (!auth) {
      return { meetLink: null, calendarEventId: null, source: 'none' };
    }

    const calendar = google.calendar({ version: 'v3', auth });
    const { start, end } = buildEventTimes(booking);

    const response = await calendar.events.insert({
      calendarId: getCalendarId(),
      conferenceDataVersion: 1,
      sendUpdates: 'none',
      requestBody: {
        summary: `${SITE_NAME} — ${getCallTypeLabel(booking.callType)} · ${booking.name}`,
        description: [
          `Guest: ${booking.name} <${booking.email}>`,
          booking.notes ? `\nNotes:\n${booking.notes}` : '',
        ].join(''),
        start,
        end,
        attendees: [{ email: booking.email }, { email: CONTACT_EMAIL }],
        conferenceData: {
          createRequest: {
            requestId: crypto.randomUUID(),
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      },
    });

    const meetLink = extractMeetLink(response.data);
    if (!meetLink) {
      console.warn('Calendar event created but no Meet link returned:', response.data.id);
    }

    return {
      meetLink,
      calendarEventId: response.data.id,
      source: meetLink ? 'google-calendar' : 'calendar-no-meet',
    };
  } catch (err) {
    console.error('Google Calendar API error:', err.message);
    return { meetLink: null, calendarEventId: null, source: 'error', error: err.message };
  }
}

module.exports = {
  isGoogleCalendarConfigured,
  isOAuthConfigured,
  isServiceAccountConfigured,
  createCalendarEventWithMeet,
};
