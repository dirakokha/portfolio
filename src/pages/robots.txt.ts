import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  const sitemap = new URL(`${base}/sitemap-index.xml`, import.meta.env.SITE).href;

  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin/',
    'Disallow: /admin',
    '',
    `Sitemap: ${sitemap}`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
