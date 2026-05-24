/**
 * Push Google OAuth + Calendar env vars to Vercel production.
 */
import { readFileSync } from 'fs';
import { spawnSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env');
const cwd = join(__dirname, '..', '..');
const scope = 'spovedcloud-gers-projects';

function parseEnv(content) {
  const out = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const i = trimmed.indexOf('=');
    if (i === -1) continue;
    out[trimmed.slice(0, i).trim()] = trimmed.slice(i + 1).trim();
  }
  return out;
}

const vars = parseEnv(readFileSync(envPath, 'utf8'));

// Prefer .env refresh token when present
const keys = [
  'GOOGLE_OAUTH_CLIENT_ID',
  'GOOGLE_OAUTH_CLIENT_SECRET',
  'GOOGLE_OAUTH_REFRESH_TOKEN',
  'GOOGLE_CALENDAR_ID',
  'GOOGLE_OAUTH_REDIRECT_URI',
];

for (const key of keys) {
  const value = vars[key];
  if (!value) {
    console.log(`Skip ${key} (empty — set in server/.env or complete OAuth first)`);
    continue;
  }
  const r = spawnSync(
    'npx',
    ['vercel@latest', 'env', 'add', key, 'production', '--scope', scope, '--force', '--yes'],
    { input: value, encoding: 'utf8', cwd, shell: true }
  );
  if (r.status !== 0) {
    console.error(`Failed ${key}:`, r.stderr || r.stdout);
    process.exit(1);
  }
  console.log(`Set ${key} on production`);
}

console.log('Done.');
