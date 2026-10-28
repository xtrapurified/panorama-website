/* Experimental motion (branch: experimental, 2026-10-29), after the EDDY reference Andrija liked.
 *
 * 1. The opening: on black, the red bullet lights, "Panorama Films" rises letter by letter into
 *    hidden slots, drops out the top and rises again; then the curtain lifts off the showreel while
 *    the heading travels from the middle of the window into its place in the hero. The stand-in
 *    letters sit exactly where the real heading's letters are (measured, kerning included), so the
 *    hand-over to the real, searchable heading is invisible.
 * 2. Scroll reveals: text arrives line by line from behind its own mask, films open from their
 *    bottom edge while the picture inside drifts up a little. One slow-out ease for everything.
 *
 * No opening with reduced motion, ?nointro, a /work/ address or a #link (the head script decides).
 * Timings live in PF_MOTION, so they can be tuned from the console.
 */
(() => {
  const d = document.documentElement;
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const M = (window.PF_MOTION = {
    text: { duration: 1, stagger: 0.075, ease: 'expo.out', group: 0.08 },
    image: { duration: 1.4, ease: 'expo.out', lift: 14, stagger: 0.1 },
    intro: {
      dot: 0.45,            // the bullet blinks alone this long before the letters
      letter: 0.9, letterStagger: 0.05, ease: 'expo.out',
      pause: 0.3,           // between the two rounds
      out: 0.6, outEase: 'expo.in',
      settle: 0.35,         // share of a letter's tween after which it counts as landed
      wait: 0.05,
      reelWait: 1.6,        // the curtain waits at most this long for the showreel to have a frame
      curtain: 1.3, curtainEase: 'expo.inOut',
      reelScale: 1.08,      // the reel settles from this size as the curtain lifts
      filmsDelay: 0.55,     // "Films" rises beside "Panorama" this far into the curtain
      heroDelay: 0.45,      // the hero's other lines start this far into the curtain
      heroDelayPhone: 0.9,  // later on phones, once the heading has passed the line above it
    },
  });

  const finishIntro = () => d.classList.remove('pf-intro');
  if (!window.gsap || !window.SplitText) { finishIntro(); return; }
  gsap.registerPlugin(SplitText);

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- text: lines rise from behind their masks ---------- */
  const splits = new WeakMap();
  function split(el) {
    if (splits.has(el)) return splits.get(el);
    const s = { revealed: false, tween: null, split: null };
    s.split = SplitText.create(el, {
      type: 'lines', mask: 'lines', linesClass: 'pf-line', autoSplit: true, aria: 'auto',
      onSplit(self) { s.tween && s.tween.kill(); gsap.set(self.lines, { yPercent: s.revealed ? 0 : 110 }); },
    });
    splits.set(el, s);
    return s;
  }
  function revealText(el, delay = 0) {
    const s = split(el); s.revealed = true; s.tween && s.tween.kill();
    s.tween = gsap.to(s.split.lines, { yPercent: 0, duration: M.text.duration, stagger: M.text.stagger, ease: M.text.ease, delay });
    return s.tween;
  }

  /* ---------- blocks with live parts (links, buttons, icons): the element itself rises into a mask ---------- */
  const HIDDEN_BLOCK = { yPercent: 100, clipPath: 'inset(-25% -10% 100% -10%)' };
  const prepBlock = el => gsap.set(el, HIDDEN_BLOCK);
  const revealBlock = (el, delay = 0) => gsap.to(el, {
    yPercent: 0, clipPath: 'inset(-25% -10% 0% -10%)', duration: M.text.duration, ease: M.text.ease, delay,
    onComplete: () => gsap.set(el, { clearProps: 'transform,clipPath' }),
  });

  /* ---------- films and pictures: open from the bottom edge, the picture drifting up inside ---------- */
  const inner = el => el.querySelector(':scope > .media') || el.firstElementChild;
  function prepImage(el) {
    gsap.set(el, { clipPath: 'inset(100% 0% 0% 0%)' });
    const i = inner(el); if (i) gsap.set(i, { yPercent: M.image.lift });
  }
  function revealImage(el, delay = 0) {
    const i = inner(el);
    return gsap.timeline({ delay, onComplete: () => { gsap.set(el, { clearProps: 'clipPath' }); if (i) gsap.set(i, { clearProps: 'transform' }); } })
      .to(el, { clipPath: 'inset(0% 0% 0% 0%)', duration: M.image.duration, ease: M.image.ease }, 0)
      .to(i || {}, { yPercent: 0, duration: M.image.duration, ease: M.image.ease }, 0);
  }

  /* ---------- the hero's other lines ---------- */
  function heroParts() {
    const desk = matchMedia('(min-width: 761px)').matches;
    return {
      text: $$('.hero .hd .sub, .hero .hd .locs, .x-side .sub, .x-side .locs').filter(el => el.offsetParent),
      images: $$('.x-reel'),
      blocks: [
        ...(desk ? $$('#menu > a') : [$('#burger')]),
        $('#heroNow'), $('.hero .play-reel'), $('.peekbar .tag'), $('#logo'), $('.hdr-rec'),
      ].filter(el => el && el.offsetParent !== null),
    };
  }
  function revealHero(parts) {
    parts.text.forEach((el, i) => revealText(el, 0.1 + i * M.text.group));
    parts.blocks.forEach((el, i) => revealBlock(el, i * 0.06));
    parts.images.forEach((el, i) => revealImage(el, 0.15 + i * M.image.stagger));
  }

  /* ---------- the opening ---------- */
  function intro() {
    const h1l = $('.hero .h1l'), h1 = h1l && $('h1', h1l), dot = h1l && $('.hdot', h1l), curtain = $('.pf-curtain');
    if (!d.classList.contains('pf-intro') || !h1 || !curtain) { finishIntro(); return; }
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    scrollTo(0, 0);

    const parts = heroParts();
    parts.text.forEach(split);
    parts.blocks.forEach(prepBlock);
    parts.images.forEach(prepImage);

    /* the stand-in letters, each placed where the browser draws it in the real heading */
    const hr = h1.getBoundingClientRect(), cs = getComputedStyle(h1);
    const word = document.createElement('div');
    word.className = 'pf-word'; word.setAttribute('aria-hidden', 'true');
    Object.assign(word.style, {
      left: hr.left + 'px', top: hr.top + 'px', width: hr.width + 'px', height: hr.height + 'px',
      fontFamily: cs.fontFamily, fontSize: cs.fontSize, fontWeight: cs.fontWeight, fontStyle: cs.fontStyle,
      letterSpacing: cs.letterSpacing, fontFeatureSettings: cs.fontFeatureSettings, color: cs.color,
    });
    const chars = [], rest = [];   /* "Panorama" plays the opening; "Films" joins as the curtain lifts (Andrija, 2026-10-29) */
    const lead = $('.h1p', h1) || h1;
    const walk = document.createTreeWalker(h1l, NodeFilter.SHOW_TEXT);   /* the whole line: the ® sits outside the h1 */
    const range = document.createRange();
    for (let n; (n = walk.nextNode());) {
      for (let i = 0; i < n.length; i++) {
        const ch = n.data[i]; if (!ch.trim()) continue;
        range.setStart(n, i); range.setEnd(n, i + 1);
        const r = range.getClientRects()[0]; if (!r) continue;
        const m = document.createElement('span'); m.className = 'pf-m';
        Object.assign(m.style, { left: r.left - hr.left + 'px', top: r.top - hr.top + 'px', width: r.width + 'px', height: r.height + 'px' });
        const c = document.createElement('span'); c.className = 'pf-c'; c.textContent = ch; c.style.lineHeight = r.height + 'px';
        const ps = getComputedStyle(n.parentElement);   /* "Panorama" is a weight heavier than "Films" */
        c.style.fontWeight = ps.fontWeight; c.style.fontStyle = ps.fontStyle; c.style.letterSpacing = ps.letterSpacing; c.style.fontSize = ps.fontSize;
        m.appendChild(c); word.appendChild(m); (lead.contains(n) ? chars : rest).push(c);
      }
    }
    const layers = [word];
    let dotEl = null;
    if (dot) {
      const dr = dot.getBoundingClientRect();
      dotEl = document.createElement('div'); dotEl.className = 'pf-dot'; dotEl.setAttribute('aria-hidden', 'true');
      Object.assign(dotEl.style, { left: dr.left + 'px', top: dr.top + 'px', width: dr.width + 'px', height: dr.height + 'px' });
      layers.push(dotEl);
    }
    document.body.append(...layers);

    /* start with the bullet and "Panorama" in the middle of the window (their own extent, not the heading's column) */
    const box = [lead, dot].filter(Boolean).map(e => e.getBoundingClientRect());
    const gr = { left: Math.min(...box.map(b => b.left)), right: Math.max(...box.map(b => b.right)), top: Math.min(...box.map(b => b.top)), bottom: Math.max(...box.map(b => b.bottom)) };
    gr.width = gr.right - gr.left; gr.height = gr.bottom - gr.top;
    const dx = innerWidth / 2 - (gr.left + gr.width / 2), dy = innerHeight / 2 - (gr.top + gr.height / 2);
    gsap.set(layers, { x: dx, y: dy });
    gsap.set([...chars, ...rest], { yPercent: 115 });
    if (dotEl) gsap.set(dotEl, { autoAlpha: 0 });

    const p = M.intro, media = $('#heroMedia');
    const narrow = matchMedia('(max-width: 760px)').matches;   /* on phones the heading travels down through the lines above it */
    const tl = gsap.timeline({ onComplete: done });
    if (dotEl) tl.set(dotEl, { autoAlpha: 1, onComplete: () => dotEl.classList.add('on') }, 0.15);
    const start = dotEl ? p.dot : 0;
    tl.to(chars, { yPercent: 0, duration: p.letter, ease: p.ease, stagger: p.letterStagger }, start);
    /* round two starts once the last letter has visibly landed, plus a breath */
    tl.addLabel('second', start + (chars.length - 1) * p.letterStagger + p.letter * p.settle + p.pause);
    chars.forEach((c, i) => {
      const t = i * p.letterStagger;
      tl.to(c, { yPercent: -115, duration: p.out, ease: p.outEase }, `second+=${t}`)
        .set(c, { yPercent: 115 }, `second+=${t + p.out}`)
        .to(c, { yPercent: 0, duration: p.letter, ease: p.ease }, `second+=${t + p.out}`);
    });
    const lastIn = (chars.length - 1) * p.letterStagger + p.out;
    tl.addLabel('curtain', `second+=${lastIn + p.letter * p.settle + p.wait}`);

    /* give the showreel a moment to have a picture before the curtain lifts off it */
    tl.add(() => {
      const v = media && media.querySelector('video');
      if (!v || v.readyState >= 2) return;
      tl.pause();
      let go = () => { go = null; v.removeEventListener('loadeddata', on); tl.resume(); };
      const on = () => go && go();
      v.addEventListener('loadeddata', on);
      setTimeout(on, p.reelWait * 1000);
    }, 'curtain');

    tl.to(curtain, { yPercent: -100, duration: p.curtain, ease: p.curtainEase }, 'curtain')
      .to(layers, { x: 0, y: 0, duration: p.curtain, ease: p.curtainEase }, 'curtain')
      .add(() => revealHero(parts), `curtain+=${narrow ? p.heroDelayPhone : p.heroDelay}`)
      .to(rest, { yPercent: 0, duration: p.letter, ease: p.ease, stagger: p.letterStagger }, `curtain+=${p.filmsDelay}`);
    if (media && !parts.images.length) tl.fromTo(media, { scale: p.reelScale }, { scale: 1, duration: p.curtain, ease: p.curtainEase, clearProps: 'transform' }, 'curtain');

    let finished = false;
    function done() {
      if (finished) return; finished = true;
      removeEventListener('resize', bail);
      finishIntro();                       // the real heading shows on this frame…
      layers.forEach(l => l.remove());     // …as its stand-in goes
      curtain.remove();
      startScrollReveals();
    }
    /* a resize mid-opening would move the heading's target: finish at once instead */
    function bail() {
      tl.kill(); gsap.set(curtain, { autoAlpha: 0 });
      parts.text.forEach(el => { const s = split(el); s.revealed = true; gsap.set(s.split.lines, { yPercent: 0 }); });
      parts.blocks.forEach(el => gsap.set(el, { clearProps: 'transform,clipPath' }));
      parts.images.forEach(el => { gsap.set(el, { clearProps: 'clipPath' }); const i = inner(el); if (i) gsap.set(i, { clearProps: 'transform' }); });
      if (media) gsap.set(media, { clearProps: 'transform' });
      done();
    }
    addEventListener('resize', bail);
  }


  /* ---------- Featured strip: endless, drifting, draggable (after the EDDY roster) ----------
     It drifts slowly on its own, stops under the pointer, follows a drag or a sideways swipe and settles on a
     film when let go, then drifts again. Each picture slides inside its frame by its distance from the middle,
     a little more while the strip moves fast. A click that ends a drag never opens a film. */
  M.strip = { speed: 0.12 /* films per second */, rampIn: 0.5, rampOut: 0.5, resume: 0.9, parallax: 5, speedParallax: 2.5, lerp: 0.3 };
  const damp = (a, b, l, dt) => a + (b - a) * (1 - Math.exp(-l * dt));
  function initStrip() {
    const track = $('[data-track]');
    if (!track || !window.Smooothy) return null;
    const Core = window.Smooothy, S = M.strip;
    const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
    class Strip extends Core {
      constructor(el) {
        super(el, { infinite: true, snap: false, lerpFactor: S.lerp, speedDecay: 0.9 });
        this.pEls = [...el.querySelectorAll('[data-p]')];
        this.autoVel = RM ? 0 : S.speed; this.lspeed = 0; this.prev = 0; this.hovered = false; this.interacting = false;
        this.slotLeft = 0; this.wheel = false; this.wheelT = 0; this.resumeCall = null; this.velTween = null;
        this.tick = this.tick.bind(this); gsap.ticker.add(this.tick);
        if (fine) { el.addEventListener('mouseenter', () => { this.hovered = true; this.resumeCall && this.resumeCall.kill(); this.ramp(0, S.rampOut); });
                    el.addEventListener('mouseleave', () => { this.hovered = false; if (!this.isDragging) this.later(this.snap ? S.resume * 0.5 : 0); }); }
        el.addEventListener('wheel', e => { if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return; if (!this.interacting) this.start();
          this.wheel = true; clearTimeout(this.wheelT); this.wheelT = setTimeout(() => { this.wheel = false; }, 160); }, { passive: true });
      }
      onResize = () => { this.slotLeft = parseFloat(getComputedStyle(this.items[0]).left) || 0; };
      onUpdate = ({ parallaxValues, current, deltaTime, viewport }) => {
        if (!parallaxValues) return;
        const dt = Math.max(Math.min(deltaTime, 0.05), 1 / 240);
        this.lspeed = damp(this.lspeed, (current - this.prev) / dt, 3, dt); this.prev = current;
        if (RM) return;
        const centre = (viewport.wrapperWidth - this.slotLeft) / (viewport.itemWidth || 1) / 2 - 0.5;
        const sp = Math.tanh(this.lspeed / 4) * S.speedParallax;
        this.pEls.forEach((el, i) => {
          const pos = gsap.utils.clamp(-7.5, 7.5, -(parallaxValues[i] - centre) * S.parallax);
          el.style.transform = `translate3d(${gsap.utils.clamp(-10, 10, pos + sp)}%,0,0)`;
        });
      };
      tick() {
        const moved = Math.abs(this.target - this.dragStartTarget) > 0.02;
        if (this.isDragging && moved && !this.interacting) this.start();
        else if (!this.isDragging && this.interacting && !this.wheel) this.end();
        this.wrapper.classList.toggle('drag', this.isDragging);
        const dt = Math.min(gsap.ticker.deltaRatio(60) / 60, 0.05);
        if (this.autoVel > 0 && this.isVisible && !this.isDragging) this.target -= this.autoVel * dt;
        this.update();
      }
      ramp(v, d) { this.velTween && this.velTween.kill(); this.velTween = gsap.to(this, { autoVel: v, duration: d, ease: 'sine.inOut' }); }
      play() { if (RM || this.hovered || this.interacting) return; this.snap = false; this.ramp(S.speed, S.rampIn); }
      later(d = S.resume) { this.resumeCall && this.resumeCall.kill(); this.resumeCall = gsap.delayedCall(d, () => this.play()); }
      start() { this.interacting = true; this.resumeCall && this.resumeCall.kill(); this.velTween && this.velTween.kill(); this.autoVel = 0; this.snap = true; }
      end() { this.interacting = false; if (!this.hovered) this.later(); }
    }
    const strip = new Strip(track);
    /* a press that turned into a drag must not open the film under it */
    let downX = 0;
    track.addEventListener('pointerdown', e => { downX = e.clientX; });
    track.addEventListener('click', e => { if (e.detail !== 0 && Math.abs(e.clientX - downX) > 6) { e.preventDefault(); e.stopPropagation(); } }, true);
    track.addEventListener('dragstart', e => e.preventDefault());
    /* keyboard: a film that gets focus is brought into place */
    track.addEventListener('focusin', e => { const sl = e.target.closest('.x-slide'); if (sl && e.target.matches(':focus-visible')) { strip.start(); strip.goToIndex(strip.items.indexOf(sl)); strip.end(); } });
    return strip;
  }

  /* ---------- scroll reveals ---------- */
  const TEXT = [
    '.lede .tag', '.lede h2', '.works .cap .cl', '#cards .meta h3', '#cards .meta .cl',
    '.team .lab', '.team h3', '.team p', '.collab > .tag', '.hl-c .hl-t', '.x-lab', '.x-txt',
  ];
  const BLOCK = ['.end .ask', '.end .links', '#showWrap', '.net-view', '.peers .coll .tag'];
  const IMAGE = ['.works .frame', '#cards .frame', '.team .face', '.x-im'];

  function startScrollReveals() {
    if (RM) return;
    const vh = innerHeight;
    const below = el => el.getBoundingClientRect().top > vh * 0.95;   // nothing already on screen ever hides
    const kind = new Map();
    $$(TEXT.join(',')).filter(below).forEach(el => { split(el); kind.set(el, 'text'); });
    $$(BLOCK.join(',')).filter(below).forEach(el => { prepBlock(el); kind.set(el, 'block'); });
    $$(IMAGE.join(',')).filter(below).forEach(el => { prepImage(el); kind.set(el, 'image'); });
    /* the strip arrives as one group: films open left to right, then their titles */
    const sx = $('.x-strip');
    if (sx && below(sx)) { $$('.x-cm', sx).forEach(el => gsap.set(el, { clipPath: 'inset(100% 0% 0% 0%)' })); $$('.x-ct, .x-cc', sx).forEach(prepBlock); kind.set(sx, 'strip'); }

    /* what enters together arrives together, in reading order, a beat apart */
    let queue = [], raf = 0;
    const flush = () => {
      raf = 0;
      queue.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
      let t = 0, im = 0;
      queue.forEach(el => {
        const k = kind.get(el);
        if (k === 'strip') {
          $$('.x-cm', el).forEach((c, i) => gsap.to(c, { clipPath: 'inset(0% 0% 0% 0%)', duration: M.image.duration, ease: M.image.ease, delay: i * M.image.stagger, onComplete: () => gsap.set(c, { clearProps: 'clipPath' }) }));
          $$('.x-slide', el).forEach((sl, i) => $$('.x-ct, .x-cc', sl).forEach((b, j) => revealBlock(b, 0.35 + i * M.image.stagger + j * 0.06)));
        } else if (k === 'image') revealImage(el, im++ * M.image.stagger);
        else if (k === 'text') revealText(el, t++ * M.text.group);
        else revealBlock(el, t++ * M.text.group);
      });
      queue = [];
    };
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target); queue.push(e.target);
      if (!raf) raf = requestAnimationFrame(flush);
    }), { rootMargin: '0px 0px -8% 0px' });
    kind.forEach((_, el) => io.observe(el));
  }

  /* fonts first: lines can only be found once the real font is in */
  const fontsIn = Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise(r => setTimeout(r, 2500))]);
  fontsIn.then(() => { window.PF_STRIP = initStrip(); d.classList.contains('pf-intro') ? intro() : startScrollReveals(); });
})();
