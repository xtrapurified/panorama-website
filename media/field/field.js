/* experimental2 (2026-10-30): the site as one field of moving tiles, after wanda.net.
 *
 * WORK — every project is a tile playing its own clip, shuffled and laid out anew on each visit (order, sizes, shapes,
 * positions; the showreel among the first three) on a 24-column grid, mostly wide and scope crops (2.39:1) as on
 * wanda.net. Tiles rest at 75% and come up under the pointer, which shows the client and the title on a black strip.
 * The field drifts against the mouse, each tile by its own depth.
 *
 * SCROLLING (computers) — as on wanda.net, the page itself does not scroll: every tile (and every line further down)
 * chases the wheel on its own spring, some a little faster than others, so the field stretches and settles
 * (one wheel notch ≈ 120 px, 60 % there in 0.2 s, settled after ~1.5 s, as measured on wanda.net). Phones, touch screens
 * and reduced motion scroll normally.
 *
 * THE REST OF THE SITE — three approaches to try, ?rest=a|b|c (remembered; a switch at the bottom left):
 *   a  Panels:   the field is the whole site; Studio and Contact open as panels over the dimmed field, like Index.
 *   b  Credits:  after the last film the studio rolls like a film's end credits: who, what, for whom, and the ask.
 *   c  One field: the field goes on into the studio: portraits, behind-the-scenes photos and a few short lines, same tiles.
 * The page's old sections stay in the source, hidden.
 *
 * Uses the page's own data, openFilm and thumbnail player, so /work/ addresses, history and project pages are untouched.
 * ?seed=123 repeats a layout. ?cursor=dot|play.
 */
(() => {
  if (typeof F === 'undefined' || typeof openFilm !== 'function') return;
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const G = window.gsap;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const field = $('#field'), wrap = $('#fxTiles'), lb = $('#lb'), hdr = $('#hdr');
  if (!field || !wrap) return;
  const qs = new URLSearchParams(location.search);
  const pref = (name, key, ok, dflt) => { let v = (qs.get(name) || '').toLowerCase();
    try { if (ok.test(v)) localStorage.setItem(key, v); else v = localStorage.getItem(key) || dflt; } catch (_) { if (!ok.test(v)) v = dflt; }
    return ok.test(v) ? v : dflt; };

  /* the cursor over film tiles: a small red dot (default) or the white play triangle alone (Andrija, 2026-10-30: no circle) */
  root.dataset.cur = pref('cursor', 'pf-cur', /^(dot|play)$/, 'dot');
  const REST = (root.dataset.rest = pref('rest', 'pf-rest', /^(a|b|b1|b2|c)$/, 'b1'));
  const CREDITS = REST[0] === 'b';   /* b, b1, b2: the studio after the last film */
  const VIRTUAL = FINE && !RM && !!G;   /* the wanda.net scrolling, on computers */
  root.classList.toggle('x2-vs', VIRTUAL);

  const T = (window.PF_FIELD = { pan: 0.165, depth: [0.82, 1.16], ease: 0.055, scrollDepth: 0.6, fadeOut: 0.45, fadeIn: 0.7,
    step: [0.74, 0.98], stepPhone: [0.95, 1.04],          /* how far down the next tile starts, as a share of its height */
    wheel: 1.2, spring: [3.4, 5.8], springText: [4.6, 6.4] });

  /* ---------- the films ---------- */
  const visible = k => F[k] && !(typeof HIDDEN !== 'undefined' && HIDDEN.includes(k));
  const keys = ['reel', ...ORDER].filter((k, i, a) => visible(k) && a.indexOf(k) === i);
  /* moving pictures for every tile: OWN montages cut for the field (media/field/clips); STREAMED films that could not be
     fetched play silently from Vimeo / YouTube through the page's own thumbnail player (phones keep the loop) */
  const OWN = new Set(['hotf', 'p28', 'p37']);
  const STREAMED = new Set(['p16', 'p21', 'p24', 'p26', 'p29', 'p30', 'p32', 'p35', 'p36', 'p38']);
  const streams = k => STREAMED.has(k) && typeof mio !== 'undefined' && (F[k].v || F[k].yt);
  const clipOf = k => { const f = F[k]; return OWN.has(k) ? `${M}field/clips/${k}.mp4` : f.clip ? `${M}clips/${f.clip}.${VEXT}` : f.hover ? `${M}hover/${f.hover}.${VEXT}` : null; };
  const clientOf = k => (k === 'reel' ? 'Panorama Films' : F[k].client || '');
  const titleOf = k => { const f = F[k]; return k === 'reel' ? `Showreel${f.dur ? ' ' + f.dur : ''}` : f.title; };
  const hrefOf = k => (k !== 'reel' && typeof workUrl === 'function' && workUrl(k)) || (typeof ext === 'function' ? ext(F[k]) : '#');
  const e = s => (typeof esc === 'function' ? esc(s) : String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]));

  /* ---------- the studio, in few words (everything here is already on the site or confirmed by Andrija) ---------- */
  const STATEMENT = 'Panorama Films is an open circle of creatives telling stories that matter in ways that make you care.';
  const CORE = [['andrija', 'Andrija Kovač', 'Creative Director', 'media/team/andrija-4.webp'],
    ['mina', 'Mina Strugar', 'Producer', 'media/team/mina-4.webp'],
    ['marija', 'Marija Kovačina', 'Editorial Director', 'media/team/marija-2.webp']];
  /* collaborators: roles in their own words (from the bios they sent); Ana and Nevena are production assistants on every project */
  const COLLECTIVE = [['piki', 'Vladimir Miladinović Piki', 'Photographer & cinematographer'], ['babic', 'Nemanja Babić', 'Director & editor'],
    ['cile', 'Marko Cile Mladenović', 'Director of photography'], ['danilo', 'Danilo Pantović', 'Director & editor'],
    ['stojanovic', 'Nemanja Stojanović', 'Filmmaker & photographer'], ['bojan', 'Bojan Palikuća', 'Sound designer & composer'],
    ['zoran', 'Zoran Rašić', 'Videographer & photographer'], ['milovan', 'Milovan Ilić', 'Videographer & photographer'],
    ['neda', 'Neda Mojsilović', 'Cinematographer & photographer'], ['matija', 'Matija Đukanović', 'Film editor'],
    ['ana', 'Ana Ćurčin', 'Production assistant'], ['nevena', 'Nevena Krivokapić-Martinović', 'Production assistant']]
    .map(([id, n, r]) => [id, n, r, `media/team/${id}.webp`]);
  const PEOPLE = [...CORE, ...COLLECTIVE];
  const WE_MAKE = ['Documentaries', 'Campaigns', 'Legacy Films', 'BTS & Process Films', 'Experiences'];
  const CLIENTS = typeof LOGOS !== 'undefined' ? Object.keys(LOGOS) : [];   /* the selected clients come first */
  const filmOfClient = c => (typeof CLIENT_FILM !== 'undefined' && CLIENT_FILM[c] && visible(CLIENT_FILM[c])) ? CLIENT_FILM[c] : null;
  const PLACES = '<span lang="sr-Cyrl">Београд</span> <bdi lang="ar">دبي</bdi> Worldwide';
  const MAIL = 'Film enquiry';
  const LINKS = `<a href="#contact" data-mail="${MAIL}">Email</a><a href="https://www.instagram.com/panoramafilms.tv/" target="_blank" rel="noopener">Instagram</a><a href="https://vimeo.com/panoramafilmstv" target="_blank" rel="noopener">Vimeo</a>`;

  /* ---------- b1 / b2: the credits in columns, in the old site's type: Data Error codes, code lines, Rec ---------- */
  function buildCredits(v) {
    const sec = document.createElement('section');
    sec.className = `x2-rest x2-cr2 x2-${v}`; sec.setAttribute('aria-label', 'Studio');
    const code = (n, w) => `<span class="x2-code">PF-${w.slice(0, 2).toUpperCase()}/${String(n).padStart(3, '0')} ${e(w.toUpperCase())}</span>`;
    const ln = (k, val) => `<p class="x2-ln"><span class="k">${k}</span> <span class="v">${val}</span></p>`;
    const cl = (c, cls = '') => filmOfClient(c) ? `<a class="${cls}" href="${hrefOf(filmOfClient(c))}" data-x2film="${filmOfClient(c)}">${e(c)}</a>` : `<span class="${cls}">${e(c)}</span>`;
    const rec = '<span class="x2-rec"><span class="x2-rd" aria-hidden="true"></span>Rec <span class="x2-tc">00:00:00:00</span></span>';
    const clients = CLIENTS.slice(0, 18);
    if (v === 'b1') {
      /* B1: a label column on the left (Data Error codes), content in columns on the right, all left-aligned */
      const grp = (n, w, body, extra = '') => `<div class="cr2-g" data-x2b${extra}><div class="cr2-l">${code(n, w)}</div><div class="cr2-b">${body}</div></div>`;
      sec.innerHTML =
        grp(1, 'Studio', `<p class="cr2-say">${e(STATEMENT)}</p><p class="cr2-meta">${rec}<span class="cr2-pl">${PLACES}</span></p>`) +
        grp(2, 'Core', `<ul class="cr2-cols c3">${CORE.map(([id, n, r]) => `<li data-pp="${id}"><span class="cr2-r">${e(r)}</span><span class="cr2-n">${e(n)}</span></li>`).join('')}</ul>`) +
        grp(3, 'Collective', `<ul class="cr2-cols c3">${COLLECTIVE.map(([id, n, r]) => `<li data-pp="${id}"><span class="cr2-n">${e(n)}</span><span class="cr2-r">${e(r)}</span></li>`).join('')}</ul>`) +
        grp(4, 'We make', `<ol class="cr2-make">${WE_MAKE.map((w, i) => `<li><span class="cr2-no">${String(i + 1).padStart(2, '0')}</span>${e(w)}</li>`).join('')}</ol>`) +
        grp(5, 'Made for', `<ul class="cr2-cols c3 cr2-cl">${clients.map(c => `<li>${cl(c)}</li>`).join('')}</ul>`) +
        grp(6, 'Contact', `<p class="x2-ln cr2-cmd"><span class="k">$</span> <span class="v">panorama --contact</span><span class="x2-cur" aria-hidden="true"></span></p>
          <p class="cr2-ask"><a href="#contact" data-mail="${MAIL}">Let’s make a film together.</a></p><p class="cr2-links">${LINKS}</p>`, ' data-x2sec="contact"');
    } else {
      /* B2: the studio as a session in the site's code voice: commands in grey, answers in white, a red cursor at the end */
      const cmd = c => `<p class="x2-ln x2-cmdl"><span class="k">$</span> <span class="v">${c}</span></p>`;
      const dot = (r, n, id) => `<li${id ? ` data-pp="${id}"` : ''}><span class="cr2-r">${e(r)}</span><span class="cr2-lead" aria-hidden="true"></span><span class="cr2-n">${e(n)}</span></li>`;
      const grp = (body, extra = '') => `<div class="cr2-g" data-x2b${extra}>${body}</div>`;
      sec.innerHTML =
        grp(`<div class="cr2-top"><span class="x2-code">PF-ST/001 STUDIO</span>${rec}</div>${cmd('panorama --about')}<p class="cr2-say">${e(STATEMENT)}</p>${ln('location =', `[<span lang="sr-Cyrl">Београд</span>, <bdi lang="ar">دبي</bdi>, worldwide]`)}`) +
        grp(`${cmd('panorama --show crew')}<ul class="cr2-dots">${CORE.map(([id, n, r]) => dot(r, n, id)).join('')}</ul>`) +
        grp(`${cmd('panorama --show collective')}<ul class="cr2-dots">${COLLECTIVE.map(([id, n, r]) => dot(r, n, id)).join('')}</ul>`) +
        grp(`${ln('output =', `[${WE_MAKE.map(w => e(w.toLowerCase())).join(', ')}]`)}<ol class="cr2-make">${WE_MAKE.map((w, i) => `<li><span class="cr2-no">${String(i + 1).padStart(2, '0')}</span>${e(w)}</li>`).join('')}</ol>`) +
        grp(`${cmd(`panorama --clients | head ${clients.length}`)}<ul class="cr2-cols c3 cr2-cl">${clients.map(c => `<li>${cl(c)}</li>`).join('')}</ul>`) +
        grp(`${cmd('panorama --contact')}<p class="cr2-ask"><a href="#contact" data-mail="${MAIL}">Let’s make a film together.</a><span class="x2-cur" aria-hidden="true"></span></p><p class="cr2-links">${LINKS}</p>`, ' data-x2sec="contact"');
    }
    field.appendChild(sec);
    return sec;
  }

  /* ---------- tiles ---------- */
  const filmTile = k => `<div class="fx-i" data-k="${k}" data-g="work"><a class="fx-t" href="${hrefOf(k)}" data-fx="${k}" draggable="false" aria-label="${e(titleOf(k))}, ${e(clientOf(k))}">
    <span class="fx-m${streams(k) ? ' media cover' : ''}"${streams(k) ? ` data-c="${k}"${F[k].hover ? ` data-hv="${F[k].hover}"` : ''}` : ''}><img src="${still(k)}" alt="" loading="lazy" decoding="async" draggable="false"></span>
    <p class="fx-lab" aria-hidden="true"><span class="fx-c">${e(clientOf(k))}</span><span class="fx-ti">${e(titleOf(k))}</span></p></a></div>`;
  wrap.innerHTML = keys.map(filmTile).join('');

  /* c: the field goes on into the studio */
  let btsPhotos = [];
  if (REST === 'c') {
    const person = ([id, n, r, src], core) => `<div class="fx-i x2-pt${core ? ' core' : ''}" data-g="studio" data-shape="portrait"><div class="fx-t x2-st" tabindex="0" aria-label="${e(n)}, ${e(r)}">
      <span class="fx-m"><img src="${src}" alt="${e(n)}" loading="lazy" decoding="async" draggable="false"></span>
      <p class="fx-lab"><span class="fx-c">${e(r)}</span><span class="fx-ti">${e(n)}</span></p></div></div>`;
    const text = (cls, html, shape) => `<div class="fx-i x2-tx ${cls}" data-g="studio" data-shape="${shape}"><div class="fx-t x2-st">${html}</div></div>`;
    wrap.insertAdjacentHTML('beforeend',
      text('x2-chap', '<h2 class="x2-chap-t">Studio</h2>', 'chapter') +
      text('x2-say', `<p>${e(STATEMENT)}</p>`, 'say') +
      CORE.map(p => person(p, true)).join('') + COLLECTIVE.map(p => person(p, false)).join('') +
      text('x2-make', `<p class="x2-k">We make</p><p>${WE_MAKE.map(e).join('<br>')}</p>`, 'make') +
      text('x2-for', `<p class="x2-k">Made for</p><p>${CLIENTS.slice(0, 16).map(c => filmOfClient(c) ? `<a href="${hrefOf(filmOfClient(c))}" data-x2film="${filmOfClient(c)}">${e(c)}</a>` : e(c)).join(', ')}</p>`, 'for') +
      text('x2-ask', `<p class="x2-ask-t">Let’s make a film together.</p><p class="x2-links">${LINKS}</p><p class="x2-pl">${PLACES}</p>`, 'ask'));
    fetch('media/bts/photos.json').then(r => r.json()).then(d => {
      btsPhotos = (d.photos || []).filter(p => !p.hidden);
      const R = rng(seed ^ 0x2545f491), pickN = (a, n) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a.slice(0, n); };
      const html = pickN(btsPhotos, 14).map(p => `<div class="fx-i x2-bts" data-g="studio" data-shape="photo" data-ar="${(p.w / p.h).toFixed(3)}"><div class="fx-t x2-st" aria-hidden="true"><span class="fx-m"><img src="media/bts/${p.f}" alt="" loading="lazy" decoding="async" draggable="false"></span></div></div>`).join('');
      const ask = $('.x2-ask', wrap); if (ask) ask.insertAdjacentHTML('beforebegin', html); else wrap.insertAdjacentHTML('beforeend', html);
      collect(); shuffle(); layout(); measure(); items.forEach(it => io.observe(it.t));
    }).catch(() => {});
  }

  let items = [];
  const collect = () => { items = $$('.fx-i', wrap).map(el => { const old = items.find(x => x.el === el); return old || ({ el, t: $('.fx-t', el), k: el.dataset.k || null, g: el.dataset.g, shape: el.dataset.shape || 'film', d: 1, x: 0, y: 0, w: 0, h: 0, seen: false, cur: 0, kk: 5 }); }); };
  collect();

  /* ---------- the layout: new on every visit ---------- */
  let seed = Number(qs.get('seed')) || Math.floor(Math.random() * 1e9);
  function rng(a) { return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function shuffle() {
    const R = rng(seed ^ 0x5bd1e995);
    const mix = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    /* the films keep the website's order (showreel first, then as on the site); only where each one lands is random (Andrija, 2026-10-30) */
    const films = keys.map(k => items.find(it => it.k === k)).filter(Boolean);
    /* the studio: the chapter word and the statement open it, the ask closes it, everything else shuffled between */
    const st = items.filter(it => it.g === 'studio'), first = st.filter(it => /chapter|say/.test(it.shape)), last = st.filter(it => it.shape === 'ask');
    const mid = mix(st.filter(it => !first.includes(it) && !last.includes(it)));
    items = [...films, ...first, ...mid, ...last];
    items.forEach(it => wrap.appendChild(it.el));
  }
  function layout() {
    const R = rng(seed), r = (a, b) => a + (b - a) * R(), pick = a => a[Math.floor(R() * a.length)];
    const W = wrap.clientWidth, phone = W <= 760, u = W / 24;
    let y = phone ? 96 : Math.max(110, innerHeight * 0.16), bottom = 0, lastX = null, group = null;
    items.forEach(it => {
      if (group && it.g !== group) y = bottom + (phone ? 120 : innerHeight * 0.32);   /* a breath between Work and Studio */
      group = it.g;
      /* wide and scope crops, as on wanda.net (Andrija, 2026-10-30) */
      let ar = pick([16 / 9, 16 / 9, 16 / 9, 2.39, 2.39, 2.39, 2, 1.85, 3 / 2, 4 / 3]), colsR = [8, 16];
      if (it.shape === 'portrait') { ar = 4 / 5; colsR = it.el.classList.contains('core') ? [5, 7] : [3, 5]; }
      else if (it.shape === 'photo') { ar = Math.max(1, Math.min(2.4, parseFloat(it.el.dataset.ar) || 1.5)); colsR = [6, 11]; }
      else if (it.shape === 'chapter') { ar = 4; colsR = [10, 14]; }
      else if (it.shape === 'say') { ar = 2.39; colsR = [14, 18]; }
      else if (it.shape === 'make' || it.shape === 'for') { ar = it.shape === 'for' ? 1.6 : 1.4; colsR = [7, 9]; }
      else if (it.shape === 'ask') { ar = 2.2; colsR = [16, 20]; }
      let w, x;
      if (phone) {
        const big = /say|ask|chapter|for|make/.test(it.shape);
        w = W * (big ? 0.94 : it.shape === 'portrait' ? r(0.42, 0.62) : r(0.62, 0.96));
        x = big ? W * 0.03 : r(-0.04 * W, W - w + 0.04 * W);
      } else {
        const cols = Math.round(r(colsR[0], colsR[1]));
        w = cols * u;
        let c = /chapter/.test(it.shape) ? 1 : Math.round(r(-1, 24 - cols + 1));
        if (lastX !== null && Math.abs(c - lastX) < 3) c = c + (c < 12 - cols / 2 ? 6 : -6);
        c = Math.min(24 - cols + 1, Math.max(-1, c)); lastX = c;
        x = c * u;
      }
      const h = w / ar;
      Object.assign(it, { x, y, w, h, d: r(T.depth[0], T.depth[1]), kk: r(T.spring[0], T.spring[1]) });
      Object.assign(it.el.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' });
      bottom = Math.max(bottom, y + h);
      y += h * (phone ? r(...T.stepPhone) : r(...T.step));
    });
    wrap.style.height = Math.ceil(bottom + (phone ? 80 : 160)) + 'px';
  }
  shuffle(); layout();

  /* ---------- b: the end credits after the last film ---------- */
  let rest = null;
  if (REST === 'b1' || REST === 'b2') rest = buildCredits(REST);
  if (REST === 'b') {
    const row = (role, name, attrs = '') => `<div class="cr-r" data-x2b${attrs}><span class="cr-role">${e(role)}</span><span class="cr-n">${e(name)}</span></div>`;
    const head = t => `<h2 class="cr-h" data-x2b>${e(t)}</h2>`;
    const pairs = a => { const o = []; for (let i = 0; i < a.length; i += 2) o.push(a.slice(i, i + 2)); return o; };
    rest = document.createElement('section');
    rest.className = 'x2-rest x2-cr'; rest.setAttribute('aria-label', 'Studio'); rest.dataset.x2sec = 'studio';
    rest.innerHTML = `<p class="cr-mark" data-x2b><span class="cr-dot" aria-hidden="true"></span>Panorama Films<sup>®</sup></p>
      <p class="cr-say" data-x2b>${e(STATEMENT)}</p>
      ${CORE.map(([id, n, r]) => row(r, n, ` data-pp="${id}"`)).join('')}
      ${head('The Collective')}
      ${COLLECTIVE.map(([id, n, r]) => row(r, n, ` data-pp="${id}"`)).join('')}
      ${head('We make')}
      ${WE_MAKE.map(w => `<p class="cr-c" data-x2b>${e(w)}</p>`).join('')}
      ${head('Made for')}
      ${pairs(CLIENTS.slice(0, 18)).map(p => `<div class="cr-r cr-two" data-x2b>${p.map(c => filmOfClient(c) ? `<a class="cr-n" href="${hrefOf(filmOfClient(c))}" data-x2film="${filmOfClient(c)}">${e(c)}</a>` : `<span class="cr-n">${e(c)}</span>`).join('')}</div>`).join('')}
      <p class="cr-pl" data-x2b>${PLACES}</p>
      <div class="cr-end" data-x2b data-x2sec="contact"><p class="cr-ask"><a href="#contact" data-mail="${MAIL}">Let’s make a film together.</a></p><p class="cr-links">${LINKS}</p></div>`;
    field.appendChild(rest);
  }

  /* the visit's own Rec timecode (hh:mm:ss:ff at 25 fps), as in the old header */
  const t0 = performance.now();
  function recTick() {
    const els = $$('.x2-tc'); if (!els.length) return;
    const f = Math.floor((performance.now() - t0) / 40), p2 = n => String(n).padStart(2, '0');
    const t = `${p2(Math.floor(f / 90000))}:${p2(Math.floor(f / 1500) % 60)}:${p2(Math.floor(f / 25) % 60)}:${p2(f % 25)}`;
    els.forEach(el => { if (el.textContent !== t) el.textContent = t; });
  }

  /* ---------- clips: load and play only what is on screen ---------- */
  const io = new IntersectionObserver(es => es.forEach(en => {
    const it = items.find(x => x.t === en.target); if (!it) return;   /* the moving part of a tile is watched, not its resting frame */
    if (en.isIntersecting && !it.seen) { it.seen = true; it.el.classList.add('in'); }
    if (it.g !== 'work') return;
    const m = $('.fx-m', it.el); if (m.dataset.c) return;   /* streamed: the page's own player handles it */
    const src = clipOf(it.k);
    let v = $('video', m);
    if (en.isIntersecting && src && !RM) {
      if (!v) { v = document.createElement('video'); Object.assign(v, { muted: true, loop: true, playsInline: true, preload: 'auto' }); v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.addEventListener('playing', () => v.classList.add('on'), { once: true }); v.src = src; m.appendChild(v); }
      v.play().catch(() => {});
    } else if (v) v.pause();
  }), { rootMargin: '10% 0px' });
  items.forEach(it => io.observe(it.t));
  $$('.fx-m[data-c]', wrap).forEach(m => mio.observe(m));
  if (RM) items.forEach(it => it.el.classList.add('in'));

  /* ---------- scrolling ---------- */
  let target = 0;   /* where the wheel wants the field to be (computers) */
  /* lines of the credits are bodies too: each has its own spring, so the text stretches a little like the tiles */
  let lines = [];
  const SEC = {};   /* where Studio and Contact start, in the field's own coordinates (measured, not read every frame) */
  function measure() {
    const wh = wrap.offsetHeight;
    if (CREDITS && rest) { const c = $('[data-x2sec="contact"]', rest); SEC.studio = wh - 80; SEC.contact = c ? wh + c.offsetTop - innerHeight * 0.3 : null; }
    if (REST === 'c') { const ch = items.find(x => x.shape === 'chapter'), ask = items.find(x => x.shape === 'ask'); SEC.studio = ch ? ch.y - 100 : null; SEC.contact = ask ? ask.y - 100 : null; }
    if (!rest) return;
    lines = $$('[data-x2b]', rest).map((el, i) => { const o = lines.find(l => l.el === el); return { el, y: wrap.offsetHeight + el.offsetTop, h: el.offsetHeight, cur: o ? o.cur : target, kk: T.springText[0] + ((i * 0.37) % 1) * (T.springText[1] - T.springText[0]) }; });
  }
  measure();
  const worldH = () => wrap.offsetHeight + (rest ? rest.offsetHeight : 0);
  const maxY = () => Math.max(0, worldH() - innerHeight);
  const clampY = y => Math.max(0, Math.min(maxY(), y));
  const scrollY2 = () => (VIRTUAL ? target : scrollY);
  function scrollToY(y, instant) {
    if (VIRTUAL) { target = clampY(y); if (instant) { items.forEach(it => it.cur = target); lines.forEach(l => l.cur = target); } }
    else scrollTo({ top: field.offsetTop + y, behavior: RM || instant ? 'auto' : 'smooth' });
  }
  const blocked = el => el && el.closest && el.closest('#lb, .x2-ix, .x2-pnl, #sx, .navov');
  const overlayOpen = () => !lb.hidden || $('.x2-ix.on, .x2-pnl.on, #sx:not([hidden])');
  if (VIRTUAL) {
    addEventListener('wheel', ev => {
      if (blocked(ev.target) || overlayOpen()) return;
      ev.preventDefault();
      const d = ev.deltaMode === 1 ? ev.deltaY * 16 : ev.deltaMode === 2 ? ev.deltaY * innerHeight : ev.deltaY;
      target = clampY(target + d * T.wheel);
    }, { passive: false });
    addEventListener('keydown', ev => {
      if (overlayOpen() || ev.defaultPrevented || /input|textarea|select/i.test((ev.target.tagName || '')) || ev.metaKey || ev.ctrlKey || ev.altKey) return;
      const H = innerHeight, map = { ArrowDown: 100, ArrowUp: -100, PageDown: H * 0.85, PageUp: -H * 0.85, ' ': ev.shiftKey ? -H * 0.85 : H * 0.85 };
      if (ev.key in map) { ev.preventDefault(); target = clampY(target + map[ev.key]); }
      else if (ev.key === 'Home') { ev.preventDefault(); target = 0; }
      else if (ev.key === 'End') { ev.preventDefault(); target = maxY(); }
    });
    /* tabbing to something below the window brings it into view */
    field.addEventListener('focusin', ev => {
      const it = items.find(x => x.el.contains(ev.target)), l = lines.find(x => x.el.contains(ev.target));
      const y = it ? it.y : l ? l.y : null; if (y == null) return;
      if (y - target < 80 || y - target > innerHeight - 160) target = clampY(y - innerHeight * 0.35);
    });
  }

  /* the drift: against the mouse, each tile by its own depth */
  let mx = 0, my = 0, cx = 0, cy = 0;
  if (FINE && !RM) addEventListener('pointermove', ev => { mx = ev.clientX / innerWidth * 2 - 1; my = ev.clientY / innerHeight * 2 - 1; }, { passive: true });
  function tick(force) {
    if (!G) return;
    let dtR = G.ticker.deltaRatio(60); if (!isFinite(dtR) || dtR <= 0) dtR = 1;   /* the ticker gives no time step before its first frame */
    dtR = Math.min(dtR, 3); const dt = dtR / 60;
    const k = 1 - Math.pow(1 - T.ease, dtR);
    cx += (mx - cx) * k; cy += (my - cy) * k;
    const W = innerWidth, H = innerHeight;
    const ax = RM ? 0 : W * T.pan, ay = RM ? 0 : H * T.pan;
    if (VIRTUAL) {
      for (const it of items) {
        it.cur += (target - it.cur) * (1 - Math.exp(-it.kk * dt));
        const top = it.y - it.cur;
        const on = top + it.h > -300 && top < H + 300;
        if (!on && !force && it.off) continue;
        it.off = !on;
        it.t.style.transform = `translate3d(${(-cx * ax * it.d).toFixed(1)}px,${(-it.cur - cy * ay * it.d).toFixed(1)}px,0)`;
      }
      let prev = null;
      for (const l of lines) {
        l.cur += (target - l.cur) * (1 - Math.exp(-l.kk * dt));
        /* a line may lag, but never into the one above it: however hard the wheel, text never overlaps (Andrija, 2026-10-30) */
        if (prev) { const room = l.y - (prev.y + prev.h) - 12; l.cur = Math.min(l.cur, prev.cur + Math.max(0, room)); l.cur = Math.max(l.cur, prev.cur - Math.max(0, room)); }
        prev = l;
        const top = l.y - l.cur, on = top + l.h > -200 && top < H + 200;
        if (!on && !force && l.off) continue;
        l.off = !on;
        l.el.style.transform = `translate3d(0,${(-l.cur).toFixed(1)}px,0)`;
      }
    } else {
      const sy = scrollY, top0 = wrap.getBoundingClientRect().top + sy;
      for (const it of items) {
        const docY = top0 + it.y;
        if (!force && (docY + it.h < sy - 400 || docY > sy + H + 400)) continue;
        const par = RM ? 0 : (docY + it.h / 2 - (sy + H / 2)) * (it.d - 1) * T.scrollDepth;
        it.t.style.transform = `translate3d(${(-cx * ax * it.d).toFixed(1)}px,${(-cy * ay * it.d + par).toFixed(1)}px,0)`;
      }
    }
    breadcrumb(); recTick();
  }

  addEventListener('pageshow', ev => { if (ev.persisted && !qs.get('seed')) { seed = Math.floor(Math.random() * 1e9); shuffle(); layout(); measure(); tick(true); } });
  let rw = 0; addEventListener('resize', () => { clearTimeout(rw); rw = setTimeout(() => { layout(); measure(); target = clampY(target); tick(true); }, 120); });
  if (document.fonts) document.fonts.ready.then(() => { measure(); tick(true); });

  /* phones: the tile crossing the middle of the window comes up to full brightness */
  if (!FINE) {
    const nio = new IntersectionObserver(es => es.forEach(en => en.target.classList.toggle('near', en.isIntersecting)), { rootMargin: '-42% 0px -42% 0px' });
    items.forEach(it => nio.observe(it.t));
  }

  /* ---------- opening a project: the field fades out, the project fades in; closing brings the field back ---------- */
  const fadeEls = () => [wrap, rest].filter(Boolean);
  function go(k) {
    closePanels(); closeIndex(true);
    if (RM || !G) { openFilm(k); return; }
    G.to(fadeEls(), { autoAlpha: 0, duration: T.fadeOut, ease: 'power1.out', onComplete: () => openFilm(k) });
  }
  document.addEventListener('click', ev => {
    const a = ev.target.closest('.fx-t[data-fx], [data-x2film]'); if (!a || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button) return;
    ev.preventDefault(); ev.stopPropagation(); go(a.dataset.fx || a.dataset.x2film);
  }, true);
  if (lb) new MutationObserver(() => {
    if (lb.hidden) { if (G) G.to(fadeEls(), { autoAlpha: 1, duration: RM ? 0 : T.fadeIn, ease: 'power1.out' }); else fadeEls().forEach(x => { x.style.opacity = ''; }); }
  }).observe(lb, { attributes: true, attributeFilter: ['hidden'] });

  /* ---------- the header: wordmark, breadcrumb, ⊕ ---------- */
  const slot = $('#slot'), bar = $('.hdr .bar');
  const crumbs = REST === 'a' ? [['work', 'Work'], ['index', 'Index'], ['studio', 'Studio'], ['contact', 'Contact']]
    : [['work', 'Work'], ['index', 'Index'], ['studio', 'Studio']];
  if (slot) slot.insertAdjacentHTML('beforeend', `<span class="x2-bc">${crumbs.map(([id, t]) => `<button type="button" data-bc="${id}"${id === 'work' ? ' class="on"' : ''}>${t}</button>`).join('')}</span>`);
  if (bar) bar.insertAdjacentHTML('beforeend', '<button type="button" class="x2-plus" aria-label="More links" aria-expanded="false" aria-controls="menu"></button>');
  const plus = $('.x2-plus');
  plus && plus.addEventListener('click', () => { const o = hdr.classList.toggle('x2-open'); plus.setAttribute('aria-expanded', String(o)); });
  /* where a section starts, in the field's own coordinates */
  const secY = id => (id === 'work' ? 0 : SEC[id] == null ? null : SEC[id]);
  function goSection(id, from) {
    if (id === 'index') return openIndex(from);
    if (REST === 'a' && (id === 'studio' || id === 'contact')) return openPanel(id, from);
    closePanels(); closeIndex(true);
    const y = secY(id); if (y != null) scrollToY(y);
  }
  document.addEventListener('click', ev => {
    const b = ev.target.closest('.x2-bc button'); if (b) { goSection(b.dataset.bc, b); return; }
    /* the menu's links (and the phone menu) lead to the new places */
    const a = ev.target.closest('a[href="#field"], a[href="#studio"], a[href="#contact"]:not([data-mail]), a[href="#top"], a[href="#hero"]');
    if (!a || a.closest('#lb')) return;
    ev.preventDefault(); ev.stopPropagation();
    const h = a.getAttribute('href').slice(1), id = h === 'studio' ? 'studio' : h === 'contact' ? 'contact' : 'work';
    if (hdr.classList.contains('navopen')) { const bu = $('#burger'); bu && bu.click(); }
    goSection(id, a);
  }, true);
  let bcN = 0;
  function breadcrumb() {
    if (++bcN % 6) return;
    const y = scrollY2() + innerHeight * 0.4;
    const sY = secY('studio'), inStudio = REST !== 'a' && sY != null && sY > 0 && y >= sY + 80;
    const panel = $('.x2-pnl.on'), ixOn = $('.x2-ix.on');
    $$('.x2-bc button').forEach(b => {
      const id = b.dataset.bc;
      b.classList.toggle('on', ixOn ? id === 'index' : panel ? panel.dataset.p === id : id === (inStudio ? 'studio' : 'work'));
    });
    /* bare over the films (as on wanda.net); over the credits the header keeps its shade so text never runs under it */
    hdr.classList.toggle('x2-over', !(CREDITS && inStudio) && (VIRTUAL || REST === 'c' || wrap.getBoundingClientRect().bottom > 90));
  }

  /* ---------- the floating picture: a clip by a film's name, a portrait by a person's name ---------- */
  const pv = document.createElement('div'); pv.className = 'x2-pv'; pv.setAttribute('aria-hidden', 'true'); document.body.appendChild(pv);
  let pvK = null;
  const pxTo = G && G.quickTo(pv, 'x', { duration: 0.6, ease: 'power3.out' }), pyTo = G && G.quickTo(pv, 'y', { duration: 0.6, ease: 'power3.out' });
  const person = id => PEOPLE.find(p => p[0] === id);
  function showPv(kind, id) {
    if (!FINE || pvK === kind + id) return; pvK = kind + id;
    if (kind === 'film') { const src = clipOf(id); pv.className = 'x2-pv on'; pv.innerHTML = `<img src="${still(id)}" alt="">` + (src && !RM ? `<video src="${src}" muted loop playsinline autoplay></video>` : ''); }
    else { const p = person(id); if (!p) return; pv.className = 'x2-pv on x2-pv-p'; pv.innerHTML = `<img src="${p[3]}" alt="">`; }
    placePv(true);   /* appear by the pointer, not in the corner */
  }
  const hidePv = () => { pv.classList.remove('on'); pvK = null; };
  let px = 0, py = 0;
  const placePv = instant => {
    const w = pv.offsetWidth, h = pv.offsetHeight;
    const x = Math.min(innerWidth - w - 16, Math.max(16, px + 40)), y = Math.min(innerHeight - h - 16, Math.max(16, py - h / 2));
    if (instant || !pxTo || RM) { if (G) G.set(pv, { x, y }); else pv.style.transform = `translate(${x}px,${y}px)`; if (pxTo) { pxTo(x); pyTo(y); } }
    else { pxTo(x); pyTo(y); }
  };
  addEventListener('pointermove', ev => { px = ev.clientX; py = ev.clientY; if (pv.classList.contains('on')) placePv(); }, { passive: true });
  document.addEventListener('pointerover', ev => {
    if (!FINE) return;
    px = ev.clientX; py = ev.clientY;
    const f = ev.target.closest('[data-ix], [data-x2film]'), p = ev.target.closest('[data-pp]');
    if (f) showPv('film', f.dataset.ix || f.dataset.x2film); else if (p) showPv('person', p.dataset.pp);
  });
  document.addEventListener('pointerout', ev => { const to = ev.relatedTarget; if (!to || !to.closest || !to.closest('[data-ix], [data-x2film], [data-pp]')) hidePv(); });

  /* ---------- Index: every project, or every client, in columns over the dimmed field ---------- */
  const clientsIx = [...new Map(keys.filter(k => k !== 'reel').map(k => [clientOf(k), k])).entries()].filter(([c]) => c && c !== 'Panorama Films').sort((a, b) => a[0].localeCompare(b[0]));
  const ix = document.createElement('div');
  ix.className = 'x2-ix'; ix.setAttribute('role', 'dialog'); ix.setAttribute('aria-modal', 'true'); ix.setAttribute('aria-label', 'Index');
  ix.innerHTML = `<button type="button" class="x2-ix-x">(×) Close</button>
    <div class="x2-ix-in"><div class="x2-tabs" role="tablist"><button type="button" role="tab" aria-selected="true" data-tab="p">Projects</button><button type="button" role="tab" aria-selected="false" data-tab="c">Clients</button></div>
    <ul class="x2-g" data-g="p">${keys.map(k => `<li><a href="${hrefOf(k)}" data-ix="${k}">${e(titleOf(k))}</a></li>`).join('')}</ul>
    <ul class="x2-g" data-g="c" hidden>${clientsIx.map(([c, k]) => `<li><a href="${hrefOf(k)}" data-ix="${k}">${e(c)}</a></li>`).join('')}</ul></div>`;
  document.body.appendChild(ix);
  let back = null;
  function openIndex(from) {
    closePanels();
    back = from || document.activeElement; ix.classList.add('on'); document.body.style.overflow = 'hidden';
    setTimeout(() => { const a = $('.x2-g:not([hidden]) a', ix); a && a.focus({ preventScroll: true }); }, 50);
  }
  function closeIndex(quiet) {
    if (!ix.classList.contains('on')) return;
    ix.classList.remove('on'); hidePv(); document.body.style.overflow = '';
    if (!quiet && back && back.focus) back.focus({ preventScroll: true });
  }
  $('.x2-ix-x', ix).addEventListener('click', () => closeIndex());
  $$('.x2-tabs button', ix).forEach(b => b.addEventListener('click', () => {
    $$('.x2-tabs button', ix).forEach(x => x.setAttribute('aria-selected', String(x === b)));
    $$('.x2-g', ix).forEach(g => { g.hidden = g.dataset.g !== b.dataset.tab; });
  }));
  ix.addEventListener('click', ev => {
    const a = ev.target.closest('[data-ix]'); if (!a || ev.metaKey || ev.ctrlKey) return;
    ev.preventDefault(); ev.stopPropagation(); go(a.dataset.ix);
  });

  /* ---------- a: Studio and Contact as panels over the dimmed field ---------- */
  const panels = {};
  if (REST === 'a') {
    const mk = (id, label, html) => { const p = document.createElement('div'); p.className = 'x2-pnl x2-ix'; p.dataset.p = id; p.setAttribute('role', 'dialog'); p.setAttribute('aria-modal', 'true'); p.setAttribute('aria-label', label);
      p.innerHTML = `<button type="button" class="x2-ix-x">(×) Close</button><div class="x2-ix-in">${html}</div>`; document.body.appendChild(p); panels[id] = p;
      $('.x2-ix-x', p).addEventListener('click', () => closePanels(true)); };
    mk('studio', 'Studio', `<p class="pn-say">${e(STATEMENT)}</p>
      <div class="pn-core">${CORE.map(([id, n, r, src]) => `<figure class="pn-pt"><img src="${src}" alt="${e(n)}" loading="lazy"><figcaption><span class="fx-c">${e(r)}</span><span class="fx-ti">${e(n)}</span></figcaption></figure>`).join('')}</div>
      <div class="pn-cols">
        <div><p class="pn-k">The Collective</p><ul class="pn-l">${COLLECTIVE.map(([id, n, r]) => `<li data-pp="${id}"><span>${e(n)}</span> <span class="pn-r">${e(r)}</span></li>`).join('')}</ul></div>
        <div><p class="pn-k">We make</p><ul class="pn-l">${WE_MAKE.map(w => `<li>${e(w)}</li>`).join('')}</ul></div>
        <div><p class="pn-k">Made for</p><ul class="pn-l">${CLIENTS.map(c => `<li>${filmOfClient(c) ? `<a href="${hrefOf(filmOfClient(c))}" data-x2film="${filmOfClient(c)}">${e(c)}</a>` : e(c)}</li>`).join('')}</ul></div>
      </div>`);
    mk('contact', 'Contact', `<p class="pn-ask"><a href="#contact" data-mail="${MAIL}">Let’s make a film together.</a></p><p class="pn-links">${LINKS}</p><p class="pn-pl">${PLACES}</p>`);
  }
  let pBack = null;
  function openPanel(id, from) {
    closeIndex(true); closePanels(true);
    const p = panels[id]; if (!p) return;
    pBack = from || document.activeElement; p.classList.add('on'); document.body.style.overflow = 'hidden';
    setTimeout(() => { const x = $('.x2-ix-x', p); x && x.focus({ preventScroll: true, focusVisible: false }); }, 50);
  }
  function closePanels(refocus) {
    const p = $('.x2-pnl.on'); if (!p) return;
    p.classList.remove('on'); hidePv(); document.body.style.overflow = '';
    if (refocus === true && pBack && pBack.focus) pBack.focus({ preventScroll: true });
  }
  addEventListener('keydown', ev => {
    if (ev.key !== 'Escape') return;
    if (ix.classList.contains('on')) { ev.stopPropagation(); closeIndex(); }
    else if ($('.x2-pnl.on')) { ev.stopPropagation(); closePanels(true); }
  }, true);

  /* ---------- the switch between the three approaches (for trying them; bottom left) ---------- */
  const sw = document.createElement('div');
  sw.className = 'x2-sw'; sw.setAttribute('role', 'group'); sw.setAttribute('aria-label', 'Try another approach for the rest of the site');
  sw.innerHTML = '<span>Rest of site</span>' + [['a', 'A Panels'], ['b', 'B Credits'], ['b1', 'B1 Columns'], ['b2', 'B2 Code'], ['c', 'C One field']].map(([v, t]) => `<a href="?rest=${v}"${v === REST ? ' aria-current="true"' : ''}>${t}</a>`).join('');
  document.body.appendChild(sw);
  window.PF_X2 = { get target() { return target; }, scrollToY, items: () => items, REST, VIRTUAL };
  /* start moving only now that everything above exists */
  tick(true);
  if (G) G.ticker.add(() => tick());
})();
