/**
 * ساخت تصویر اشتراک‌گذاری (Open Graph) و آیکون‌ها از فایل‌های SVG.
 * اجرا: node scripts/make-og.mjs  (پس از build)
 *
 * فونت‌های این اسکریپت در scripts/fonts هستند و به خروجی سایت ارسال نمی‌شوند؛
 * فقط برای رندر تصویر در زمان build استفاده می‌شوند.
 */
import fs from 'node:fs';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import yaml from 'js-yaml';

const root = process.cwd();
const dist = path.join(root, 'dist');

const site = yaml.load(fs.readFileSync(path.join(root, 'content/site.yaml'), 'utf8'));
const contact = yaml.load(fs.readFileSync(path.join(root, 'content/contact.yaml'), 'utf8'));

// پرترهٔ کوچک برای کارت اشتراک‌گذاری (به‌صورت data URI داخل SVG جاسازی می‌شود)
const portraitPath = path.join(root, 'scripts/assets/og-portrait.jpg');
const portraitUri = fs.existsSync(portraitPath)
  ? `data:image/jpeg;base64,${fs.readFileSync(portraitPath).toString('base64')}`
  : '';

const FONTS = [
  path.join(root, 'scripts/fonts/Estedad-Regular.ttf'),
  path.join(root, 'scripts/fonts/Estedad-Black.ttf'),
];
const fontOptions = {
  font: { fontFiles: FONTS, loadSystemFonts: false, defaultFontFamily: 'Estedad' },
};

function render(svg, width) {
  const resvg = new Resvg(svg, { ...fontOptions, fitTo: { mode: 'width', value: width } });
  return resvg.render().asPng();
}

function save(file, buffer) {
  if (!fs.existsSync(dist)) fs.mkdirSync(dist, { recursive: true });
  fs.writeFileSync(path.join(dist, file), buffer);
  console.log(`✓ ${file}`);
}

const nameFa = site.identity.name_fa;
const nameEn = site.identity.name_en;
const role = site.identity.role_fa;
const location = site.identity.location_fa;

/* ── کارت اشتراک‌گذاری ۱۲۰۰×۶۳۰ ─────────────────────────────────────── */
const W = 1200;
const H = 630;

const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stop-color="#0c1211"/>
      <stop offset="0.55" stop-color="#0f1514"/>
      <stop offset="1" stop-color="#0c1312"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.92" cy="0" r="0.75">
      <stop offset="0" stop-color="#a8451f" stop-opacity="0.34"/>
      <stop offset="1" stop-color="#a8451f" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="0.05" cy="1" r="0.6">
      <stop offset="0" stop-color="#2c6a5e" stop-opacity="0.28"/>
      <stop offset="1" stop-color="#2c6a5e" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <rect width="${W}" height="${H}" fill="url(#glow2)"/>

  <line x1="1136" y1="72" x2="1136" y2="558" stroke="#f4eee1" stroke-opacity="0.14"/>
  <line x1="88" y1="470" x2="1100" y2="470" stroke="#f4eee1" stroke-opacity="0.16"/>

  ${
    portraitUri
      ? `<image href="${portraitUri}" x="88" y="96" width="216" height="270" preserveAspectRatio="xMidYMid slice" clip-path="inset(0)"/>
  <rect x="88" y="366" width="216" height="1" fill="#d3784f" fill-opacity="0.55"/>`
      : ''
  }

  <circle cx="1096" cy="94" r="5" fill="#d3784f"/>
  <text x="1060" y="100" text-anchor="end" font-family="Estedad" font-size="19" fill="#f4eee1" fill-opacity="0.6">آمادهٔ همکاری — ${location}</text>

  <text x="1100" y="300" text-anchor="end" font-family="Estedad" font-weight="900" font-size="92" letter-spacing="-2" fill="#f4eee1">${nameFa}</text>
  <text x="1100" y="352" text-anchor="end" font-family="Estedad" font-weight="500" font-size="21" letter-spacing="9" fill="#d3784f">${nameEn}</text>
  <text x="1100" y="420" text-anchor="end" font-family="Estedad" font-size="27" fill="#f4eee1" fill-opacity="0.72">${role} — پشتیبانی سیستم، تولید محتوا، در حال یادگیری وب</text>

  <text x="88" y="524" font-family="Estedad" font-weight="500" font-size="20" letter-spacing="5" fill="#f4eee1" fill-opacity="0.42">PORTFOLIO / CV</text>
  <text x="1100" y="524" text-anchor="end" font-family="Estedad" font-size="21" fill="#f4eee1" fill-opacity="0.66">${contact.email}</text>
</svg>`;

save('og.png', render(ogSvg, W));

/* ── آیکون‌ها ─────────────────────────────────────────────────────────── */
function iconSvg(size, padded = true) {
  const s = size;
  const inset = padded ? s * 0.13 : 0;
  const w = s - inset * 2;
  const radius = w * 0.5;
  const top = inset + w * 0.06;
  const pathTop = top;
  const base = s - inset;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <rect width="${s}" height="${s}" fill="#0f1514"/>
  <path d="M${inset},${base} L${inset},${pathTop + radius * 0.55} A${radius},${radius * 0.78} 0 0 1 ${inset + w},${pathTop + radius * 0.55} L${inset + w},${base}"
        fill="none" stroke="#f4eee1" stroke-width="${Math.max(1.6, s * 0.045)}"/>
  <circle cx="${s / 2}" cy="${base - w * 0.3}" r="${s * 0.062}" fill="#d3784f"/>
</svg>`;
}

save('apple-touch-icon.png', render(iconSvg(180), 180));
save('icon-192.png', render(iconSvg(192), 192));
save('icon-512.png', render(iconSvg(512), 512));
