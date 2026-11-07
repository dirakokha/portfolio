/**
 * Cloudflare Pages Function — مرحلهٔ نخست ورود با GitHub
 * مسیر: /api/auth?provider=github
 *
 * کلید محرمانهٔ اپلیکیشن GitHub (client_secret) هرگز به مرورگر فرستاده نمی‌شود؛
 * فقط در متغیرهای محیطی همین تابع قرار می‌گیرد.
 */

const STATE_COOKIE = 'akh_oauth_state';

function html(status, title, body) {
  return new Response(
    `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><title>${title}</title>
<style>body{font-family:system-ui,sans-serif;background:#f5efe3;color:#111c1b;display:grid;place-items:center;min-height:100vh;margin:0;padding:2rem}
.card{max-width:32rem;background:#fff;border:1px solid #d9d2c4;border-inline-start:3px solid #b4522a;padding:1.5rem 1.75rem;line-height:2}
h1{font-size:1.1rem;margin:0 0 .6rem}code{background:#f0ece2;padding:.1rem .35rem;border-radius:2px}
a{color:#b4522a}</style></head><body><div class="card"><h1>${title}</h1>${body}
<p><a href="/admin/">بازگشت به پنل مدیریت</a> · <a href="/">وب‌سایت</a></p></div></body></html>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } },
  );
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const provider = (url.searchParams.get('provider') || 'github').toLowerCase();

  if (provider !== 'github') {
    return html(400, 'سرویس ورود پشتیبانی نمی‌شود', '<p>این پروژه فقط ورود با GitHub را پشتیبانی می‌کند.</p>');
  }

  const clientId = env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return html(
      500,
      'پیکربندی ورود کامل نیست',
      '<p>متغیر محیطی <code>GITHUB_CLIENT_ID</code> روی این پروژه تنظیم نشده است.</p>' +
        '<p>راهنمای راه‌اندازی در فایل <code>docs/DEPLOY.md</code> آمده است. وب‌سایت عمومی بدون این تنظیمات هم کامل کار می‌کند.</p>',
    );
  }

  const state = crypto.randomUUID();
  const redirectUri = `${url.origin}/api/callback`;

  const authorize = new URL('https://github.com/login/oauth/authorize');
  authorize.searchParams.set('client_id', clientId);
  authorize.searchParams.set('redirect_uri', redirectUri);
  authorize.searchParams.set('scope', 'repo');
  authorize.searchParams.set('state', state);
  authorize.searchParams.set('allow_signup', 'false');

  return new Response(null, {
    status: 302,
    headers: {
      Location: authorize.toString(),
      // state در کوکی HttpOnly نگه‌داری می‌شود تا در نشانی مرورگر جابه‌جا نشود
      'Set-Cookie': `${STATE_COOKIE}=${state}; HttpOnly; Secure; SameSite=Lax; Path=/api; Max-Age=600`,
      'Cache-Control': 'no-store',
    },
  });
}

export { html, STATE_COOKIE };
