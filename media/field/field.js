/* experimental2 (2026-10-30): the films as one field of moving tiles, after wanda.net.
 *
 * Every project (the showreel first, the featured films larger) is a tile playing its own clip, laid out anew on
 * each visit on a 24-column grid: different sizes, overlapping like a collage, on near-black. Tiles rest at 75% and
 * come up under the pointer, which also shows the client (monospace) and title on the tile. The whole field drifts
 * against the mouse, each tile by its own depth, and scrolls smoothly, tiles at slightly different speeds.
 * A click fades the field out and the project fades in; closing brings the field back.
 * The header is the wordmark, a breadcrumb (Work · Index) and a ⊕ that unfolds the links; Index lists every project
 * (or client) in four columns over the dimmed field, the clip floating by the name under the pointer.
 *
 * Uses the page's own data and openFilm, so /work/ addresses, history and the project pages are untouched.
 * Reduced motion: no drift, no fades.  ?seed=123 repeats a layout.
 */
(() => {
  if (typeof F === 'undefined' || typeof openFilm !== 'function') return;
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const G = window.gsap;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const field = $('#field'), wrap = $('#fxTiles'), lb = $('#lb'), hdr = $('#hdr');
  if (!field || !wrap) return;

  const T = (window.PF_FIELD = { pan: 0.165, depth: [0.82, 1.16], ease: 0.055, scrollDepth: 0.6, fadeOut: 0.45, fadeIn: 0.7,
    step: [0.74, 0.98], stepPhone: [0.95, 1.04] });   /* less overlap again (Andrija, 2026-10-30) */   /* step: how far down the next tile starts, as a share of the tile's height (less overlap = higher) */

  /* ---------- what goes in: the showreel, the featured films, then everything else, as on the site ---------- */
  const visible = k => F[k] && !(typeof HIDDEN !== 'undefined' && HIDDEN.includes(k));
  const keys = ['reel', ...ORDER].filter((k, i, a) => visible(k) && a.indexOf(k) === i);
  const featured = new Set(['reel', ...(typeof LIST !== 'undefined' ? LIST.slice(0, 7) : [])]);
  const clipOf = k => { const f = F[k]; return f.clip ? `${M}clips/${f.clip}.${VEXT}` : f.hover ? `${M}hover/${f.hover}.${VEXT}` : null; };
  const clientOf = k => { const f = F[k]; return k === 'reel' ? 'Panorama Films' : f.client || ''; };
  const titleOf = k => { const f = F[k]; return k === 'reel' ? `Showreel${f.dur ? ' ' + f.dur : ''}` : f.title; };
  const hrefOf = k => (k !== 'reel' && typeof workUrl === 'function' && workUrl(k)) || (typeof ext === 'function' ? ext(F[k]) : '#');
  const e = s => (typeof esc === 'function' ? esc(s) : String(s));

  wrap.innerHTML = keys.map(k => `<div class="fx-i" data-k="${k}"><a class="fx-t" href="${hrefOf(k)}" data-fx="${k}" draggable="false" aria-label="${e(titleOf(k))}, ${e(clientOf(k))}">
    <span class="fx-m"><img src="${still(k)}" alt="" loading="lazy" decoding="async" draggable="false"></span>
    <p class="fx-lab" aria-hidden="true"><span class="fx-c">${e(clientOf(k))}</span><span class="fx-ti">${e(titleOf(k))}</span></p></a></div>`).join('');
  const items = $$('.fx-i', wrap).map(el => ({ el, t: $('.fx-t', el), k: el.dataset.k, d: 1, x: 0, y: 0, w: 0, h: 0, seen: false }));

  /* ---------- the layout: generative, the same for one visit (or one ?seed) ---------- */
  const qs = new URLSearchParams(location.search);
  const seed = Number(qs.get('seed')) || Math.floor(Math.random() * 1e9);
  function rng(a) { return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function layout() {
    const R = rng(seed), r = (a, b) => a + (b - a) * R(), pick = a => a[Math.floor(R() * a.length)];
    const W = wrap.clientWidth, phone = W <= 760, u = W / 24;
    let y = phone ? 96 : Math.max(110, innerHeight * 0.16), bottom = 0;
    const zones = [0.05, 0.92, 0.5, 0.22, 0.78, 0.4, 0.65];
    items.forEach((it, i) => {
      const big = featured.has(it.k);
      const ar = pick([16 / 9, 16 / 9, 16 / 9, 3 / 2, 4 / 3]);
      let w, x;
      if (phone) {
        w = W * (big ? r(0.8, 0.92) : r(0.58, 0.8));
        x = (i % 2 ? W - w : 0) + r(-0.04, 0.04) * W;
      } else {
        const cols = i === 0 ? 14 : big ? pick([11, 12, 13]) : pick([7, 8, 8, 9, 10]);
        w = cols * u;
        const z = zones[i % zones.length] + r(-0.06, 0.06);
        x = Math.round(Math.min(24 - cols + 1, Math.max(-1, z * (24 - cols)))) * u;
      }
      const h = w / ar;
      Object.assign(it, { x, y, w, h, d: r(T.depth[0], T.depth[1]) });
      Object.assign(it.el.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' });
      bottom = Math.max(bottom, y + h);
      y += h * (phone ? r(...T.stepPhone) : r(...T.step));   /* less overlap than at first (Andrija, 2026-10-30) */
    });
    wrap.style.height = Math.ceil(bottom + (phone ? 80 : 160)) + 'px';
  }
  layout();
  let rw = 0; addEventListener('resize', () => { clearTimeout(rw); rw = setTimeout(() => { layout(); tick(true); }, 120); });

  /* ---------- clips: load and play only what is on screen ---------- */
  const io = new IntersectionObserver(es => es.forEach(en => {
    const it = items.find(x => x.el === en.target); if (!it) return;
    it.vis = en.isIntersecting;
    if (en.isIntersecting && !it.seen) { it.seen = true; it.el.classList.add('in'); }
    const src = clipOf(it.k), m = $('.fx-m', it.el);
    let v = $('video', m);
    if (en.isIntersecting && src && !RM) {
      if (!v) { v = document.createElement('video'); Object.assign(v, { muted: true, loop: true, playsInline: true, preload: 'auto' }); v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.addEventListener('playing', () => v.classList.add('on'), { once: true }); v.src = src; m.appendChild(v); }
      v.play().catch(() => {});
    } else if (v) v.pause();
  }), { rootMargin: '10% 0px' });
  items.forEach(it => io.observe(it.el));
  if (RM) items.forEach(it => it.el.classList.add('in'));

  /* ---------- the drift: against the mouse, each tile by its own depth; and a little depth on scroll ---------- */
  let mx = 0, my = 0, cx = 0, cy = 0;
  if (FINE && !RM) addEventListener('pointermove', ev => { mx = ev.clientX / innerWidth * 2 - 1; my = ev.clientY / innerHeight * 2 - 1; }, { passive: true });
  function tick(force) {
    if (!G) return;
    const dt = Math.min(G.ticker.deltaRatio(60), 3);
    const k = 1 - Math.pow(1 - T.ease, dt);
    cx += (mx - cx) * k; cy += (my - cy) * k;
    const W = innerWidth, H = innerHeight, sy = scrollY, top = wrap.getBoundingClientRect().top + sy;
    const ax = RM ? 0 : W * T.pan, ay = RM ? 0 : H * T.pan;
    for (const it of items) {
      const docY = top + it.y;
      if (!force && (docY + it.h < sy - 400 || docY > sy + H + 400)) continue;
      const par = RM ? 0 : (docY + it.h / 2 - (sy + H / 2)) * (it.d - 1) * T.scrollDepth;
      it.t.style.transform = `translate3d(${(-cx * ax * it.d).toFixed(1)}px,${(-cy * ay * it.d + par).toFixed(1)}px,0)`;
    }
  }
  if (G) G.ticker.add(() => tick());

  /* phones: the tile crossing the middle of the window comes up to full brightness */
  if (!FINE) {
    const nio = new IntersectionObserver(es => es.forEach(en => en.target.classList.toggle('near', en.isIntersecting)), { rootMargin: '-42% 0px -42% 0px' });
    items.forEach(it => nio.observe(it.t));
  }

  /* ---------- opening a project: the field fades out, the project fades in; closing brings the field back ---------- */
  function go(k) {
    if (RM || !G) { openFilm(k); return; }
    G.to(wrap, { autoAlpha: 0, duration: T.fadeOut, ease: 'power1.out', onComplete: () => openFilm(k) });
  }
  field.addEventListener('click', ev => {
    const a = ev.target.closest('.fx-t'); if (!a || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button) return;
    ev.preventDefault(); ev.stopPropagation(); go(a.dataset.fx);
  }, true);
  if (lb) new MutationObserver(() => {
    if (lb.hidden) { if (G) G.to(wrap, { autoAlpha: 1, duration: RM ? 0 : T.fadeIn, ease: 'power1.out' }); else wrap.style.opacity = ''; }
  }).observe(lb, { attributes: true, attributeFilter: ['hidden'] });

  /* ---------- the header: wordmark, breadcrumb (Work · Index), and ⊕ ---------- */
  const slot = $('#slot'), bar = $('.hdr .bar');
  if (slot) slot.insertAdjacentHTML('beforeend', '<span class="x2-bc"><button type="button" data-bc="work" class="on">Work</button><button type="button" data-bc="index" aria-haspopup="dialog">Index</button></span>');
  if (bar) bar.insertAdjacentHTML('beforeend', '<button type="button" class="x2-plus" aria-label="More links" aria-expanded="false" aria-controls="menu"></button>');
  const plus = $('.x2-plus');
  plus && plus.addEventListener('click', () => { const o = hdr.classList.toggle('x2-open'); plus.setAttribute('aria-expanded', String(o)); });
  document.addEventListener('click', ev => {
    const b = ev.target.closest('.x2-bc button'); if (!b) return;
    if (b.dataset.bc === 'work') scrollTo({ top: 0, behavior: RM ? 'auto' : 'smooth' });
    else openIndex(b);
  });
  /* the breadcrumb says where you are: Work over the field, nothing further down */
  const workBtn = () => $('.x2-bc [data-bc="work"]');
  new IntersectionObserver(([en]) => { const w = workBtn(); if (w) w.classList.toggle('on', en.isIntersecting); }, { rootMargin: '-10% 0px -60% 0px' }).observe(field);
  /* while the field is under the header, the header is bare and white */
  new IntersectionObserver(([en]) => hdr.classList.toggle('x2-over', en.isIntersecting), { rootMargin: '0px 0px -92% 0px' }).observe(field);

  /* ---------- Index: every project, or every client, in columns over the dimmed field ---------- */
  const clients = [...new Map(keys.filter(k => k !== 'reel').map(k => [clientOf(k), k])).entries()].filter(([c]) => c && c !== 'Panorama Films').sort((a, b) => a[0].localeCompare(b[0]));
  const ix = document.createElement('div');
  ix.className = 'x2-ix'; ix.setAttribute('role', 'dialog'); ix.setAttribute('aria-modal', 'true'); ix.setAttribute('aria-label', 'Index');
  ix.innerHTML = `<button type="button" class="x2-ix-x">(×) Close</button>
    <div class="x2-ix-in"><div class="x2-tabs" role="tablist"><button type="button" role="tab" aria-selected="true" data-tab="p">Projects</button><button type="button" role="tab" aria-selected="false" data-tab="c">Clients</button></div>
    <ul class="x2-g" data-g="p">${keys.map(k => `<li><a href="${hrefOf(k)}" data-ix="${k}">${e(titleOf(k))}</a></li>`).join('')}</ul>
    <ul class="x2-g" data-g="c" hidden>${clients.map(([c, k]) => `<li><a href="${hrefOf(k)}" data-ix="${k}">${e(c)}</a></li>`).join('')}</ul></div>
    <div class="x2-pv" aria-hidden="true"></div>`;
  document.body.appendChild(ix);
  const pv = $('.x2-pv', ix);
  let back = null, pvK = null;
  const pxTo = G && G.quickTo(pv, 'x', { duration: 0.6, ease: 'power3.out' }), pyTo = G && G.quickTo(pv, 'y', { duration: 0.6, ease: 'power3.out' });
  function openIndex(from) {
    back = from || document.activeElement; ix.classList.add('on'); document.body.style.overflow = 'hidden';
    const b = $('.x2-bc [data-bc="index"]'); b && b.classList.add('on');
    setTimeout(() => { const a = $('.x2-g:not([hidden]) a', ix); a && a.focus({ preventScroll: true }); }, 50);
  }
  function closeIndex() {
    if (!ix.classList.contains('on')) return;
    ix.classList.remove('on'); pv.classList.remove('on'); document.body.style.overflow = '';
    const b = $('.x2-bc [data-bc="index"]'); b && b.classList.remove('on');
    back && back.focus && back.focus({ preventScroll: true });
  }
  $('.x2-ix-x', ix).addEventListener('click', closeIndex);
  addEventListener('keydown', ev => { if (ev.key === 'Escape' && ix.classList.contains('on')) { ev.stopPropagation(); closeIndex(); } }, true);
  $$('.x2-tabs button', ix).forEach(b => b.addEventListener('click', () => {
    $$('.x2-tabs button', ix).forEach(x => x.setAttribute('aria-selected', String(x === b)));
    $$('.x2-g', ix).forEach(g => { g.hidden = g.dataset.g !== b.dataset.tab; });
  }));
  ix.addEventListener('click', ev => {
    const a = ev.target.closest('[data-ix]'); if (!a || ev.metaKey || ev.ctrlKey) return;
    ev.preventDefault(); ev.stopPropagation(); const k = a.dataset.ix; closeIndex(); go(k);
  });
  /* the clip floats by the name under the pointer */
  ix.addEventListener('pointerover', ev => {
    const a = ev.target.closest('[data-ix]'); if (!a || !FINE) return;
    const k = a.dataset.ix; if (k === pvK) return; pvK = k;
    const src = clipOf(k);
    pv.innerHTML = `<img src="${still(k)}" alt="">` + (src && !RM ? `<video src="${src}" muted loop playsinline autoplay></video>` : '');
    pv.classList.add('on');
  });
  ix.addEventListener('pointermove', ev => {
    if (!pv.classList.contains('on')) return;
    const w = pv.offsetWidth, h = pv.offsetHeight;
    const x = Math.min(innerWidth - w - 16, Math.max(16, ev.clientX + 40)), y = Math.min(innerHeight - h - 16, Math.max(16, ev.clientY - h / 2));
    if (pxTo && !RM) { pxTo(x); pyTo(y); } else { pv.style.transform = `translate(${x}px,${y}px)`; }
  });
  ix.addEventListener('pointerout', ev => { if (!ev.relatedTarget || !ev.relatedTarget.closest('[data-ix]')) { pv.classList.remove('on'); pvK = null; } });
})();
