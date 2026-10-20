// Reads the project data out of index.html (shared by the /work/* and /sitemap.xml functions).
// The site keeps its data in the page itself; this reads it without running the page's script.
export const SITE = 'https://panoramafilms.tv';

export const slugify = t => [...String(t)].map(c => /[đĐ]/.test(c) ? 'd' : c.normalize('NFD')[0]).join('')
  .toLowerCase().replace(/[’'`]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const strArr = s => [...String(s || '').matchAll(/"([^"]+)"/g)].map(m => m[1]);
const field = (line, name) => { const m = line.match(new RegExp(`(?:^|[{,\\s])${name}:"((?:[^"\\\\]|\\\\.)*)"`)); return m ? m[1].replace(/\\(.)/g, '$1') : undefined; };

export function readSite(html) {
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
  const ORDER = [...LIST, ...INDEX].filter(k => F[k] && !DRAFTS.includes(k) && !HIDDEN.includes(k));
  const slug = {}, bySlug = {};
  for (const k of ORDER) { slug[k] = slugify(F[k].title); bySlug[slug[k]] = k; }
  const same = (a, b) => !!b && slugify(a).includes(slugify(b));
  return { F, PJ, CR, ORDER, slug, bySlug, same };
}
