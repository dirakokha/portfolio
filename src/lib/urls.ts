/** مسیرهای سایت با احتساب base (برای میزبانی در زیرمسیر مثل GitHub Pages) */
const rawBase = import.meta.env.BASE_URL || '/';
export const base = rawBase === '/' ? '' : rawBase.replace(/\/$/, '');
export const siteUrl = (import.meta.env.SITE || 'https://khakneh.pages.dev').replace(/\/$/, '');

/** آدرس مطلق برای فایل‌های داخل public و مسیرهای داخلی */
export function asset(p: string): string {
  if (!p) return base || '/';
  if (/^(https?:|mailto:|tel:|#)/.test(p)) return p;
  return `${base}${p.startsWith('/') ? p : `/${p}`}`;
}

/** آدرس کامل (برای Open Graph و سایت‌مپ) */
export function absolute(p: string): string {
  if (/^https?:/.test(p)) return p;
  return `${siteUrl}${asset(p)}`;
}

export function mailtoHref(email: string, subject = ''): string {
  const query = subject ? `?subject=${encodeURIComponent(subject)}` : '';
  return `mailto:${email}${query}`;
}
