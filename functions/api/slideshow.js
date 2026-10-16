/* Saves the Human in the loop slideshow from the unlinked page /slideshow/ (2026-10-15).
   A Cloudflare Pages Function: Cloudflare runs it at /api/slideshow; it is not a static file.

   GET  /api/slideshow  → { configured: true|false }  (is saving switched on?)
   POST /api/slideshow  → commits new photos (and their thumbnails) plus media/bts/photos.json to GitHub in one commit.
        Header  X-Password: the page password
        Body    { photos: [{f,w,h,v,hidden}], uploads: [{f, data, thumb}], message }   (data / thumb: base64)

   Settings, in Cloudflare → Workers & Pages → panorama-website → Settings → Variables and Secrets
   (set them for Production and for Preview):
     GITHUB_TOKEN         secret: a fine-grained GitHub token for xtrapurified/panorama-website, Contents: Read and write
     SLIDESHOW_PASSWORD   secret: the password the page asks for
     GITHUB_BRANCH        optional, default "dev"  (the branch the page saves to)
     GITHUB_REPO          optional, default "xtrapurified/panorama-website"
   No secret is ever written in the page or in this file. */

const NAME = /^\d{2,4}\.(webp|jpg)$/;
const MAX_UPLOADS = 40, MAX_FILE = 6 * 1024 * 1024;   /* per photo, decoded */

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
});

async function sameSecret(a, b){   /* compare hashes so the check takes the same time whatever is typed */
  const enc = new TextEncoder();
  const [x, y] = await Promise.all([a, b].map(s => crypto.subtle.digest('SHA-256', enc.encode(String(s || '')))));
  const u = new Uint8Array(x), v = new Uint8Array(y); let d = 0;
  for (let i = 0; i < u.length; i++) d |= u[i] ^ v[i];
  return d === 0 && !!b;
}

function gh(env){
  const repo = env.GITHUB_REPO || 'xtrapurified/panorama-website';
  return async (path, init = {}) => {
    const r = await fetch(`https://api.github.com/repos/${repo}${path}`, { ...init, headers: {
      authorization: `Bearer ${env.GITHUB_TOKEN}`, accept: 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28', 'user-agent': 'panorama-slideshow', 'content-type': 'application/json' } });
    const body = await r.json().catch(() => ({}));
    if (!r.ok){ const e = new Error(body.message || `GitHub ${r.status}`); e.status = r.status; throw e; }
    return body;
  };
}

function check(body){
  if (!body || !Array.isArray(body.photos) || !body.photos.length) return 'No photo list';
  const seen = new Set();
  for (const p of body.photos){
    if (!p || !NAME.test(p.f) || seen.has(p.f)) return `Bad photo entry ${p && p.f}`;
    if (!(p.w > 0 && p.h > 0)) return `Missing size for ${p.f}`;
    seen.add(p.f);
  }
  const ups = body.uploads || [];
  if (!Array.isArray(ups) || ups.length > MAX_UPLOADS) return `At most ${MAX_UPLOADS} new photos per save`;
  for (const u of ups){
    if (!u || !NAME.test(u.f) || !seen.has(u.f)) return `Upload ${u && u.f} is not in the list`;
    if (typeof u.data !== 'string' || typeof u.thumb !== 'string') return `Upload ${u.f} has no data`;
    if (u.data.length * .75 > MAX_FILE) return `${u.f} is too large`;
  }
  return '';
}

export async function onRequestGet({ env }){
  return json({ configured: !!(env.GITHUB_TOKEN && env.SLIDESHOW_PASSWORD), branch: env.GITHUB_BRANCH || 'dev' });
}

export async function onRequestPost({ request, env }){
  if (!env.GITHUB_TOKEN || !env.SLIDESHOW_PASSWORD) return json({ error: 'Saving is not switched on yet' }, 503);
  if (!(await sameSecret(request.headers.get('x-password'), env.SLIDESHOW_PASSWORD))){
    await new Promise(r => setTimeout(r, 1500));   /* slows down anyone trying passwords one after another */
    return json({ error: 'Wrong password' }, 401);
  }
  if (+(request.headers.get('content-length') || 0) > 90 * 1024 * 1024) return json({ error: 'Too much at once: save fewer photos' }, 413);
  let body; try { body = await request.json(); } catch(e){ return json({ error: 'Could not read the request' }, 400); }
  const bad = check(body); if (bad) return json({ error: bad }, 400);

  const api = gh(env), branch = env.GITHUB_BRANCH || 'dev';
  const photos = body.photos.map(({ f, w, h, v, hidden }) => ({ f, w: Math.round(w), h: Math.round(h), v: Math.max(1, Math.round(v || 1)), hidden: !!hidden }));
  const list = '{"photos": [\n' + photos.map(p => JSON.stringify(p).replace(/":/g, '": ')).join(',\n') + '\n]}\n';
  const message = (String(body.message || '').slice(0, 200) || 'Slideshow photos updated') + '\n\nSaved from the /slideshow/ page.';

  try {
    /* the photos first: their blobs don't depend on the branch, so a retry only redoes the commit */
    const files = [];
    for (const u of body.uploads || []){
      const [a, b] = await Promise.all([
        api('/git/blobs', { method: 'POST', body: JSON.stringify({ content: u.data, encoding: 'base64' }) }),
        api('/git/blobs', { method: 'POST', body: JSON.stringify({ content: u.thumb, encoding: 'base64' }) })]);
      files.push({ path: `media/bts/${u.f}`, sha: a.sha }, { path: `media/bts/thumbs/${u.f}`, sha: b.sha });
    }
    const lb = await api('/git/blobs', { method: 'POST', body: JSON.stringify({ content: list, encoding: 'utf-8' }) });
    files.push({ path: 'media/bts/photos.json', sha: lb.sha });

    for (let attempt = 0; attempt < 3; attempt++){   /* someone else may push in between: start again from the new tip */
      const ref = await api(`/git/ref/heads/${branch}`);
      const head = await api(`/git/commits/${ref.object.sha}`);
      const tree = await api('/git/trees', { method: 'POST', body: JSON.stringify({ base_tree: head.tree.sha,
        tree: files.map(x => ({ path: x.path, mode: '100644', type: 'blob', sha: x.sha })) }) });
      const commit = await api('/git/commits', { method: 'POST', body: JSON.stringify({ message, tree: tree.sha, parents: [ref.object.sha] }) });
      try {
        await api(`/git/refs/heads/${branch}`, { method: 'PATCH', body: JSON.stringify({ sha: commit.sha, force: false }) });
        return json({ ok: true, commit: commit.sha.slice(0, 7), branch });
      } catch(e){ if (e.status !== 422 || attempt === 2) throw e; }
    }
  } catch(e){
    return json({ error: `GitHub said: ${e.message}` }, 502);
  }
}
