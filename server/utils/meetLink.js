/**
 * Returns the Google Meet URL for a booking.
 * Set GOOGLE_MEET_LINK in server/.env to your persistent Meet room
 * (e.g. https://meet.google.com/abc-defg-hij from Google Calendar or meet.google.com).
 */
function getMeetLinkForBooking() {
  const link = process.env.GOOGLE_MEET_LINK?.trim();
  if (link && /^https:\/\/meet\.google\.com\//i.test(link)) {
    return link;
  }
  if (link) {
    return link.startsWith('http') ? link : `https://${link}`;
  }
  return null;
}

module.exports = { getMeetLinkForBooking };
