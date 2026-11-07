/**
 * ساخت تصویر اشتراک‌گذاری (Open Graph) و آیکون‌ها از فایل‌های SVG.
 * اجرا: node scripts/make-og.mjs  (پس از build)
 */
import fs from 'node:fs';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import yaml from 'js-yaml';

const root = process.cwd();
const dist = path.join(root, 'dist');

const site = yaml.load(fs.readFileSync(path.join(root, 'content/site.yaml'), 'utf8'));
const contact = yaml.load(fs.readFileSync(path.join(root, 'content/contact.yaml'), 'utf8'));

const FONT = path.join(root, 'public/fonts/AzarMehrSerif-Bold.ttf');
const fontOptions = {
  font: { fontFiles: [FONT], loadSystemFonts: false, defaultFontFamily: 'AzarMehrMonospaced' },
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
const archCenterX = 190;
const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#f5efe3"/>
  <g stroke="#111c1b" stroke-opacity="0.07">
    <line x1="300" y1="0" x2="300" y2="${H}"/>
    <line x1="600" y1="0" x2="600" y2="${H}"/>
    <line x1="900" y1="0" x2="900" y2="${H}"/>
  </g>

  <g transform="translate(${archCenterX}, ${H / 2})">
    <g fill="none" stroke="#111c1b" stroke-opacity="0.10">
      <circle r="60"/>
      <circle r="95"/>
      <circle r="130"/>
      <circle r="170"/>
    </g>
    <circle r="130" fill="none" stroke="#b4522a" stroke-opacity="0.55" stroke-dasharray="3 9"/>
    <path d="M-118,178 L-118,-10 A118,110 0 0 1 118,-10 L118,178" fill="none" stroke="#111c1b" stroke-opacity="0.5" stroke-width="2"/>
    <line x1="-118" y1="180" x2="118" y2="180" stroke="#b4522a" stroke-width="3"/>
  </g>

  <text x="${W - 80}" y="150" text-anchor="end" font-family="AzarMehrMonospaced" font-size="76" fill="#111c1b">${nameFa}</text>
  <text x="${W - 80}" y="205" text-anchor="end" font-family="AzarMehrMonospaced" font-size="26" letter-spacing="9" fill="#b4522a">${nameEn}</text>
  <line x1="${W - 80}" y1="250" x2="${W - 620}" y2="250" stroke="#111c1b" stroke-opacity="0.3"/>
  <text x="${W - 80}" y="305" text-anchor="end" font-family="AzarMehrMonospaced" font-size="30" fill="#2b3634">${role}، ${location}</text>
  <text x="${W - 80}" y="352" text-anchor="end" font-family="AzarMehrMonospaced" font-size="25" fill="#59625f">پشتیبانی سیستم، تولید محتوا، در حال یادگیری وب</text>

  <line x1="80" y1="${H - 96}" x2="${W - 80}" y2="${H - 96}" stroke="#111c1b" stroke-opacity="0.18"/>
  <text x="${W - 80}" y="${H - 52}" text-anchor="end" font-family="AzarMehrMonospaced" font-size="22" fill="#59625f">${contact.email}</text>
  <text x="80" y="${H - 52}" font-family="AzarMehrMonospaced" font-size="20" letter-spacing="6" fill="#b4522a">PORTFOLIO / CV</text>
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
  <rect width="${s}" height="${s}" fill="#0d1917"/>
  <path d="M${inset},${base} L${inset},${pathTop + radius * 0.55} A${radius},${radius * 0.78} 0 0 1 ${inset + w},${pathTop + radius * 0.55} L${inset + w},${base}"
        fill="none" stroke="#f7f2e7" stroke-width="${Math.max(1.6, s * 0.045)}"/>
  <circle cx="${s / 2}" cy="${base - w * 0.3}" r="${s * 0.065}" fill="#b4522a"/>
</svg>`;
}

save('apple-touch-icon.png', render(iconSvg(180), 180));
save('icon-192.png', render(iconSvg(192), 192));
save('icon-512.png', render(iconSvg(512), 512));
