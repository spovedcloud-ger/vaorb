/**
 * Push server/.env keys to Vercel (production, preview, development).
 * Usage: node scripts/push-vercel-env.mjs
 */
import { readFileSync } from 'fs';
import { spawnSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env');
const scope = 'spovedcloud-gers-projects';

const KEYS = [
  'MONGO_URI',
  'CONTACT_EMAIL',
  'SITE_NAME',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_SECURE',
  'SMTP_USER',
  'SMTP_PASS',
  'MAIL_FROM',
  'GOOGLE_MEET_LINK',
  'GOOGLE_OAUTH_CLIENT_ID',
  'GOOGLE_OAUTH_CLIENT_SECRET',
  'GOOGLE_OAUTH_REFRESH_TOKEN',
  'GOOGLE_OAUTH_REDIRECT_URI',
  'GOOGLE_CALENDAR_ID',
];

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

const env = parseEnv(readFileSync(envPath, 'utf8'));
const targets = ['production'];

for (const key of KEYS) {
  const value = env[key];
  if (!value) {
    console.log(`Skip ${key} (empty)`);
    continue;
  }
  for (const target of targets) {
    const r = spawnSync(
      'npx',
      ['vercel@latest', 'env', 'add', key, target, '--scope', scope, '--force', '--yes'],
      {
        input: value,
        encoding: 'utf8',
        cwd: join(__dirname, '..', '..'),
        shell: true,
      }
    );
    if (r.status !== 0) {
      console.error(`Failed ${key}@${target}:`, r.stderr || r.stdout);
      process.exit(1);
    }
  }
  console.log(`Set ${key} on production, preview, development`);
}

console.log('Done. Redeploy for env vars to apply.');
