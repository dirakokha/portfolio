/**
 * کپی بستهٔ Decap CMS به public/admin تا پنل مدیریت بدون CDN بیرونی کار کند.
 * (فقط فایل‌های لازم کپی می‌شوند؛ نقشهٔ منبع و نسخهٔ تکراری حذف می‌شوند.)
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const src = path.join(root, 'node_modules/decap-cms/dist');
const dest = path.join(root, 'public/admin');

if (!fs.existsSync(src)) {
  console.error('✗ بستهٔ decap-cms پیدا نشد. ابتدا npm install را اجرا کنید.');
  process.exit(0);
}

fs.mkdirSync(dest, { recursive: true });

let copied = 0;
let bytes = 0;
for (const file of fs.readdirSync(src)) {
  if (file.endsWith('.map') || file === 'cms.js' || file === 'cms.css') continue;
  const isMain = file === 'decap-cms.js';
  const isChunk = file.endsWith('.decap-cms.js');
  const isWasm = file.endsWith('.wasm');
  if (!isMain && !isChunk && !isWasm) continue;
  const from = path.join(src, file);
  const to = path.join(dest, file);
  fs.copyFileSync(from, to);
  copied += 1;
  bytes += fs.statSync(to).size;
}

console.log(`✓ Decap CMS: ${copied} فایل (${(bytes / 1024 / 1024).toFixed(1)} مگابایت) در public/admin`);
