/* experimental (the redesign branch, started 2026-10-30): the site as one field of moving tiles, after wanda.net.
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
  const REST = (root.dataset.rest = pref('rest', 'pf-rest', /^(a|b|b1)$/, 'b1'));   /* B2 and C were tried and dropped (Andrija, 2026-10-30) */
  const CREDITS = REST[0] === 'b';   /* b, b1: the studio after the last film */
  const VIRTUAL = FINE && !RM && !!G;
  const PHONE = () => innerWidth <= 760;
  /* phones: a caption under every clip (option B of four tried, Andrija 2026-10-31) */
  root.dataset.ttl = 'under';   /* the wanda.net scrolling, on computers */
  root.classList.toggle('x2-vs', VIRTUAL);

  const T = (window.PF_FIELD = { pan: 0.165, depth: [0.82, 1.16], ease: 0.055, scrollDepth: 0.6, fadeOut: 0.45, fadeIn: 0.7,
    step: [0.92, 1.12], stepPhone: [1.0, 1.08],   /* less overlap again: tiles now mostly stand apart (Andrija, 2026-10-30) */          /* how far down the next tile starts, as a share of its height */
    wheel: 1.2, spring: [3.4, 5.8], springText: [4.6, 6.4] });

  /* ---------- the films ---------- */
  const visible = k => F[k] && !(typeof HIDDEN !== 'undefined' && HIDDEN.includes(k));
  const keys = ['reel', ...ORDER].filter((k, i, a) => visible(k) && a.indexOf(k) === i);
  /* moving pictures for every tile: OWN montages cut for the field (media/field/clips); STREAMED films that could not be
     fetched play silently from Vimeo / YouTube through the page's own thumbnail player (phones keep the loop) */
  const OWN = new Set(['hotf', 'p28', 'p37']);
  const STREAMED = new Set(['p16', 'p21', 'p24', 'p26', 'p36', 'p38']);   /* Thousands of Cameras, World Drone Prix, Shinobi and Fruškać play Andrija's own new clips (main, 2026-10-31) */
  const streams = k => STREAMED.has(k) && typeof mio !== 'undefined' && (F[k].v || F[k].yt);
  const clipOf = k => { const f = F[k]; return OWN.has(k) ? `${M}field/clips/${k}.mp4` : f.clip ? `${M}clips/${f.clip}.${VEXT}` : f.hover ? `${M}hover/${f.hover}.${VEXT}` : null; };
  const clientOf = k => (k === 'reel' ? 'Panorama Films' : F[k].client || '');
  const titleOf = k => { const f = F[k]; return k === 'reel' ? `Showreel${f.dur ? ' ' + f.dur : ''}` : f.title; };
  const hrefOf = k => (k !== 'reel' && typeof workUrl === 'function' && workUrl(k)) || (typeof ext === 'function' ? ext(F[k]) : '#');
  const e = s => (typeof esc === 'function' ? esc(s) : String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]));

  /* ---------- the studio, in few words (everything here is already on the site or confirmed by Andrija) ---------- */
  const STATEMENT = 'Panorama Films is an open circle of creatives telling stories that matter in ways that make you care.';
  /* the statement as the site sets it: the flat Panorama globe inline after the name (media/globe-flat.svg) */
  const SAY = STATEMENT.replace('Panorama Films', 'Panorama Films <svg class="pf-globe" viewBox="7.5 -1.5 690 690" aria-hidden="true" focusable="false"><use href="media/globe-flat.svg#g"/></svg>');
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
  const LOGO_CLIENTS = CLIENTS.slice(0, 24);   /* the logo wall: the selected clients first, 24 in all */
  /* client logos as on the site: the authentic file as a mask, equal visual weight (wide wordmarks shorter, square marks taller) */
  const logoOf = c => { const l = typeof LOGOS !== 'undefined' && LOGOS[c]; if (!l) return null; const k = (typeof LOGO_SCALE !== 'undefined' && LOGO_SCALE[c]) || 1, h = Math.min(1, 1.3 / Math.sqrt(l[1])) * k; return { src: new URL(`${M}logos/${l[0]}.png`, document.baseURI).href, w: h * l[1], h }; };   /* absolute: inside a CSS variable a relative url would resolve against the stylesheet's folder */
  const logoTag = c => { const L = logoOf(c), f = typeof CLIENT_FILM !== 'undefined' && CLIENT_FILM[c] && F[CLIENT_FILM[c]] && !(typeof HIDDEN !== 'undefined' && HIDDEN.includes(CLIENT_FILM[c])) ? CLIENT_FILM[c] : null;
    const tag = f ? 'a' : 'span', attrs = f ? ` href="${hrefOf(f)}" data-x2film="${f}"` : ' role="img"';
    return L ? `<${tag} class="x2-lg${f ? ' ln' : ''}"${attrs} aria-label="${e(c)}" title="${e(c)}" style="--w:${L.w.toFixed(3)};--h:${L.h.toFixed(3)};--src:url(${L.src})"></${tag}>`
             : `<${tag} class="x2-lg lt${f ? ' ln' : ''}"${attrs}>${e(c)}</${tag}>`; };
  const filmOfClient = c => (typeof CLIENT_FILM !== 'undefined' && CLIENT_FILM[c] && visible(CLIENT_FILM[c])) ? CLIENT_FILM[c] : null;
  const PLACES = '<span lang="sr-Cyrl">Београд</span> <bdi lang="ar">دبي</bdi> Worldwide';
  const MAIL = 'Film enquiry';
  const LINKS = `<a href="#contact" data-mail="${MAIL}">Email</a><a href="https://www.instagram.com/panoramafilms.tv/" target="_blank" rel="noopener">Instagram</a>`;   /* Vimeo left out (Andrija, 2026-10-31) */

  /* ---------- Human in the loop, discreet (Andrija, 2026-10-30): no photos by default. One code line and a strip of thin ticks,
     one per behind-the-scenes photo; pointing along the strip (or dragging on a phone, or the arrow keys) shows that frame
     beside the pointer and counts it, frame 23 / 106. Photos load only when asked for. ---------- */
  /* Field notes takes the place of "(filming in progress)" in the code line; the label above says Filming in progress (Andrija, 2026-10-31) */
  const hitlHTML = () => `<p class="x2-ln x2-fnl"><span class="x2-fnw"><span class="x2-rd" aria-hidden="true"></span>Field notes</span> <span class="k">{</span> <span class="v">human</span><span class="k">.in(</span><span class="v">loop</span><span class="k">) }</span></p>
    <div class="x2-strip" tabindex="0" role="slider" aria-label="Behind the scenes photos: point along the strip to see them" aria-valuemin="1" aria-valuemax="1" aria-valuenow="1"></div>
    <p class="x2-ln x2-hlc"><span class="k">frame</span> <span class="v x2-hn">00 / 00</span> <span class="k">· loop =</span> <span class="v">true</span><span class="x2-hframe" aria-hidden="true"></span></p>`;
  let bts = [];
  function initHitl(root) {
    const strip = $('.x2-strip', root); if (!strip) return;
    const num = $('.x2-hn', root), inl = $('.x2-hframe', root);
    fetch('media/bts/photos.json').then(r => r.json()).then(d => {
      bts = (d.photos || []).filter(p => !p.hidden);
      strip.innerHTML = bts.map(() => '<i></i>').join('');
      strip.setAttribute('aria-valuemax', bts.length);
      num.textContent = `01 / ${String(bts.length).padStart(2, '0')}`;
      if (!FINE) phoneStrip();
      measure();
    }).catch(() => {});
    let cur = -1;
    /* phones (Andrija, 2026-10-31, 15:34): no drifting filmstrip; a slideshow in one fixed frame, as on the main site's
       Human in the loop: every photo whole inside the frame, a 0.1 s fade, a new photo every 0.3 s while the frame is on screen.
       A finger on the frame holds the photo; a tap on the ticks jumps there. Only the next few photos are loaded ahead */
    function phoneStrip() {
      const fs = document.createElement('div'); fs.className = 'x2-slide'; fs.setAttribute('role', 'img'); fs.setAttribute('aria-label', 'Behind the scenes photos');
      const tall = Math.max(...bts.map(p => p.h / p.w)) || 1.5;
      fs.style.setProperty('--hr', Math.min(tall, 1.5).toFixed(4));
      strip.before(fs); strip.removeAttribute('tabindex'); strip.setAttribute('aria-hidden', 'true');
      const ticks = $$('i', strip), imgs = [], ok = [];
      const load = i => { if (imgs[i]) return; const im = new Image(); im.alt = ''; im.decoding = 'async'; im.src = `media/bts/${bts[i].f}`; fs.appendChild(im); imgs[i] = im;
        (im.decode ? im.decode() : new Promise(r => { im.onload = r; })).then(() => { ok[i] = true; }).catch(() => {}); };
      let on = -1, vis = false, hold = false, t0 = 0;
      const go = i => { i = (i + bts.length) % bts.length; load(i); for (let k = 1; k <= 4; k++) load((i + k) % bts.length);
        if (on >= 0) { imgs[on].classList.remove('on'); ticks[on].classList.remove('on'); }
        on = i; imgs[i].classList.add('on'); ticks[i].classList.add('on');
        num.textContent = `${String(i + 1).padStart(2, '0')} / ${String(bts.length).padStart(2, '0')}`; };
      go(0);
      new IntersectionObserver(es => { vis = es[0].isIntersecting; }).observe(fs);
      const step = t => { if (vis && !RM && !hold && t - t0 >= 300) { const n = (on + 1) % bts.length; if (ok[n]) { go(n); t0 = t; } else load(n); }
        requestAnimationFrame(step); };
      requestAnimationFrame(step);
      fs.addEventListener('touchstart', () => { hold = true; }, { passive: true });
      const up = () => { hold = false; t0 = performance.now() + 400; };
      fs.addEventListener('touchend', up, { passive: true }); fs.addEventListener('touchcancel', up, { passive: true });
      fs.addEventListener('contextmenu', ev => ev.preventDefault());
      strip.addEventListener('click', ev => { go(Math.max(0, Math.min(bts.length - 1, at(ev.clientX)))); t0 = performance.now() + 1200; });
    }
    const show = (i, near) => {
      if (!bts.length) return;
      i = Math.max(0, Math.min(bts.length - 1, i)); if (i === cur && pv.classList.contains('on')) return; cur = i;
      $$('i', strip).forEach((t, j) => t.classList.toggle('on', j === i));
      num.textContent = `${String(i + 1).padStart(2, '0')} / ${String(bts.length).padStart(2, '0')}`;
      strip.setAttribute('aria-valuenow', i + 1);
      const src = `media/bts/${bts[i].f}`, ar = (bts[i].w / bts[i].h) || 1.5;
      /* the whole photo, never cropped: its own shape, about a third of the window wide, never taller than 70 % of it */
      const w = Math.min(innerWidth * (FINE ? 0.32 : 0.86), innerHeight * (FINE ? 0.7 : 0.5) * ar, FINE ? 560 : 440);
      if (FINE) { pvK = 'bts' + i; pv.className = 'x2-pv on x2-pv-b'; pv.style.width = w + 'px'; pv.style.aspectRatio = String(ar); pv.innerHTML = `<img src="${src}" alt="">`; if (near) { const r = strip.getBoundingClientRect(); px = r.left + r.width * (i + 0.5) / bts.length; py = r.top - 120; } placePv(true); }
      else { inl.style.width = w + 'px'; inl.style.aspectRatio = String(ar); inl.innerHTML = `<img src="${src}" alt="">`; inl.classList.add('on'); }
    };
    const at = x => { const r = strip.getBoundingClientRect(); return Math.floor((x - r.left) / r.width * bts.length); };
    if (!FINE) return;   /* phones: the filmstrip above, nothing to scrub */
    strip.addEventListener('pointermove', ev => { if (ev.pointerType === 'mouse' || ev.buttons) show(at(ev.clientX)); });
    strip.addEventListener('pointerdown', ev => { if (ev.pointerType !== 'mouse') { strip.setPointerCapture(ev.pointerId); show(at(ev.clientX)); } });
    const off = () => { hidePv(); inl.classList.remove('on'); $$('i.on', strip).forEach(t => t.classList.remove('on')); cur = -1; };
    strip.addEventListener('pointerleave', ev => { if (ev.pointerType === 'mouse') off(); });
    strip.addEventListener('pointerup', ev => { if (ev.pointerType !== 'mouse') off(); });
    strip.addEventListener('keydown', ev => { const d = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[ev.key]; if (!d) return; ev.preventDefault(); ev.stopPropagation(); show((cur < 0 ? 0 : cur + d), true); });
    strip.addEventListener('blur', off);
  }

  /* ---------- the client logos as the site's own horizontal strip (with its throw physics), moved in from the hidden About section ---------- */
  function moveStrip(slot, scope) {
    const c = document.querySelector('.collab'); if (!c || !slot) return;
    slot.appendChild(c); scope.classList.add('has-strip');
    dispatchEvent(new Event('resize'));
    /* the strip measured itself while hidden (no width), which left its drift stuck; one scroll of its own resets it, and it
       drifts again a moment later, draggable and throwable as on the site (Andrija, 2026-10-31) */
    const mq = $('.marq', c); if (mq) requestAnimationFrame(() => { mq.scrollLeft = 2; mq.dispatchEvent(new Event('scroll')); });
  }

  /* ---------- the easter egg at the bottom: the old site's Golden hour fold (a live map of where the golden hour is now) ---------- */
  function addEgg(root, wrapTag) {
    const g = document.getElementById('golden'); if (!g || !root) return;
    const box = document.createElement(wrapTag || 'div'); box.className = 'x2-egg lab'; box.setAttribute('data-x2b', '');
    /* its way in is the footer's small red ping with the live line "golden hour now…" (the footer itself is hidden here) */
    const btn = document.getElementById('ftGh'); if (btn) box.appendChild(btn);
    box.appendChild(g); root.appendChild(box);
    /* and under it the site's footer: ©, Dark / Light, Index, Back to top (Andrija, 2026-10-31) */
    const ft = document.querySelector('main footer'); if (ft) { const fb = document.createElement('div'); fb.className = 'x2-foot'; fb.setAttribute('data-x2b', ''); fb.appendChild(ft); root.appendChild(fb); }
    const fold = document.getElementById('ghFold');
    if (fold && VIRTUAL) fold.addEventListener('toggle', () => { if (!fold.open) return; setTimeout(() => { measure(); const l = lines.find(x => x.el === box); if (l) scrollToY(l.y - 90); }, 80); });
  }

  /* ---------- b1: the credits in columns, in the old site's type: Data Error codes, code lines, Rec ---------- */
  function buildCredits() {
    const sec = document.createElement('section');
    sec.className = 'x2-rest x2-cr2 x2-b1'; sec.setAttribute('aria-label', 'Studio');
    const code = (n, w) => `<span class="x2-code">PF-${w.slice(0, 2).toUpperCase()}/${String(n).padStart(3, '0')} ${e(w.toUpperCase())}</span>`;
    const rec = '<span class="x2-rec"><span class="x2-rd" aria-hidden="true"></span>Rec <span class="x2-tc">00:00:00:00</span></span>';
    const grp = (n, w, body, extra = '') => `<div class="cr2-g${/data-wide/.test(extra) ? ' cr2-wide' : ''}" data-x2b${extra.replace(' data-wide', '')}><div class="cr2-l">${code(n, w)}</div><div class="cr2-b">${body}</div></div>`;
    sec.innerHTML =
      grp(1, 'Studio', `<p class="cr2-say">${SAY}</p><p class="cr2-say cr2-pl">${PLACES}</p><p class="cr2-meta">${rec}</p>`) +
      /* one list for everyone (Andrija, 2026-10-31: no separate Core block above it): the site's own List / Graph, moved here from the
         hidden About section; the plain columns stay if it is missing */
      grp(2, 'Collective', `<div class="cr2-peers"></div><ul class="cr2-cols c3 cr2-coll">${PEOPLE.map(([id, n, r]) => `<li data-pp="${id}"><span class="cr2-n">${e(n)}</span><span class="cr2-r">${e(r)}</span></li>`).join('')}</ul>`) +
      grp(3, 'We make', `<ol class="cr2-make">${WE_MAKE.map((w, i) => `<li><span class="cr2-no">${String(i + 1).padStart(2, '0')}</span>${e(w)}</li>`).join('')}</ol>`) +
      grp(4, 'Filming in progress', hitlHTML()) +
      grp(5, 'Made for', `<div class="x2-collab"></div><div class="x2-logos x2-logos-fb">${LOGO_CLIENTS.map(logoTag).join('')}</div>`, ' data-wide') +
      grp(6, 'Contact', `<p class="x2-ln cr2-cmd"><span class="k">$</span> <span class="v">panorama --contact</span></p>
        <p class="cr2-ask"><a href="#contact" data-mail="${MAIL}">Let’s make a film together.</a></p><p class="cr2-links">${LINKS}</p>`, ' data-x2sec="contact"');
    field.appendChild(sec);
    const peers = document.getElementById('peers'), slot = $('.cr2-peers', sec);
    if (peers && slot) { slot.appendChild(peers); sec.classList.add('has-peers'); }
    /* a collaborator's profile is only the photo, the name and their Instagram; the three at the core keep theirs (Andrija, 2026-10-31) */
    const dr = document.getElementById('netDr');
    if (dr) new MutationObserver(() => { const b = $('#netNames [data-p].on'), li = b && b.closest('li'); dr.classList.toggle('x2-crew', !(li && li.classList.contains('core'))); }).observe(dr, { childList: true });
    moveStrip($('.x2-collab', sec), sec);
    addEgg(sec);
    return sec;
  }

  /* ---------- tiles ---------- */
  const filmTile = k => `<div class="fx-i" data-k="${k}" data-g="work"><a class="fx-t" href="${hrefOf(k)}" data-fx="${k}" draggable="false" aria-label="${e(titleOf(k))}, ${e(clientOf(k))}">
    <span class="fx-m${streams(k) ? ' media cover' : ''}"${streams(k) ? ` data-c="${k}"${F[k].hover ? ` data-hv="${F[k].hover}"` : ''}` : ''}><img src="${still(k)}" alt="" loading="lazy" decoding="async" draggable="false"></span>
    <p class="fx-lab" aria-hidden="true"><span class="fx-c">${e(clientOf(k))}</span><span class="fx-ti">${e(titleOf(k))}</span></p></a></div>`;
  wrap.innerHTML = keys.map(filmTile).join('');

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
    items = films;
    items.forEach(it => wrap.appendChild(it.el));
  }
  function layout() {
    const R = rng(seed), r = (a, b) => a + (b - a) * R(), pick = a => a[Math.floor(R() * a.length)];
    const W = wrap.clientWidth, phone = W <= 760, u = W / 24;
    let y = phone ? 0 : Math.max(230, innerHeight * 0.27), bottom = 0, lastX = null, group = null;   /* the first films start below the large globe */
    items.forEach(it => {
      if (group && it.g !== group) y = bottom + (phone ? 120 : innerHeight * 0.32);   /* a breath between Work and Studio */
      group = it.g;
      /* wide and scope crops, as on wanda.net (Andrija, 2026-10-30) */
      let ar = pick(phone ? [16 / 9, 16 / 9, 16 / 9, 3 / 2, 4 / 3, 2, 1.85, 2.39] : [16 / 9, 16 / 9, 16 / 9, 2.39, 2.39, 2.39, 2, 1.85, 3 / 2, 4 / 3]), colsR = [8, 16];
      let w, x;
      if (phone) {
        /* phones (Andrija, 2026-10-31): one column of 4:5 clips, centred, cropped from the middle, 10–20 % wider than the screen
           so they run past both edges */
        ar = 4 / 5; w = W * r(1.1, 1.2); x = (W - w) / 2;   /* the first, the showreel, starts at the very top, under the header */
      } else {
        const cols = Math.round(r(colsR[0], colsR[1]));
        w = cols * u;
        let c = Math.round(r(-1, 24 - cols + 1));
        if (lastX !== null && Math.abs(c - lastX) < 3) c = c + (c < 12 - cols / 2 ? 6 : -6);
        c = Math.min(24 - cols + 1, Math.max(-1, c)); lastX = c;
        x = c * u;
      }
      const h = w / ar;
      Object.assign(it, { x, y, w, h, d: r(T.depth[0], T.depth[1]), kk: r(T.spring[0], T.spring[1]) });
      Object.assign(it.el.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' });
      /* the title sits in the middle of the part of the tile that is on screen (phones: tiles run past the edges) */
      const vl = Math.max(x, 0), vr = Math.min(x + w, W);
      it.el.style.setProperty('--lx', ((vl + vr) / 2 - x).toFixed(1) + 'px'); it.el.style.setProperty('--lw', Math.max(120, vr - vl - 24).toFixed(0) + 'px');
      it.el.style.setProperty('--cl', Math.max(0, 16 - x).toFixed(1) + 'px');   /* a caption under the tile starts at the page margin */
      bottom = Math.max(bottom, y + h);
      y += phone ? h + 16 : h * r(...T.step);
    });
    wrap.style.height = Math.ceil(bottom + (phone ? 80 : 160)) + 'px';
  }
  shuffle(); layout();

  /* ---------- b: the end credits after the last film ---------- */
  let rest = null;
  if (REST === 'b1') rest = buildCredits();
  if (REST === 'b') {
    const row = (role, name, attrs = '') => `<div class="cr-r" data-x2b${attrs}><span class="cr-role">${e(role)}</span><span class="cr-n">${e(name)}</span></div>`;
    const head = t => `<h2 class="cr-h" data-x2b>${e(t)}</h2>`;
    const pairs = a => { const o = []; for (let i = 0; i < a.length; i += 2) o.push(a.slice(i, i + 2)); return o; };
    rest = document.createElement('section');
    rest.className = 'x2-rest x2-cr'; rest.setAttribute('aria-label', 'Studio'); rest.dataset.x2sec = 'studio';
    rest.innerHTML = `<p class="cr-mark" data-x2b><span class="cr-dot" aria-hidden="true"></span>Panorama Films<sup>®</sup></p>
      <p class="cr-say" data-x2b>${SAY}</p>
      ${CORE.map(([id, n, r]) => row(r, n, ` data-pp="${id}"`)).join('')}
      ${head('The Collective')}
      ${COLLECTIVE.map(([id, n, r]) => row(r, n, ` data-pp="${id}"`)).join('')}
      ${head('We make')}
      ${WE_MAKE.map(w => `<p class="cr-c" data-x2b>${e(w)}</p>`).join('')}
      ${head('Filming in progress')}
      <div class="cr-hitl" data-x2b>${hitlHTML()}</div>
      ${head('Made for')}
      <div class="cr-strip" data-x2b><div class="x2-collab"></div><div class="x2-logos cr-logos x2-logos-fb">${LOGO_CLIENTS.map(logoTag).join('')}</div></div>
      <p class="cr-pl" data-x2b>${PLACES}</p>
      <div class="cr-end" data-x2b data-x2sec="contact"><p class="cr-ask"><a href="#contact" data-mail="${MAIL}">Let’s make a film together.</a></p><p class="cr-links">${LINKS}</p></div>`;
    field.appendChild(rest);
    moveStrip($('.x2-collab', rest), rest);
    addEgg(rest);
  }

  /* a thin red bar along the top shows how far down the page you are (b, b1; Andrija, 2026-10-30) */
  const bar2 = CREDITS ? document.body.appendChild(Object.assign(document.createElement('div'), { className: 'x2-prog' })) : null;
  if (bar2) bar2.setAttribute('aria-hidden', 'true');
  function progTick() {
    if (!bar2) return;
    let p;
    if (VIRTUAL) { const m = maxY(), c = items.length ? items[0].cur : target; p = m ? Math.min(1, Math.max(0, (lines.length ? lines[lines.length - 1].cur : c) / m)) : 0; }
    else { const m = document.documentElement.scrollHeight - innerHeight; p = m > 0 ? scrollY / m : 0; }
    bar2.style.transform = `scaleX(${p.toFixed(4)})`;
    bar2.style.opacity = overlayOpen() ? '0' : '';
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
    /* nothing but the springs may move the field: a scrollIntoView elsewhere (the Golden hour button) would scroll the fixed window itself */
    field.addEventListener('scroll', () => { if (field.scrollTop || field.scrollLeft) field.scrollTop = field.scrollLeft = 0; });
    addEventListener('wheel', ev => {
      if (blocked(ev.target) || overlayOpen()) return;
      if (ev.target.closest && ev.target.closest('.marq') && Math.abs(ev.deltaX) > Math.abs(ev.deltaY)) return;   /* a sideways swipe scrolls the client strip */
      ev.preventDefault();
      if (pvK && pvK.startsWith('bts')) hidePv();   /* a photo shown from the strip goes when the page moves */
      const d = ev.deltaMode === 1 ? ev.deltaY * 16 : ev.deltaMode === 2 ? ev.deltaY * innerHeight : ev.deltaY;
      target = clampY(target + d * T.wheel);
    }, { passive: false });
    addEventListener('keydown', ev => {
      if (overlayOpen() || ev.defaultPrevented || /input|textarea|select/i.test((ev.target.tagName || '')) || ev.metaKey || ev.ctrlKey || ev.altKey) return;
      if (ev.key === ' ' && ev.target.closest && ev.target.closest('button, a, [role="slider"], summary')) return;   /* Space presses a focused button */
      const H = innerHeight, map = { ArrowDown: 100, ArrowUp: -100, PageDown: H * 0.85, PageUp: -H * 0.85, ' ': ev.shiftKey ? -H * 0.85 : H * 0.85 };
      if (ev.key in map) { ev.preventDefault(); target = clampY(target + map[ev.key]); }
      else if (ev.key === 'Home') { ev.preventDefault(); target = 0; }
      else if (ev.key === 'End') { ev.preventDefault(); target = maxY(); }
    });
    /* tabbing to something below the window brings it into view */
    /* only for keyboard focus, and only by as much as the focused thing is out of view: a click in the Collective (which moves
       focus into the profile) used to throw the page to the top of the block (Andrija, 2026-10-31: graph glitches) */
    field.addEventListener('focusin', ev => {
      const el = ev.target; if (!el.matches || !el.matches(':focus-visible')) return;
      const r = el.getBoundingClientRect();
      if (r.top < 90) target = clampY(target + r.top - 120);
      else if (r.bottom > innerHeight - 60) target = clampY(target + r.bottom - innerHeight + 120);
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
    breadcrumb(); recTick(); progTick();
  }

  addEventListener('pageshow', ev => { if (ev.persisted && !qs.get('seed')) { seed = Math.floor(Math.random() * 1e9); shuffle(); layout(); measure(); tick(true); } });
  /* only a change of width lays the field out again: on phones the address bar showing and hiding changes the height all the time,
     and re-laying out then made the page jump (Andrija, 2026-10-31) */
  let rw = 0, lastW = innerWidth; addEventListener('resize', () => { if (!FINE && innerWidth === lastW) return; lastW = innerWidth; clearTimeout(rw); rw = setTimeout(() => { layout(); measure(); target = clampY(target); tick(true); }, 120); });
  if (document.fonts) document.fonts.ready.then(() => { measure(); tick(true); });
  if (rest && window.ResizeObserver) { let mq = 0; new ResizeObserver(() => { cancelAnimationFrame(mq); mq = requestAnimationFrame(() => { measure(); target = clampY(target); }); }).observe(rest); }

  /* phones: the tile crossing the middle of the window comes up to full brightness */
  /* and shows its client and title: one tile at a time, the one nearest the middle (Andrija, 2026-10-31) */
  if (!FINE && root.dataset.ttl === 'mid') {
    let nearIt = null, nq = 0;
    const pickNear = () => { nq = 0;
      const mid = innerHeight * 0.5; let best = null, bd = Infinity;
      for (const it of items) { const r = it.t.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) continue;
        const d = r.top <= mid && r.bottom >= mid ? 0 : Math.min(Math.abs(r.top - mid), Math.abs(r.bottom - mid)); if (d < bd) { bd = d; best = it; } }
      if (bd > innerHeight * 0.22) best = null;
      if (best !== nearIt) { if (nearIt) nearIt.t.classList.remove('near'); nearIt = best; if (best) best.t.classList.add('near'); } };
    addEventListener('scroll', () => { if (!nq) nq = requestAnimationFrame(pickNear); }, { passive: true });
    setTimeout(pickNear, 300);
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
  /* the site's own nav on the right (Work · About · Contact), with Index added after Work */
  const menu = $('#menu'), workA = menu && $('a[href="#field"]', menu);
  if (workA) workA.insertAdjacentHTML('afterend', '<a href="#index" data-nav="index" class="x2-ixl">Index</a>');
  /* where a section starts, in the field's own coordinates */
  const secY = id => (id === 'work' ? 0 : SEC[id] == null ? null : SEC[id]);
  function goSection(id, from) {
    if (id === 'index') return openIndex(from);
    if (REST === 'a' && (id === 'studio' || id === 'contact')) return openPanel(id, from);
    closePanels(); closeIndex(true);
    const y = secY(id); if (y != null) scrollToY(y);
  }
  document.addEventListener('click', ev => {
    /* the menu's links (and the phone menu) lead to the new places */
    const a = ev.target.closest('a[href="#field"], a.x2-ixl, a[data-index], a[href="#studio"], a[href="#contact"]:not([data-mail]), a[href="#top"], a[href="#hero"]');
    if (!a || a.closest('#lb')) return;
    ev.preventDefault(); ev.stopPropagation();
    const h = a.hasAttribute('data-index') ? 'index' : a.getAttribute('href').slice(1), id = h === 'index' ? 'index' : h === 'studio' ? 'studio' : h === 'contact' ? 'contact' : 'work';
    if (hdr.classList.contains('navopen')) { const bu = $('#burger'); bu && bu.click(); }
    goSection(id, a);
  }, true);
  let bcN = 0;
  function breadcrumb() {
    /* the globe at the top, the wordmark once the field has moved (as on the site, where it happens when the reel's heading reaches the globe) */
    const c = PHONE() || (VIRTUAL ? target : scrollY) > innerHeight * 0.32;   /* phones: the wordmark only, no globe (Andrija, 2026-10-31) */   /* a little later than at first (Andrija, 2026-10-31) */
    if (hdr.classList.contains('compact') !== c) hdr.classList.toggle('compact', c);   /* the page's own scroll handler would set it from the hidden hero */
    if (++bcN % 6) return;
    const y = scrollY2() + innerHeight * 0.4;
    const sY = secY('studio'), inStudio = REST !== 'a' && sY != null && sY > 0 && y >= sY + 80;
    const panel = $('.x2-pnl.on'), ixOn = $('.x2-ix.on');
    const cY = secY('contact'), inContact = REST !== 'a' && cY != null && y >= cY + innerHeight * 0.2;
    const here = ixOn ? 'index' : panel ? panel.dataset.p : inContact ? 'contact' : inStudio ? 'studio' : 'work';
    const ids = { field: 'work', index: 'index', studio: 'studio', contact: 'contact' };
    if (menu) $$('a', menu).forEach(a => { const id = ids[(a.getAttribute('href') || '').slice(1)]; if (id) a.classList.toggle('on', id === here); });
    /* bare over the films (as on wanda.net); over the credits the header keeps its shade so text never runs under it */
    hdr.classList.toggle('x2-over', !(CREDITS && inStudio) && (VIRTUAL || wrap.getBoundingClientRect().bottom > 90));
  }

  /* ---------- the floating picture: a clip by a film's name, a portrait by a person's name ---------- */
  const pv = document.createElement('div'); pv.className = 'x2-pv'; pv.setAttribute('aria-hidden', 'true'); document.body.appendChild(pv);
  let pvK = null;
  if (!VIRTUAL) addEventListener('scroll', () => { if (pvK && pvK.startsWith('bts')) hidePv(); }, { passive: true });
  const pxTo = G && G.quickTo(pv, 'x', { duration: 0.6, ease: 'power3.out' }), pyTo = G && G.quickTo(pv, 'y', { duration: 0.6, ease: 'power3.out' });
  const person = id => PEOPLE.find(p => p[0] === id);
  function showPv(kind, id) {
    if (!FINE || pvK === kind + id) return; pvK = kind + id;
    if (kind === 'film') { const src = clipOf(id); pv.className = 'x2-pv on'; pv.innerHTML = `<img src="${still(id)}" alt="">` + (src && !RM ? `<video src="${src}" muted loop playsinline autoplay></video>` : ''); }
    else { const p = person(id); if (!p) return; pv.className = 'x2-pv on x2-pv-p'; pv.innerHTML = `<img src="${p[3]}" alt="">`; }
    placePv(true);   /* appear by the pointer, not in the corner */
  }
  const hidePv = () => { pv.classList.remove('on'); pvK = null; pv.style.width = pv.style.aspectRatio = ''; };
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
    mk('studio', 'Studio', `<p class="pn-say">${SAY}</p>
      <div class="pn-core">${CORE.map(([id, n, r, src]) => `<figure class="pn-pt"><img src="${src}" alt="${e(n)}" loading="lazy"><figcaption><span class="fx-c">${e(r)}</span><span class="fx-ti">${e(n)}</span></figcaption></figure>`).join('')}</div>
      <div class="pn-cols">
        <div><p class="pn-k">The Collective</p><ul class="pn-l">${COLLECTIVE.map(([id, n, r]) => `<li data-pp="${id}"><span>${e(n)}</span> <span class="pn-r">${e(r)}</span></li>`).join('')}</ul></div>
        <div><p class="pn-k">We make</p><ul class="pn-l">${WE_MAKE.map(w => `<li>${e(w)}</li>`).join('')}</ul></div>
        <div></div>
      </div><div class="pn-strip"><p class="pn-k">Made for</p><div class="x2-collab"></div><div class="x2-logos pn-logos x2-logos-fb">${LOGO_CLIENTS.map(logoTag).join('')}</div></div>`);
    moveStrip($('.x2-collab', panels.studio), panels.studio);
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
  sw.innerHTML = '<span>Rest of site</span>' + [['a', 'A Panels'], ['b', 'B Credits'], ['b1', 'B1 Columns']].map(([v, t]) => `<a href="?rest=${v}"${v === REST ? ' aria-current="true"' : ''}>${t}</a>`).join('');
  document.body.appendChild(sw);
  window.PF_X2 = { get target() { return target; }, scrollToY, items: () => items, REST, VIRTUAL };
  if (rest) initHitl(rest);
  /* A: the easter egg sits at the foot of the Contact panel */
  if (REST === 'a' && panels.contact) addEgg($('.x2-ix-in', panels.contact));
  /* start moving only now that everything above exists */
  tick(true);
  if (G) G.ticker.add(() => tick());
})();
