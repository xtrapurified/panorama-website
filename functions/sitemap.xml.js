// /sitemap.xml, built from the projects in index.html on every request, so it never goes stale.
import { readSite, SITE } from '../lib/site.js';
export async function onRequest({ request, env }) {
  const html = await (await env.ASSETS.fetch(new URL('/', request.url))).text();
  const { ORDER, slug } = readSite(html);
  const urls = [`${SITE}/`, ...ORDER.map(k => `${SITE}/work/${slug[k]}/`)];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`;
  return new Response(body, { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=3600' } });
}
