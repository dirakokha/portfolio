// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/**
 * آدرس نهایی سایت و مسیر پایه از متغیرهای محیطی خوانده می‌شوند تا یک
 * خروجی واحد روی چند میزبان رایگان (Cloudflare Pages، GitHub Pages یا
 * هر میزبان ایستای دیگر) قابل استفاده باشد.
 *
 *   SITE_URL   مثال: https://khakneh.pages.dev
 *   BASE_PATH  برای زیرمسیر، مثال: /portfolio
 */
const site = process.env.SITE_URL || 'https://khakneh.pages.dev';
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  build: {
    inlineStylesheets: 'auto',
    format: 'directory',
  },
  integrations: [sitemap()],
  // فقط برای سرور توسعه (پیش‌نمایش در محیط‌های ابری)
  server: { allowedHosts: true },
  vite: {
    server: { allowedHosts: true },
  },
});
