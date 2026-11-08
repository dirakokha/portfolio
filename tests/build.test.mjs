import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

/**
 * این آزمون‌ها روی خروجی ساخته‌شده (dist) اجرا می‌شوند.
 * پیش از اجرا: npm run build
 */

const dist = path.join(process.cwd(), 'dist');

function readDist(file) {
  const full = path.join(dist, file);
  assert.ok(fs.existsSync(full), `فایل ${file} در خروجی build وجود ندارد`);
  return fs.readFileSync(full, 'utf8');
}

test('صفحهٔ اصلی با زبان و جهت درست ساخته می‌شود', () => {
  const html = readDist('index.html');
  assert.match(html, /<html lang="fa" dir="rtl">/);
  assert.match(html, /AMIRMAHMOUD KHAKNEH/);
  assert.match(html, /امیرمحمود خاکنه/);
  assert.match(html, /<main id="main">/);
});

test('متادیتای فارسی و Open Graph کامل است', () => {
  const html = readDist('index.html');
  assert.match(html, /<title>[^<]*امیرمحمود خاکنه[^<]*<\/title>/);
  assert.match(html, /<meta name="description" content="[^"]{40,}"/);
  assert.match(html, /property="og:title"/);
  assert.match(html, /property="og:image" content="https:\/\//);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /rel="canonical" href="https:\/\//);
});

test('فونت‌ها و دارایی‌ها محلی هستند و از CDN بیرونی استفاده نمی‌شود', () => {
  const html = readDist('index.html');
  // دامنهٔ خودمان + لینک تأیید گواهی مکتب‌خونه (تنها منبع بیرونی مجاز است)
  const allowed = [/^https:\/\/khakneh\.pages\.dev/, /^https:\/\/www\.maktabkhooneh\.org\/certificates\//];
  const external = [...html.matchAll(/(?:src|href)="(https?:\/\/[^"]+)"/g)]
    .map((match) => match[1])
    .filter((url) => !allowed.some((pattern) => pattern.test(url)));
  assert.deepEqual(external, [], `منابع بیرونی یافت شد: ${external.join(', ')}`);
  assert.match(html, /\/fonts\/Vazirmatn-Variable\.woff2/);
});

test('بخش نمونه‌کارها در نبود پروژه رندر نمی‌شود', () => {
  const html = readDist('index.html');
  assert.ok(!html.includes('id="projects"'), 'بخش نمونه‌کارها نباید وقتی خالی است دیده شود');
});

test('شمارهٔ تلفن در هیچ خروجی‌ای وجود ندارد', () => {
  const files = ['index.html', 'resume/index.html'];
  for (const file of files) {
    const html = readDist(file);
    assert.ok(!/tel:\+?\d/.test(html), `لینک تلفن در ${file} پیدا شد`);
  }
});

test('نسخهٔ چاپی رزومه ساخته می‌شود و ایمیل عمومی را دارد', () => {
  const html = readDist('resume/index.html');
  assert.match(html, /amirmahmoud\.kha2006@gmail\.com/);

  const cssDir = path.join(dist, '_astro');
  const cssFiles = fs.existsSync(cssDir) ? fs.readdirSync(cssDir).filter((f) => f.endsWith('.css')) : [];
  const css = [html, ...cssFiles.map((f) => fs.readFileSync(path.join(cssDir, f), 'utf8'))].join('\n');
  assert.match(css, /@media print/);
  assert.match(css, /@page\{?\s*size:\s*A4|@page\s*\{[^}]*size:\s*A4/);
});

test('نقشهٔ سایت، robots و آیکون‌ها ساخته می‌شوند', () => {
  assert.ok(fs.existsSync(path.join(dist, 'sitemap-index.xml')));
  const robots = readDist('robots.txt');
  assert.match(robots, /Sitemap: https:\/\/khakneh\.pages\.dev\/sitemap-index\.xml/);
  assert.match(robots, /Disallow: \/admin/);
  assert.ok(fs.existsSync(path.join(dist, 'og.png')));
  assert.ok(fs.existsSync(path.join(dist, 'favicon.svg')));
});

test('پنل مدیریت با پیکربندی معتبر و بدون کلید محرمانه ساخته می‌شود', () => {
  const config = readDist('admin/config.yml');
  assert.match(config, /backend:\s*\n\s*name: github/);
  assert.match(config, /media_folder: public\/media/);
  assert.match(config, /collections:/);
  assert.ok(!/client_secret/i.test(config), 'کلید محرمانه نباید در پیکربندی کلاینت باشد');
  assert.ok(fs.existsSync(path.join(dist, 'admin/decap-cms.js')), 'بستهٔ CMS باید محلی باشد');
  assert.ok(fs.existsSync(path.join(dist, 'admin/admin.css')));
});

test('هیچ کلید یا توکن محرمانه‌ای در خروجی نیست', () => {
  const walk = (dir) =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return walk(full);
      return [full];
    });

  const suspicious = walk(dist).filter((file) => {
    if (!/\.(js|html|yml|json|txt)$/.test(file)) return false;
    if (file.includes('decap-cms')) return false;
    const content = fs.readFileSync(file, 'utf8');
    return /(ghp_[A-Za-z0-9]{20,}|github_pat_|client_secret:\s*['"]?[A-Za-z0-9]{10,})/.test(content);
  });

  assert.deepEqual(suspicious, []);
});

test('کد عمومی سایت به CMS وابسته نیست', () => {
  const html = readDist('index.html');
  assert.ok(!/decap|netlify|admin\/config/i.test(html), 'صفحهٔ عمومی نباید به CMS ارجاع دهد');
  assert.ok(!/<script[^>]+src="[^"]*admin/i.test(html));
});

test('تا عکس تازه نرسیده، هیچ عکسی در سایت نمایش داده نمی‌شود', () => {
  const html = readDist('index.html');
  assert.doesNotMatch(html, /class="portrait/);
  assert.doesNotMatch(html, /\/media\/portrait-/);
  for (const file of ['portrait-480.webp', 'portrait-960.webp', 'portrait-print.webp']) {
    assert.equal(fs.existsSync(path.join(dist, 'media', file)), false, `تصویر ${file} نباید در خروجی باشد`);
  }
});

test('رزومهٔ چاپی بدون عکس ساخته می‌شود و عنوان‌هایش سرجایش است', () => {
  const html = readDist('resume/index.html');
  assert.doesNotMatch(html, /class="cv-photo"/);
  assert.match(html, /class="cv-name"/);
  assert.match(html, /خلاصهٔ حرفه‌ای/);
});

test('بخش جملهٔ کلیدی حذف شده و دیگر در هیچ صفحه‌ای رندر نمی‌شود', () => {
  for (const file of ['index.html', 'about/index.html']) {
    if (!fs.existsSync(path.join(dist, file))) continue;
    const html = readDist(file);
    assert.doesNotMatch(html, /class="statement"/);
    assert.doesNotMatch(html, /data-statement/);
  }
  assert.equal(fs.existsSync(path.join(process.cwd(), 'src/components/Statement.astro')), false);
});

test('بخش نخست وضعیت واقعی و تازه‌ترین دستاوردها را نشان می‌دهد', () => {
  const html = readDist('index.html');
  const visible = html.replace(/<script[\s\S]*?<\/script>/g, '');
  assert.match(html, /class="hero__facts"/);
  assert.match(visible, /در حال یادگیری/);
  assert.match(visible, /CSS و JavaScript/);
  assert.match(visible, /پایتون/);
  assert.match(visible, /مسیر روشن/);
});

test('جملهٔ توضیح حساب شبکه‌های اجتماعی حذف شده است', () => {
  const html = readDist('index.html');
  assert.doesNotMatch(html, /حساب شخصی من/);
  assert.doesNotMatch(html, /صفحه‌های اینستاگرام و یوتیوب مجموعه/);
});

test('ادعای زبان مادری فارسی در سایت و رزومه وجود ندارد', () => {
  for (const file of ['index.html', 'resume/index.html']) {
    const html = readDist(file);
    assert.doesNotMatch(html, /زبان مادری/);
  }
});

test('لایهٔ حرکت در دسترس است و حالت کاهش حرکت را احترام می‌گذارد', () => {
  const cssDir = path.join(dist, '_astro');
  const css = fs
    .readdirSync(cssDir)
    .filter((f) => f.endsWith('.css'))
    .map((f) => fs.readFileSync(path.join(cssDir, f), 'utf8'))
    .join('\n');
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /data-reveal/);
  assert.match(css, /data-mask/);
  assert.match(css, /html\.js/);

  const html = readDist('index.html');
  assert.match(html, /data-reveal/);
  assert.match(html, /data-mask/);
  // پیش از فعال‌شدن اسکریپت هیچ‌چیز پنهان نمی‌ماند؛ حالت سکون فقط با کلاس js اعمال می‌شود
  assert.match(html, /classList\.add\('js'\)/);
  assert.match(html, /matchMedia\('\(prefers-reduced-motion: reduce\)'\)/);
  assert.match(html, /IntersectionObserver/);
});
