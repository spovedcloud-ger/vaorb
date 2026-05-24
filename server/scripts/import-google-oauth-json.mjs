/**
 * Import client_id + client_secret from Google OAuth JSON into server/.env
 * (Does NOT contain refresh_token — get that via npm run google-calendar-auth)
 *
 * node scripts/import-google-oauth-json.mjs "C:/path/to/client_secret_....json"
 */
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const jsonPath = process.argv[2];
if (!jsonPath) {
  console.error('Usage: node scripts/import-google-oauth-json.mjs <path-to-client_secret.json>');
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const web = raw.web || raw.installed || raw;
const clientId = web.client_id;
const clientSecret = web.client_secret;

if (!clientId || !clientSecret) {
  console.error('JSON must contain client_id and client_secret under "web" or "installed".');
  process.exit(1);
}

const envPath = join(dirname(fileURLToPath(import.meta.url)), '..', '.env');
let content = fs.readFileSync(envPath, 'utf8');

function setEnv(key, value) {
  const line = `${key}=${value}`;
  const re = new RegExp(`^${key}=.*$`, 'm');
  content = re.test(content) ? content.replace(re, line) : `${content.trimEnd()}\n${line}\n`;
}

setEnv('GOOGLE_OAUTH_CLIENT_ID', clientId);
setEnv('GOOGLE_OAUTH_CLIENT_SECRET', clientSecret);

fs.writeFileSync(envPath, content, 'utf8');

console.log('Updated server/.env with client_id and client_secret from JSON.');
console.log('');
console.log('The JSON file is NOT a refresh token.');
console.log('Next: npm run google-calendar-auth -- production');
console.log('      (or without -- production for localhost redirect)');
