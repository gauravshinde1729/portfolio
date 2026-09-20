import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';
import { resume } from '../src/data/resume.ts';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// favicon.ico: a single 32x32 PNG wrapped in an ICO container.
const svg = readFileSync('public/favicon.svg');
const png32 = await sharp(svg).resize(32, 32).png().toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(1, 4); // image count
header[6] = 32; // width
header[7] = 32; // height
header.writeUInt16LE(1, 10); // planes
header.writeUInt16LE(32, 12); // bit depth
header.writeUInt32LE(png32.length, 14); // image size
header.writeUInt32LE(22, 18); // image offset
writeFileSync('public/favicon.ico', Buffer.concat([header, png32]));

// og.png: 1200x630, terminal-styled card with the circular photo.
const W = 1200;
const H = 630;
const D = 360;
const cx = 900;
const cy = 315;

const photo = await sharp('public/images/photo.jpg')
  .resize(D, D, { fit: 'cover', position: sharp.strategy.attention })
  .png()
  .toBuffer();
const mask = Buffer.from(`<svg width="${D}" height="${D}"><circle cx="${D / 2}" cy="${D / 2}" r="${D / 2}" fill="#fff"/></svg>`);
const circle = await sharp(photo).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();

const card = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#0d1117"/>
  <circle cx="${cx}" cy="${cy}" r="${D / 2 + 12}" fill="none" stroke="#00ff41" stroke-width="4" opacity="0.85"/>
  <text x="80" y="235" font-family="monospace" font-size="34" fill="#8b949e">$ whoami</text>
  <text x="80" y="315" font-family="monospace" font-size="64" font-weight="700" fill="#00ff41">${esc(resume.name)}</text>
  <text x="80" y="375" font-family="monospace" font-size="30" fill="#f0c040">${esc(resume.headline)}</text>
  <rect x="80" y="405" width="22" height="40" fill="#00ff41"/>
</svg>`);

await sharp(card)
  .composite([{ input: circle, left: cx - D / 2, top: cy - D / 2 }])
  .png()
  .toFile('public/og.png');

console.log('wrote public/favicon.ico and public/og.png');
