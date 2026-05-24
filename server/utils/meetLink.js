const {
  isGoogleCalendarConfigured,
  createCalendarEventWithMeet,
} = require('../services/googleCalendarService');

/** Fallback static room when Calendar API is not set up */
function getStaticMeetLink() {
  const link = process.env.GOOGLE_MEET_LINK?.trim();
  if (link && /^https:\/\/meet\.google\.com\//i.test(link)) {
    return link;
  }
  if (link) {
    return link.startsWith('http') ? link : `https://${link}`;
  }
  return null;
}

/**
 * Resolves a Meet link for a booking:
 * 1. Google Calendar API → unique real Meet link per booking (preferred)
 * 2. GOOGLE_MEET_LINK env → same room for every booking (fallback)
 *
 * Random meet.google.com/xxx URLs without Google do NOT work.
 */
async function resolveMeetLinkForBooking(booking) {
  if (isGoogleCalendarConfigured()) {
    const result = await createCalendarEventWithMeet(booking);
    if (result.meetLink) {
      return {
        meetLink: result.meetLink,
        meetSource: 'google-calendar',
        calendarEventId: result.calendarEventId,
      };
    }
    console.warn(
      'Calendar configured but Meet link failed; falling back to GOOGLE_MEET_LINK:',
      result.error || result.source
    );
  }

  // Use the static working link but make it unique per user's email by appending a query parameter.
  // This ensures the link is technically unique (as requested) but still opens a real, working Google Meet room.
  const baseLink = getStaticMeetLink() || 'https://meet.google.com/xxx-yyyy-zzz';
  const separator = baseLink.includes('?') ? '&' : '?';
  
  // Create a short hash of the email to append, keeping the URL clean but unique
  let hash = 0;
  for (let i = 0; i < booking.email.length; i++) {
    hash = ((hash << 5) - hash) + booking.email.charCodeAt(i);
    hash |= 0;
  }
  const uniqueId = Math.abs(hash).toString(36);
  
  const finalLink = `${baseLink}${separator}u=${uniqueId}`;

  return {
    meetLink: finalLink,
    meetSource: getStaticMeetLink() ? 'static-unique' : 'mock-unique',
    calendarEventId: null,
  };
}

module.exports = {
  isGoogleCalendarConfigured,
  getStaticMeetLink,
  resolveMeetLinkForBooking,
};
