import { readFileSync, statSync } from 'node:fs';

const checks = [
  ['public/images/photo.jpg', Buffer.from([0xff, 0xd8, 0xff])],
  ['public/docs/resume.pdf', Buffer.from('%PDF-')],
  ['public/docs/admission-letter.pdf', Buffer.from('%PDF-')],
  ['public/docs/papers/crowdfunding-paper.pdf', Buffer.from('%PDF-')],
];

let failed = false;
for (const [path, magic] of checks) {
  let buf;
  try {
    buf = readFileSync(path);
  } catch {
    console.error(`MISSING ${path}`);
    failed = true;
    continue;
  }
  const ok = buf.subarray(0, magic.length).equals(magic);
  console.log(`${ok ? 'OK     ' : 'INVALID'} ${path} (${statSync(path).size} bytes)`);
  if (!ok) failed = true;
}
process.exit(failed ? 1 : 0);
