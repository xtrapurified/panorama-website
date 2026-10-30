// Reads the project data out of index.html (shared by the /work/* and /sitemap.xml functions).
// The site keeps its data in the page itself; this reads it without running the page's script.
export const SITE = 'https://panoramafilms.tv';

export const slugify = t => [...String(t)].map(c => /[đĐ]/.test(c) ? 'd' : c.normalize('NFD')[0]).join('')
  .toLowerCase().replace(/[’'`]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const strArr = s => [...String(s || '').matchAll(/"([^"]+)"/g)].map(m => m[1]);
const field = (line, name) => { const m = line.match(new RegExp(`(?:^|[{,\\s])${name}:"((?:[^"\\\\]|\\\\.)*)"`)); return m ? m[1].replace(/\\(.)/g, '$1') : undefined; };

/* drafts: left out by default (live site, sitemap); { drafts: true } keeps them, for the dev and preview addresses (2026-10-22) */
export function readSite(html, { drafts = false } = {}) {
  const fBlock = (html.match(/const F = \{([\s\S]*?)\n\};/) || [])[1] || '';
  const F = {};
  for (const line of fBlock.split('\n')) {
    const m = line.match(/^\s*([a-z0-9]+):\{/i); if (!m) continue;
    const o = {}; for (const n of ['title', 'client', 'year', 'line', 'img', 'still', 'mainT', 'yt', 'v', 'h', 'roles']) { const v = field(line, n); if (v !== undefined) o[n] = v; }
    F[m[1]] = o;
  }
  const arr = name => strArr((html.match(new RegExp(`const ${name} = \\[([^\\]]*)\\]`)) || [])[1]);
  const DRAFTS = arr('DRAFTS'), INDEX = arr('INDEX'), LIST = arr('LIST');
  const HIDDEN = strArr(((html.match(/const HIDDEN = \[([^\]]*)\]/) || [])[1] || '').split('...')[0]);
  const json = id => { try { return JSON.parse((html.match(new RegExp(`<script[^>]*id="${id}"[^>]*>([\\s\\S]*?)</script>`)) || [])[1]); } catch { return {}; } };
  const PJ = json('pjdata'), CR = json('crdata');
  const ORDER = [...LIST, ...INDEX].filter(k => F[k] && (drafts || !DRAFTS.includes(k)) && !HIDDEN.includes(k));
  const slug = {}, bySlug = {};
  for (const k of ORDER) { slug[k] = slugify(F[k].title); bySlug[slug[k]] = k; }
  /* addresses of renamed projects keep working: the function sends them on to the new address (2026-10-21) */
  const OLD = {'expo-2020': 'p17', 'the-worlds-largest-gathering-of-futurists': 'p13', 'valamar-biking': 'p10', 'a-perfect-day-on-the-bike': 'p10', 'world-sports-summit-2026': 'wss26'};
  for (const [o, k] of Object.entries(OLD)) if (slug[k] && !bySlug[o]) bySlug[o] = k;
  const same = (a, b) => !!b && slugify(a).includes(slugify(b));
  return { F, PJ, CR, ORDER, slug, bySlug, same };
}
