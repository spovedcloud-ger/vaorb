/**
 * Set Google OAuth client vars on Vercel (production).
 * Usage: node scripts/set-vercel-oauth.mjs
 */
import { readFileSync } from 'fs';
import { spawnSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env');
const scope = 'spovedcloud-gers-projects';
const cwd = join(__dirname, '..', '..');

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
const VARS = {
  GOOGLE_OAUTH_CLIENT_ID: vars.GOOGLE_OAUTH_CLIENT_ID,
  GOOGLE_OAUTH_CLIENT_SECRET: vars.GOOGLE_OAUTH_CLIENT_SECRET,
};

for (const target of ['production']) {
  for (const [key, value] of Object.entries(VARS)) {
    if (!value) {
      console.log(`Skip ${key} (empty)`);
      continue;
    }
    const r = spawnSync(
      'npx',
      ['vercel@latest', 'env', 'add', key, target, '--scope', scope, '--force', '--yes'],
      { input: value, encoding: 'utf8', cwd, shell: true }
    );
    if (r.status !== 0) {
      console.error(`Failed ${key}@${target}:`, r.stderr || r.stdout);
      process.exit(1);
    }
    console.log(`Set ${key} → ${target}`);
  }
}

console.log('Done.');
