// /work/<slug>/ — every project has its own address, and that address is the real site.
// Cloudflare runs this for /work/*: it takes index.html, fills the <head> with the project's own title,
// description, canonical, share image and structured data, and the page's script opens the project.
// Everything comes from index.html itself (F, LIST, INDEX, DRAFTS, HIDDEN, pjdata, crdata), so a change
// to a project needs nothing else: no build step, no second copy of the site.
import { readSite, SITE } from '../../lib/site.js';

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const clip = (s, n) => { s = String(s).replace(/\s+/g, ' ').trim(); if (s.length <= n) return s; s = s.slice(0, n - 1); return s.slice(0, s.lastIndexOf(' ')).replace(/[,;:–—-]$/, '') + '…'; };

export async function onRequest({ request, env, params }) {
  const url = new URL(request.url);
  const slug = (params.path || [])[0] || '';
  if (!slug) return Response.redirect(`${url.origin}/#films`, 301);
  const res = await env.ASSETS.fetch(new URL('/', url));
  const html = await res.text();
  const site = readSite(html);
  const k = site.bySlug[slug.toLowerCase()];
  if (!k) return Response.redirect(`${url.origin}/`, 302);
  if (slug !== site.slug[k] || !url.pathname.endsWith('/')) return Response.redirect(`${url.origin}/work/${site.slug[k]}/`, 301);

  const p = site.F[k], pj = site.PJ[k] || {}, cr = site.CR[k] || {};
  const cl = p.client && !site.same(p.title, p.client) ? p.client : '';
  const intro = (pj.intro || []).map(x => x.replace(/^\*\s*/, '').trim()).filter(Boolean);
  const desc = clip(p.line ? `${p.line} ${intro[0] || ''}` : intro[0] || `${p.title}, a film for ${p.client}${p.year ? ' (' + p.year + ')' : ''} by Panorama Films.`, 158);
  const title = `${p.title}${cl ? ' — ' + cl : ''} | Panorama Films`;
  const canon = `${SITE}/work/${site.slug[k]}/`;
  const og = (await env.ASSETS.fetch(new URL(`/media/og/${site.slug[k]}.jpg`, url), { method: 'HEAD' })).ok
    ? `${SITE}/media/og/${site.slug[k]}.jpg` : `${SITE}/media/${p.img || 'stills/' + (p.still || k)}.webp`;
  const crew = (cr.blocks || []).filter(b => !b.ext).flatMap(b => b.rows.flatMap(([r, n]) => n.split(/,\s*/).map(name => ({ '@type': 'Person', name, jobTitle: r }))));
  const ld = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Panorama Films', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: p.title, item: canon }] },
    { '@type': 'CreativeWork', '@id': canon + '#work', name: p.title, description: desc, url: canon, image: og, inLanguage: 'en',
      ...(/^\d{4}$/.test(p.year || '') ? { dateCreated: p.year } : {}),
      [cr.type === 'service' ? 'contributor' : 'creator']: { '@id': `${SITE}/#org` },
      ...(p.client && p.client !== 'Panorama Films' ? { sourceOrganization: { '@type': 'Organization', name: p.client } } : {}),
      ...(crew.length ? { contributor: crew } : {}),
      /* no VideoObject: Google requires an uploadDate, and we have no real one (Search Console, 2026-10-21) */
      }] };

  const set = (sel, attr, val) => [sel, { element(e) { e.setAttribute(attr, val); } }];
  let rw = new HTMLRewriter()
    .on('head', { element(e) { e.prepend('<base href="/">', { html: true }); e.append(`<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`, { html: true }); } })
    .on('title', { element(e) { e.setInnerContent(title); } })
    .on('html', { element(e) { e.setAttribute('data-work', k); } });
  for (const [s, a, v] of [
    ['meta[name="description"]', 'content', desc], ['link[rel="canonical"]', 'href', canon],
    ['meta[property="og:title"]', 'content', title], ['meta[property="og:description"]', 'content', desc],
    ['meta[property="og:url"]', 'content', canon], ['meta[property="og:image"]', 'content', og],
    ['meta[property="og:type"]', 'content', 'video.other']]) rw = rw.on(...set(s, a, v));
  rw = rw.on('meta[property="og:image:width"], meta[property="og:image:height"]', { element(e) { if (!og.endsWith('.jpg')) e.remove(); } })
    .on('link[rel="alternate"][hreflang]', { element(e) { e.remove(); } });
  const headers = new Headers(res.headers);
  headers.set('content-type', 'text/html; charset=utf-8');
  if (/\.pages\.dev$/.test(url.hostname)) headers.set('X-Robots-Tag', 'noindex');
  return rw.transform(new Response(html, { status: 200, headers }));
}
