/**
 * آداپتور مستقل برای Worker — فقط اگر تصمیم گرفتید پنل مدیریت را جدا از
 * Cloudflare Pages میزبانی کنید (مثلاً سایت روی GitHub Pages باشد).
 *
 * همین منطق، بدون هیچ تغییری، در functions/api/ هم استفاده می‌شود.
 *
 * متغیرهای محیطی لازم:
 *   GITHUB_CLIENT_ID
 *   GITHUB_CLIENT_SECRET
 *   ALLOWED_GITHUB_LOGIN (اختیاری، نام کاربری مالک)
 */
import { onRequestGet as authGet } from '../../functions/api/auth.js';
import { onRequestGet as callbackGet } from '../../functions/api/callback.js';

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    if (pathname === '/api/auth' || pathname === '/auth') {
      return authGet({ request, env });
    }
    if (pathname === '/api/callback' || pathname === '/callback') {
      return callbackGet({ request, env });
    }
    if (pathname === '/' ) {
      return new Response('OAuth proxy — مسیر /api/auth و /api/callback', {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }
    return new Response('Not found', { status: 404 });
  },
};
