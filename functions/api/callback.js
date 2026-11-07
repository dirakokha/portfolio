/**
 * Cloudflare Pages Function — مرحلهٔ دوم ورود با GitHub
 * مسیر: /api/callback?code=…&state=…
 *
 * ۱) صحت state (کوکی HttpOnly) بررسی می‌شود.
 * ۲) کد با client_secret به توکن تبدیل می‌شود — فقط سمت سرور.
 * ۳) هویت کاربر با ALLOWED_GITHUB_LOGIN (اختیاری) تطبیق داده می‌شود.
 * ۴) توکن با پروتکل امنِ popup به پنل مدیریت تحویل داده می‌شود.
 */

const STATE_COOKIE = 'akh_oauth_state';

function page(status, title, body) {
  return new Response(
    `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><title>${title}</title>
<style>body{font-family:system-ui,sans-serif;background:#f5efe3;color:#111c1b;display:grid;place-items:center;min-height:100vh;margin:0;padding:2rem}
.card{max-width:32rem;background:#fff;border:1px solid #d9d2c4;border-inline-start:3px solid #b4522a;padding:1.5rem 1.75rem;line-height:2}
h1{font-size:1.1rem;margin:0 0 .6rem}code{background:#f0ece2;padding:.1rem .35rem;border-radius:2px}a{color:#b4522a}</style>
</head><body><div class="card"><h1>${title}</h1>${body}
<p><a href="/admin/">بازگشت به پنل مدیریت</a></p></div></body></html>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } },
  );
}

function readCookie(request, name) {
  const header = request.headers.get('Cookie') || '';
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return '';
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');
  const cookieState = readCookie(request, STATE_COOKIE);

  if (error) {
    return page(400, 'ورود لغو شد', `<p>GitHub پاسخ داد: <code>${error}</code></p>`);
  }

  if (!code || !state || !cookieState || state !== cookieState) {
    return page(
      400,
      'درخواست ورود معتبر نیست',
      '<p>کد ورود یا نشانهٔ امنیتی (state) با هم نمی‌خوانند. لطفاً دوباره از پنل مدیریت وارد شوید.</p>',
    );
  }

  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return page(
      500,
      'پیکربندی ورود کامل نیست',
      '<p>متغیرهای محیطی <code>GITHUB_CLIENT_ID</code> و <code>GITHUB_CLIENT_SECRET</code> تنظیم نشده‌اند.</p>',
    );
  }

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${url.origin}/api/callback`,
    }),
  });

  const tokenData = await tokenResponse.json().catch(() => ({}));
  const token = tokenData.access_token;

  if (!token) {
    return page(
      400,
      'تبادل توکن ناموفق بود',
      `<p>پاسخ GitHub: <code>${String(tokenData.error || 'unknown_error')}</code></p>`,
    );
  }

  // فقط حساب مالک اجازهٔ ورود دارد (اگر تنظیم شده باشد)
  const allowedLogin = (env.ALLOWED_GITHUB_LOGIN || '').trim().toLowerCase();
  if (allowedLogin) {
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'khakneh-portfolio-oauth',
      },
    });
    const user = await userResponse.json().catch(() => ({}));
    const login = String(user.login || '').toLowerCase();

    if (login !== allowedLogin) {
      return page(
        403,
        'دسترسی مجاز نیست',
        `<p>حساب <code>${login || 'ناشناس'}</code> اجازهٔ ویرایش این سایت را ندارد.</p>`,
      );
    }
  }

  // پروتکل popup مورد انتظار Decap CMS
  const payload = JSON.stringify({ token, provider: 'github' });
  const body = `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8">
<title>ورود موفق</title><meta name="robots" content="noindex"></head>
<body style="font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;background:#f5efe3;color:#111c1b">
<p>ورود انجام شد. این پنجره به‌طور خودکار بسته می‌شود…</p>
<script>
(function () {
  var payload = ${JSON.stringify(payload)};
  var message = 'authorization:github:success:' + payload;
  var sent = false;

  function send(origin) {
    if (sent) return;
    sent = true;
    try { window.opener.postMessage(message, origin || '*'); } catch (e) {}
    setTimeout(function () { try { window.close(); } catch (e) {} }, 400);
  }

  function onMessage(event) {
    if (event.data === 'authorizing:github') send(event.origin === 'null' ? '*' : event.origin);
  }

  window.addEventListener('message', onMessage, false);

  try { window.opener.postMessage('authorizing:github', '*'); } catch (e) {}

  // اگر دست‌دهی اولیه گم شد، چند بار تکرار می‌شود
  var tries = 0;
  var timer = setInterval(function () {
    if (sent || tries++ > 40) { clearInterval(timer); return; }
    try { window.opener.postMessage('authorizing:github', '*'); } catch (e) { clearInterval(timer); }
  }, 250);
})();
</script></body></html>`;

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Set-Cookie': `${STATE_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/api; Max-Age=0`,
    },
  });
}
