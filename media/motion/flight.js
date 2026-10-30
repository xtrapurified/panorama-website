/* Experimental (branch: experimental, 2026-10-30): a film flies into its project page, after the EDDY artist overlay.
 *
 * Open:  the strip freezes on the frame on screen; the picture that was clicked is lifted out of the page and
 *        flies into the project's player while the page fades and lifts away and the project's surface rises
 *        from the bottom; then the bar, the titles and the text arrive, and a "Get in touch" button rises in.
 * Close: the same in reverse, landing back on the card (or, if that card is no longer on screen, the surface
 *        simply sinks). Prev / Next inside a project behave as before.
 *
 * It wraps the page's own openFilm / closeFilm, so history, /work/ addresses and the iPhone back swipe are untouched.
 * Off with reduced motion. Timings in PF_MOTION.flight.
 */
(() => {
  if (!window.gsap || typeof window.openFilm !== 'function' || typeof window.closeFilm !== 'function') return;
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const M = (window.PF_MOTION = window.PF_MOTION || {});
  const T = (M.flight = { fly: 1.15, ease: 'expo.inOut', pageLift: 70, pageFade: 0.7, content: 0.7, back: 0.45, controls: 1 });

  const lb = document.getElementById('lb'), page = document.getElementById('top'), hdr = document.getElementById('hdr');
  const boxEl = () => document.getElementById('lb-box');
  const origOpen = window.openFilm, origClose = window.closeFilm;

  /* the "Get in touch" button of every project page, after EDDY's Book: its label rolls on hover */
  const ask = document.createElement('a');
  ask.className = 'x-ask'; ask.href = '#contact'; ask.dataset.mail = 'Film enquiry';
  ask.innerHTML = '<span class="x-roll"><span class="x-r" data-label="Get in touch">Get in touch</span></span>';
  lb.appendChild(ask);

  /* what was clicked: the framed picture inside it, measured on the frame it was clicked */
  let src = null;
  const frameOf = el => {
    const card = el.closest('.x-card, .x-im, .frame, .x-row, .card, .work, .idx, .sp') || el;
    const box = card.querySelector('.x-cm, .media, .th') || (card.matches('.x-im, .frame') ? card : null);
    const img = (box || card).querySelector('img');
    return box && img ? { box, img } : null;
  };
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-play]');
    if (!t || t.closest('#lb') || e.defaultPrevented) return;
    /* from the year list: the tilted still that follows the pointer is the picture that flies */
    const L = window.PF_LIST, l = e.target.closest('.x-row') && L && L.active === t.dataset.play && L.layer(L.active);
    let f = null;
    if (l) {
      const br = l.getBoundingClientRect(), w = l.offsetWidth, h = l.offsetHeight;
      f = { box: l, img: l.querySelector('img'), rot: gsap.getProperty(L.box, 'rotation') || 0,
            rect: { left: br.left + br.width / 2 - w / 2, top: br.top + br.height / 2 - h / 2, width: w, height: h } };
    } else f = frameOf(t);
    src = { k: t.dataset.play, f, at: performance.now() };
  }, true);

  const rect = el => { const r = el.getBoundingClientRect(); return { left: r.left, top: r.top, width: r.width, height: r.height }; };
  const onScreen = r => r.width > 2 && r.height > 2 && r.top < innerHeight && r.top + r.height > 0 && r.left < innerWidth && r.left + r.width > 0;
  function clone(from, imgSrc, box) {
    const c = document.createElement('div');
    c.className = 'x-fly';
    c.innerHTML = `<img alt="" src="${imgSrc}">`;
    /* a clip playing in the card: fly its current frame, not the still under it */
    const v = box && [...box.querySelectorAll('video')].find(x => x.readyState >= 2 && x.videoWidth && getComputedStyle(x).opacity !== '0' && x.offsetParent);
    if (v) { try { const cv = document.createElement('canvas'); cv.width = v.videoWidth; cv.height = v.videoHeight; cv.getContext('2d').drawImage(v, 0, 0); c.appendChild(cv); } catch (_) {} }
    Object.assign(c.style, { left: from.left + 'px', top: from.top + 'px', width: from.width + 'px', height: from.height + 'px' });
    document.body.appendChild(c);
    return c;
  }
  const contentEls = () => [...lb.querySelectorAll('.lb-bar .lb-l, .lb-bar .lb-pn, .lb-bar .lb-x, .lb-now, .lb-foot, #pj, .lb-side')].filter(el => el.offsetParent !== null || el.matches('.lb-side'));

  let busy = false, tl = null;

  window.openFilm = function (k) {
    const fresh = lb.hidden, s = src; src = null;
    const r = origOpen.apply(this, arguments);
    if (!fresh) return r;                               // Prev / Next inside a project: as before
    lb.classList.remove('opening');
    const strip = window.PF_STRIP;
    if (strip && strip.freeze) strip.freeze();
    gsap.set(ask, { yPercent: 0, y: 0, autoAlpha: 1 });
    ask.dataset.mail = 'Film enquiry: ' + (F[k] ? F[k].title : '');
    if (RM) return r;

    const f = s && s.k === k && performance.now() - s.at < 1500 ? s.f : null;
    const from = f && (f.rect || rect(f.box));
    const box = boxEl(), to = box && !lb.classList.contains('photo') ? rect(box) : null;
    tl && tl.kill(); busy = true;
    tl = gsap.timeline({ onComplete: () => { busy = false; } });

    /* the page fades and lifts away; the project's surface rises from the bottom */
    tl.to([page, hdr], { autoAlpha: 0, y: -T.pageLift, duration: T.pageFade, ease: 'power2.inOut' }, 0)
      .fromTo(lb, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: T.fly, ease: T.ease, clearProps: 'clipPath' }, 0);

    /* the picture flies from the card into the player */
    if (from && onScreen(from) && to) {
      const c = clone(from, f.img.currentSrc || f.img.src, f.box);
      f.box.style.visibility = 'hidden';
      gsap.set(box, { visibility: 'hidden' });
      if (f.rot) { gsap.set(c, { rotation: f.rot }); window.PF_LIST.reset(); }
      tl.to(c, { left: to.left, top: to.top, width: to.width, height: to.height, rotation: 0, duration: T.fly, ease: T.ease }, 0)
        .add(() => { gsap.set(box, { clearProps: 'visibility' }); c.remove(); f.box.style.visibility = ''; }, T.fly);
    } else if (box) {
      tl.fromTo(box, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'expo.out', clearProps: 'clipPath' }, T.content * 0.5);
    }

    /* then the bar, titles and text; the button rises in from below the window */
    const els = contentEls();
    gsap.set(els, { autoAlpha: 0, y: 28 });
    gsap.set(ask, { y: innerHeight * 0.25 + 80, autoAlpha: 1 });
    tl.to(els, { autoAlpha: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.05, clearProps: 'opacity,visibility,transform' }, T.content)
      .to(ask, { y: 0, duration: T.controls, ease: 'expo.out' }, T.fly * 0.8)
      .set([page, hdr], { clearProps: 'opacity,visibility,transform' });   /* the page is covered by now: put it back for later */
    return r;
  };

  window.closeFilm = function (fromHistory) {
    const final = fromHistory === true || !(history.state && history.state.pfLb);
    if (!final || RM || lb.hidden || busy) {
      if (final) { const strip = window.PF_STRIP; strip && strip.unfreeze && setTimeout(() => strip.unfreeze(), 0); }
      return origClose.apply(this, arguments);
    }
    const args = arguments, self = this, k = (() => { try { return curK; } catch (_) { return null; } })();   /* the page's own current project */
    busy = true; tl && tl.kill();

    /* where to land: the card for the project now open, if it is on screen under the project */
    const cand = [...document.querySelectorAll(`[data-play="${k}"]`)].filter(el => !el.closest('#lb'));
    let land = null;
    for (const el of cand) { const f = frameOf(el); if (f && onScreen(rect(f.box))) { land = f; break; } }
    const box = boxEl(), from = box && !lb.classList.contains('photo') ? rect(box) : null;

    gsap.set([page, hdr], { autoAlpha: 0, y: -T.pageLift });
    const done = () => {
      gsap.set(lb, { clearProps: 'clipPath' });
      origClose.apply(self, args);
      busy = false;
      const strip = window.PF_STRIP; strip && strip.unfreeze && strip.unfreeze();
    };
    const t = (tl = gsap.timeline({ onComplete: done }));
    t.to([...contentEls(), ask], { autoAlpha: 0, y: 20, duration: T.back, ease: 'expo.in', stagger: 0.02 }, 0);
    const at = T.back * 0.6;
    if (land && from && onScreen(from)) {
      const c = clone(from, land.img.currentSrc || land.img.src, box);
      gsap.set(box, { visibility: 'hidden' }); land.box.style.visibility = 'hidden';
      t.to(c, { left: rect(land.box).left, top: rect(land.box).top, width: rect(land.box).width, height: rect(land.box).height, duration: T.fly, ease: T.ease }, at)
       .add(() => { c.remove(); land.box.style.visibility = ''; gsap.set(box, { clearProps: 'visibility' }); }, at + T.fly);
    }
    t.to(lb, { clipPath: 'inset(100% 0% 0% 0%)', duration: T.fly, ease: T.ease }, at)
     .to([page, hdr], { autoAlpha: 1, y: 0, duration: T.fly, ease: 'expo.out', clearProps: 'opacity,visibility,transform' }, at + T.fly * 0.35);
  };
})();
