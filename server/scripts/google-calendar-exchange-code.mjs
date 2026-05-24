/**
 * Exchange an OAuth authorization code for a refresh token.
 * Use if localhost callback did not reach the auth server.
 *
 * Paste either the full redirect URL or just the code:
 *   node scripts/google-calendar-exchange-code.mjs "http://localhost:8765/oauth2callback?code=4/0A..."
 */
import { google } from 'googleapis';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

const raw = process.argv[2]?.trim();
if (!raw) {
  console.error('Usage: node scripts/google-calendar-exchange-code.mjs "<redirect-url-or-code>"');
  process.exit(1);
}

let code = raw;
try {
  if (raw.includes('code=')) {
    const u = new URL(raw.startsWith('http') ? raw : `http://x?${raw}`);
    code = u.searchParams.get('code') || raw;
  }
} catch {
  /* use raw as code */
}

const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
const redirectUri =
  process.env.GOOGLE_OAUTH_REDIRECT_URI || 'http://localhost:8765/oauth2callback';

if (!clientId || !clientSecret) {
  console.error('Set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET in server/.env');
  process.exit(1);
}

const oauth2 = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

try {
  const { tokens } = await oauth2.getToken(code);
  if (!tokens.refresh_token) {
    console.error(
      'No refresh_token returned. Revoke app access at https://myaccount.google.com/permissions and run google-calendar-auth again with prompt=consent.'
    );
    process.exit(1);
  }
  console.log('\nAdd to server/.env:\n');
  console.log(`GOOGLE_OAUTH_REFRESH_TOKEN=${tokens.refresh_token}`);
  console.log('');
} catch (err) {
  console.error('Exchange failed:', err.message);
  process.exit(1);
}
