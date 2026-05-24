/**
 * Build circular favicons from THEVAURL.png (transparent outside the circle).
 * Run: node scripts/generate-favicon.mjs
 */
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientRoot = path.join(__dirname, '..');
const src = path.join(clientRoot, 'src/assets/THEVAURL.png');
const publicDir = path.join(clientRoot, 'public');

async function makeCircularPng(size, outName, borderPx = 2) {
  const r = size / 2;
  const innerR = r - borderPx;

  const maskSvg = Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${r}" cy="${r}" r="${innerR}" fill="white"/>
    </svg>`
  );

  const borderSvg = Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${r}" cy="${r}" r="${innerR}" fill="none" stroke="#076fab" stroke-width="${borderPx * 2}"/>
    </svg>`
  );

  const resized = await sharp(src)
    .resize(size, size, { fit: 'cover', position: 'centre' })
    .ensureAlpha()
    .composite([{ input: maskSvg, blend: 'dest-in' }])
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: resized, top: 0, left: 0 },
      { input: borderSvg, top: 0, left: 0 },
    ])
    .png()
    .toFile(path.join(publicDir, outName));

  console.log('Wrote', outName);
}

if (!fs.existsSync(src)) {
  console.error('Missing source image:', src);
  process.exit(1);
}

await makeCircularPng(32, 'favicon-32.png', 1);
await makeCircularPng(48, 'favicon-48.png', 1);
await makeCircularPng(128, 'assets/THEVAURL.png', 2);
await makeCircularPng(192, 'apple-touch-icon.png', 3);

console.log('Done — tab logo: /assets/THEVAURL.png (circular)');
