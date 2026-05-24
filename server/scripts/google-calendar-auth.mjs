/**
 * One-time OAuth setup for Google Calendar + unique Meet links.
 *
 * Run: npm run google-calendar-auth
 *
 * Uses paste mode (no localhost server required). After Allow, the browser
 * may show "can't be reached" — copy the FULL address bar URL anyway.
 */
import readline from 'readline';
import fs from 'fs';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

// Use GOOGLE_OAUTH_REDIRECT_URI in .env, or pass: npm run google-calendar-auth -- production
const useProduction = process.argv.includes('production');
const REDIRECT_URI = useProduction
  ? 'https://vaorb-merm.vercel.app'
  : process.env.GOOGLE_OAUTH_REDIRECT_URI || 'http://localhost:8765/oauth2callback';
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error(`
Missing in server/.env:
  GOOGLE_OAUTH_CLIENT_ID
  GOOGLE_OAUTH_CLIENT_SECRET

Google Cloud → Credentials → redirect URI must include:
  ${REDIRECT_URI}
`);
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: SCOPES,
});

function parseCode(input) {
  const raw = input.trim();
  if (!raw) return null;
  if (raw.includes('code=')) {
    const href = raw.startsWith('http') ? raw : `http://local?${raw.replace(/^\?/, '')}`;
    const u = new URL(href);
    return u.searchParams.get('code');
  }
  return raw;
}

function setEnvLine(content, key, value) {
  const line = `${key}=${value}`;
  const re = new RegExp(`^${key}=.*$`, 'm');
  return re.test(content) ? content.replace(re, line) : `${content.trimEnd()}\n${line}\n`;
}

function saveTokensToEnv(refreshToken) {
  let content = fs.readFileSync(envPath, 'utf8');
  content = setEnvLine(content, 'GOOGLE_OAUTH_REFRESH_TOKEN', refreshToken);
  content = setEnvLine(content, 'GOOGLE_OAUTH_REDIRECT_URI', REDIRECT_URI);
  fs.writeFileSync(envPath, content, 'utf8');
}

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

console.log(`
=== Google Calendar OAuth (paste mode) ===

Your Cloud Console redirect URI is correct:
  ${REDIRECT_URI}

STEP 1 — Open this URL (same or any computer; sign in as accounts@thevaorbit.com):

${authUrl}

STEP 2 — Click Allow.

STEP 3 — After Allow, copy the ENTIRE address bar (must include ?code=).
         Examples:
           ${REDIRECT_URI}?code=4/0A...
         ${REDIRECT_URI.includes('localhost') ? '(localhost page may say "can\'t be reached" — still copy the URL)' : '(your site will load — copy the URL from the address bar)'}

STEP 4 — Paste it below (use a NEW link each time; codes expire in ~1 minute).
`);

const pasted = await ask('Paste redirect URL here: ');

if (!pasted.includes('code=')) {
  console.error(`
Wrong paste — you need the URL from AFTER clicking Allow (must contain ?code=).

Expected redirect: ${REDIRECT_URI}?code=4/0A...

You pasted:
  ${pasted.slice(0, 80)}${pasted.length > 80 ? '...' : ''}

Run again:
  npm run google-calendar-auth
  npm run google-calendar-auth -- production   (if using vaorb-merm.vercel.app redirect)
`);
  process.exit(1);
}

const code = parseCode(pasted);

if (!code) {
  console.error('\nNo code found. Copy the full localhost URL from the address bar.\n');
  process.exit(1);
}

try {
  const { tokens } = await oauth2Client.getToken(code);
  if (!tokens.refresh_token) {
    console.error(`
No refresh_token returned.

1. Revoke this app: https://myaccount.google.com/permissions
2. Run again: npm run google-calendar-auth
3. Use a fresh URL (do not reuse an old code)
`);
    process.exit(1);
  }

  saveTokensToEnv(tokens.refresh_token);

  console.log(`
Success — refresh token saved to server/.env

Next: npm run test-meet-booking
Then add the same OAuth vars to Vercel and redeploy.
`);
} catch (err) {
  const msg = err.message || String(err);
  console.error(`\nExchange failed: ${msg}\n`);
  if (/invalid_grant/i.test(msg)) {
    console.error(`Common fixes:
  • Run npm run google-calendar-auth again and use a brand-new code immediately
  • Revoke app access and re-approve: https://myaccount.google.com/permissions
  • Confirm redirect URI in Cloud Console is exactly: ${REDIRECT_URI}
`);
  }
  process.exit(1);
}
