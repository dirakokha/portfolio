/**
 * ساخت public/admin/config.yml از روی الگو.
 * آدرس سایت، شاخهٔ CMS و آدرس پروکسی ورود از متغیرهای محیطی خوانده می‌شود.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const templatePath = path.join(root, 'admin/config.template.yml');
const outPath = path.join(root, 'public/admin/config.yml');

const siteUrl = (process.env.SITE_URL || 'https://khakneh.pages.dev').replace(/\/$/, '');
const basePath = (process.env.BASE_PATH || '/').replace(/\/$/, '');
const apiBase = (process.env.OAUTH_BASE_URL || `${siteUrl}${basePath}/api`).replace(/\/$/, '');
const repo = process.env.CMS_REPO || 'dirakokha/portfolio';
const branch = process.env.CMS_BRANCH || 'main';
const useLocalBackend = process.env.CMS_LOCAL === '1';

const config = fs
  .readFileSync(templatePath, 'utf8')
  .replaceAll('__SITE_URL__', siteUrl)
  .replaceAll('__API_BASE__', apiBase)
  .replaceAll('__REPO__', repo)
  .replaceAll('__BRANCH__', branch)
  .replace('__LOGO_URL__', `${basePath}/favicon.svg`)
  .replace('__LOCAL_BACKEND__', useLocalBackend ? 'local_backend: true\nproxy_server:\n  url: http://localhost:8081' : '');

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, config);
console.log(`✓ public/admin/config.yml  (repo: ${repo}@${branch} · oauth: ${apiBase}${useLocalBackend ? ' · local backend' : ''})`);
