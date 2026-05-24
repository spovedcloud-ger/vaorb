/**
 * Test unique Meet link creation (no HTTP server needed).
 * Run: node scripts/test-meet-booking.mjs
 */
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

const require = createRequire(import.meta.url);
const { isGoogleCalendarConfigured } = require('../services/googleCalendarService');
const { resolveMeetLinkForBooking } = require('../utils/meetLink');

if (!isGoogleCalendarConfigured()) {
  console.error('Calendar not configured. Set GOOGLE_OAUTH_REFRESH_TOKEN in server/.env');
  process.exit(1);
}

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
while (tomorrow.getDay() === 0 || tomorrow.getDay() === 6) {
  tomorrow.setDate(tomorrow.getDate() + 1);
}
const date = tomorrow.toISOString().slice(0, 10);

const booking = {
  name: 'Meet Link Test',
  email: 'test-meet@example.com',
  date,
  time: '09:00',
  timezone: 'America/New_York',
  callType: 'discovery',
  notes: 'Automated test — safe to delete from Calendar',
};

console.log('Creating test calendar event...');
const result = await resolveMeetLinkForBooking(booking);

console.log('\n--- Result ---');
console.log('meetSource:', result.meetSource);
console.log('meetLink:', result.meetLink || '(none)');
console.log('calendarEventId:', result.calendarEventId || '(none)');

if (result.meetSource === 'google-calendar' && result.meetLink) {
  console.log('\nOK — unique Meet link created.');
  process.exit(0);
}

console.error('\nFailed — check Calendar API is enabled and token is valid.');
process.exit(1);
