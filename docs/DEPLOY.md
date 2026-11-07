# راهنمای انتشار (رایگان)

هدف: سایت روی یک میزبان ایستای رایگان با دامنهٔ رایگان، و پنل مدیریتی که فقط
برای شما باز شود. **هیچ مرحله‌ای کارت اعتباری نمی‌خواهد.**

---

## مسیر اصلی: Cloudflare Pages + GitHub OAuth

### گام ۱ — حساب‌ها

1. حساب GitHub (`dirakokha`) را دارید.
2. در <https://dash.cloudflare.com/sign-up> یک حساب رایگان بسازید (ایمیل کافی است،
   کارت اعتباری لازم نیست).

### گام ۲ — وصل کردن مخزن به Cloudflare Pages

1. در داشبورد Cloudflare: **Workers & Pages → Create → Pages → Connect to Git**.
2. مخزن `dirakokha/portfolio` را انتخاب کنید (دسترسی به مخزن خصوصی هم رایگان است).
3. تنظیمات build:
   - Framework preset: **Astro** (یا None)
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node version: 22 → متغیر محیطی `NODE_VERSION=22`
4. متغیر `SITE_URL` را برابر آدرس نهایی بگذارید. آدرس پیش‌فرض چنین است:
   `https://<نام-پروژه>.pages.dev` — همان را وارد کنید (بدون `/` در انتها).
5. **Save and Deploy**.

پس از پایان build، سایت روی `https://<نام-پروژه>.pages.dev` در دسترس است.
**تا این مرحله، سایت عمومی کامل کار می‌کند؛ حتی اگر پنل مدیریت تنظیم نشده باشد.**

### گام ۳ — ساخت اپلیکیشن GitHub OAuth

1. GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**.
2. مقادیر:
   - Application name: `Khakneh Portfolio CMS`
   - Homepage URL: `https://<نام-پروژه>.pages.dev`
   - Authorization callback URL: `https://<نام-پروژه>.pages.dev/api/callback`
3. **Register application**.
4. `Client ID` را کپی کنید و با دکمهٔ **Generate a new client secret** یک
   `Client secret` بسازید.

> کلید محرمانه را در هیچ جا (چت، فایل، مخزن) نگذارید؛ فقط در گام بعد.

### گام ۴ — تنظیم متغیرهای محیطی

در Cloudflare Pages → پروژه → **Settings → Environment variables** (برای
Production و در صورت تمایل Preview):

| نام | مقدار |
| --- | --- |
| `GITHUB_CLIENT_ID` | مقدار Client ID |
| `GITHUB_CLIENT_SECRET` | مقدار Client secret |
| `ALLOWED_GITHUB_LOGIN` | `dirakokha` |
| `SITE_URL` | `https://<نام-پروژه>.pages.dev` |

سپس **Deployments → Retry deployment** (یا یک commit جدید) تا متغیرها اعمال شوند.

### گام ۵ — آزمایش

1. `https://<نام-پروژه>.pages.dev/admin/` را باز کنید.
2. دکمهٔ **ورود با GitHub** → صفحهٔ اجازهٔ GitHub → بازگشت به پنل.
3. یک فیلد را تغییر دهید، **انتشار** (Publish) را بزنید.
4. چند ثانیه بعد build جدید شروع می‌شود؛ با پایان آن، تغییر در سایت دیده می‌شود
   (`Deployments` را در Cloudflare ببینید).

اگر ورود انجام نشد:
- Callback URL در GitHub باید **دقیقاً** `https://<آدرس>/api/callback` باشد.
- `GITHUB_CLIENT_ID` و `GITHUB_CLIENT_SECRET` باید در محیط **Production** تنظیم شده باشند.
- با `ALLOWED_GITHUB_LOGIN` فقط حساب شما اجازهٔ ورود دارد؛ خطای ۴۰۳ یعنی حساب
  دیگری تلاش کرده است.

---

## مسیر جایگزین ۱: GitHub Pages (مخزن عمومی)

> وضعیت فعلی این پروژه: مخزن عمومی است و گردش‌کار انتشار روی GitHub Pages
> آماده است. آدرس سایت در این حالت: **https://dirakokha.github.io/portfolio/**
> نکته: در این نسخه پنل مدیریت فعال نیست (پروکسی ورود روی Cloudflare است).
> برای ویرایش محتوا یکی از این دو راه را انتخاب کنید: (الف) میزبانی روی
> Cloudflare Pages، (ب) انتشار `workers/oauth/` و تنظیم `OAUTH_BASE_URL`.


پلن رایگان GitHub Pages فقط برای مخزن **عمومی** است. اگر مخزن خصوصی بماند،
GitHub Pages به پلن پولی نیاز دارد؛ در آن حالت از Cloudflare Pages استفاده کنید.

1. مخزن را عمومی کنید (یا یک مخزن عمومی جدا برای سایت بسازید).
2. **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. متغیر مخزن `SITE_URL` را تنظیم کنید (Settings → Secrets and variables → Actions
   → Variables): `https://dirakokha.github.io`.
4. گردش‌کار `.github/workflows/deploy-gh-pages.yml` با هر push به `main` سایت را
   با `BASE_PATH=/portfolio` می‌سازد و منتشر می‌کند.
5. برای پنل مدیریت در این حالت، پروکسی ورود باید جداگانه میزبانی شود:
   پوشهٔ `workers/oauth/` را با `npx wrangler deploy` روی Cloudflare Workers
   (پلن رایگان) منتشر کنید و در GitHub Actions متغیر
   `OAUTH_BASE_URL=https://<worker>.workers.dev/api` را بگذارید.
   Callback URL در اپ GitHub OAuth باید `https://<worker>.workers.dev/api/callback` شود.
6. توجه: در حالت زیرمسیر، مسیر تصویرهای بارگذاری‌شده در پنل (`/media/...`)
   ممکن است در پیش‌نمایش پنل درست نمایش داده نشود؛ صفحهٔ عمومی درست است.

---

## مسیر جایگزین ۲: هر میزبان ایستای دیگر

خروجی `dist/` کاملاً ایستاست و به هیچ سرویس خاصی وابسته نیست. کافی است:

```bash
SITE_URL=https://example.com npm run build
```

سپس محتوای `dist/` را روی هر میزبانی (Netlify، Vercel، هاست اشتراکی، سرور شخصی)
قرار دهید. تنها چیزی که در میزبان‌های غیر از Cloudflare از دست می‌رود،
پروکسی ورود (`functions/api`) است؛ در آن صورت `workers/oauth/` را جداگانه
منتشر کنید و `OAUTH_BASE_URL` را تنظیم کنید.

---

## بازگشت به نسخهٔ قبلی در صورت خرابی build

- **Cloudflare Pages:** هر انتشار قبلی در تب `Deployments` باقی می‌ماند؛ با
  `⋯ → Rollback to this deployment` سایت به نسخهٔ سالم برمی‌گردد.
- **GitHub Pages:** در `Actions` می‌توانید یک اجرای موفق قبلی را دوباره deploy کنید
  یا کامیت قبلی را برگردانید (`git revert`).

اگر build جدید شکست بخورد، Cloudflare نسخهٔ قبلی را نگه می‌دارد و سایت از دسترس
خارج نمی‌شود.

---

## چک‌لیست امنیتی

- [ ] `GITHUB_CLIENT_SECRET` فقط در متغیرهای محیطی Cloudflare است (نه در مخزن).
- [ ] `ALLOWED_GITHUB_LOGIN` تنظیم شده تا فقط مالک وارد شود.
- [ ] مخزن خصوصی است (یا حداقل هیچ کلید محرمانه‌ای در آن نیست).
- [ ] پس از ویرایش، از پنل خارج شده‌اید (`Account → Logout`).
