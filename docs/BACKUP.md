# پشتیبان‌گیری، بازگردانی و جابه‌جایی

## چرا پشتیبان جداگانه لازم نیست؟

هر بار که در پنل مدیریت «انتشار» را بزنید، یک **کامیت** در مخزن GitHub ساخته
می‌شود. یعنی کل محتوا و تصویرها با تاریخچهٔ کامل به‌صورت نسخه‌بندی‌شده ذخیره
می‌شوند و هر لحظه می‌توانید به نسخهٔ قبلی برگردید. این، خودِ سازوکار پشتیبان است.

---

## ۱) بازگردانی یک فایل محتوا به نسخهٔ قبلی (بدون کد)

1. در GitHub فایل `content/<نام فایل>.yaml` را باز کنید.
2. روی **History** کلیک کنید.
3. نسخهٔ درست را باز کنید → `⋯` → **Revert** (یا کپی محتوا و `Edit` و `Commit`).

چند ثانیه بعد build خودکار آغاز می‌شود و سایت به همان نسخه برمی‌گردد.

## ۲) بازگردانی با Git (روی کامپیوتر)

```bash
git clone https://github.com/dirakokha/portfolio.git
cd portfolio

# دیدن تاریخچهٔ یک فایل
git log --oneline -- content/skills.yaml

# دیدن تغییرات یک کامیت
git show <commit-hash>

# بازگردانی یک فایل به نسخهٔ یک کامیت قدیمی
git checkout <commit-hash> -- content/skills.yaml

# بازگردانی کل پروژه به یک کامیت (سالم‌ترین راه در شرایط بحرانی)
git revert --no-commit <commit-hash>..HEAD
git commit -m "بازگردانی محتوا به نسخهٔ قبل"

git push
```

## ۳) پشتیبان کامل خارج از GitHub

- **دانلود ZIP:** در GitHub → `Code → Download ZIP`. شامل `content/` و
  `public/media/` (همهٔ متن‌ها و تصویرها).
- **پشتیبان محلی مداوم** (اگر Git روی سیستم دارید):

```bash
git clone --mirror https://github.com/dirakokha/portfolio.git khakneh-backup.git
# برای به‌روزرسانی بعدی:
cd khakneh-backup.git && git remote update
```

فایل‌های ضروری برای پشتیبان: پوشه‌های `content/` و `public/media/`.
همین دو پوشه، ۱۰۰٪ محتوای شخصی سایت را در خود دارند.

## ۴) بازگردانی سایت پس از خرابی build

- **Cloudflare Pages:** `Deployments` → انتشار سالم قبلی → `⋯ → Rollback`.
  سایت بلافاصله به نسخهٔ سالم برمی‌گردد. انتشارهای قبلی حذف نمی‌شوند.
- **GitHub Pages:** `Actions` → اجرای موفق قبلی → `Re-run all jobs`.

## ۵) جابه‌جایی به میزبان دیگر

پروژه به هیچ سرویس خاصی گره نخورده است:

```bash
git clone https://github.com/dirakokha/portfolio.git
cd portfolio && npm install
SITE_URL=https://آدرس-جدید.example npm run build
# محتوای پوشهٔ dist/ را روی میزبان جدید بگذارید
```

سه نکته:

1. **محتوا و تصویرها** داخل مخزن‌اند؛ نیازی به خروجی گرفتن از دیتابیس نیست
   (دیتابیسی وجود ندارد).
2. **پنل مدیریت** به پروکسی ورود نیاز دارد: در Cloudflare Pages به‌صورت
   `functions/api` همراه سایت است؛ روی میزبانی دیگر می‌توانید پوشهٔ
   `workers/oauth/` را جداگانه روی Cloudflare Workers (رایگان) منتشر کنید و
   `OAUTH_BASE_URL` را تنظیم کنید.
3. اگر آدرس سایت عوض شود، `SITE_URL` را تغییر دهید و یک‌بار build کنید تا
   نقشهٔ سایت، متادیتای Open Graph و آدرس Callback درست شوند. آدرس Callback را
   در اپ GitHub OAuth هم به‌روزرسانی کنید.

## ۶) اگر روزی GitHub OAuth از کار بیفتد

سایت عمومی بدون هیچ تغییری کار می‌کند (خروجی ایستاست). برای ادامهٔ ویرایش:

- گزینهٔ موقت: فایل‌های `content/*.yaml` را مستقیماً در GitHub ویرایش کنید؛
  ساختار ساده و خواناست و build خودکار انجام می‌شود.
- گزینهٔ محلی: روی کامپیوتر `npm run cms` و `CMS_LOCAL=1 npm run dev` را اجرا
  کنید و از `http://localhost:4321/admin/` محتوا را ویرایش و کامیت کنید.
- پس از رفع مشکل، ورود از پنل دوباره فعال می‌شود.
