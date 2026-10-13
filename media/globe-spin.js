/* Panorama Films · LE-009 Vector spin
   <panorama-globe-spin mode="hover"></panorama-globe-spin>

   A vector globe (the flat mark redrawn as a sphere: outline, equator, two bowed parallels,
   meridians every 36°) with three motion modes:
     hover — still; on hover a 0.1 s spin, then a slow ease-out that lands on the starting pose
     turn  — continuous turn; drag left/right to turn by hand, on release it glides back into its own turn
     slow  — drifts at 0.3× the turn speed; on hover a 0.7 s spin burst, then eases back to the drift
   Every mode carries a subtle chromatic aberration (red/green/blue split) while hovered.

   Attributes: mode (hover | turn | slow, default hover), split (aberration strength 0–3, default 1),
   speed (multiplier, default 1), demo (triggers the hover behaviour on its own every 4 s, for previews).
   White on a dark background: the three colour channels add up to white when aligned.
   Respects reduced motion; stops drawing offscreen and in a hidden tab. No dependencies. */
(() => {
  if (customElements.get('panorama-globe-spin')) return;

  const R = 40, SW = 3.68, SPACING = 36, AB_MAX = 0.9, TURN = 40, SLOW = 0.3;
  const NS = 'http://www.w3.org/2000/svg';
  const el = (t, a) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); return e; };
  const easeInOut = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  let uid = 0;

  class PanoramaGlobeSpin extends HTMLElement {
    static get observedAttributes() { return ['mode', 'split', 'speed', 'weight']; }

    constructor() {
      super();
      const root = this.attachShadow({ mode: 'open' });
      const style = document.createElement('style');
      style.textContent = ':host{display:inline-block;aspect-ratio:1;line-height:0;-webkit-user-select:none;user-select:none}' +
        'svg{width:100%;height:100%;overflow:visible;isolation:isolate;touch-action:pan-y}use{mix-blend-mode:screen}' +
        ':host([mode="turn"]) svg{cursor:grab}:host([data-dragging]) svg{cursor:grabbing}';
      const svg = el('svg', { viewBox: '-50 -50 100 100', role: 'img', 'aria-label': 'Panorama Films globe' });
      const n = ++uid, gid = 'pgs-globe' + n, cid = 'pgs-clip' + n;
      const defs = el('defs', {}), cp = el('clipPath', { id: cid });
      cp.appendChild(el('circle', { r: R })); defs.appendChild(cp);
      const g = el('g', { id: gid, fill: 'none', stroke: 'currentColor', 'stroke-width': SW });
      const inner = el('g', { 'clip-path': `url(#${cid})` });
      inner.appendChild(el('line', { x1: -R, y1: 0, x2: R, y2: 0 }));
      inner.appendChild(el('path', { d: `M${-R} -26 Q0 -14 ${R} -26` }));
      inner.appendChild(el('path', { d: `M${-R} 26 Q0 14 ${R} 26` }));
      const mer = el('g', {}); inner.appendChild(mer);
      g.append(inner, el('circle', { r: R }));
      defs.appendChild(g); svg.appendChild(defs);
      this.uses = ['#ff0000', '#00ff00', '#0000ff'].map(c => { const u = el('use', { href: '#' + gid }); u.style.color = c; svg.appendChild(u); return u; });
      this.paths = Array.from({ length: 6 }, () => { const p = el('path', {}); mer.appendChild(p); return p; });
      root.append(style, svg);
      this.svg = svg; this.g = g;

      this.reduce = matchMedia('(prefers-reduced-motion: reduce)');
      this.angle = 0; this.ab = 0; this.over = false; this.visible = true;
      this.turn = { auto: 0, offset: 0, drag: false, lastX: 0, from: 0, t: 0, dur: 0 };
      this.hv = { phase: 'idle', t: 0, a1: 0, dist: 0, T: 0 };
      this.sl = { vel: TURN * SLOW, burst: -1 };
      this.raf = 0; this.last = 0; this.demoAt = 0;
      this.tick = this.tick.bind(this);
      this.draw(0);

      svg.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') this.enter(); });
      svg.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') this.over = false; this.wake(); });
      svg.addEventListener('click', () => { if (this.mode !== 'turn') { this.enter(); setTimeout(() => { this.over = false; }, 600); } });
      svg.addEventListener('pointerdown', e => {
        if (this.mode !== 'turn') return;
        const t = this.turn; t.drag = true; t.lastX = e.clientX; t.dur = 0;
        svg.setPointerCapture(e.pointerId); this.setAttribute('data-dragging', ''); this.wake();
      });
      svg.addEventListener('pointermove', e => {
        const t = this.turn; if (!t.drag) return;
        t.offset += (e.clientX - t.lastX) * 180 / svg.getBoundingClientRect().width; // across the globe = half a turn
        t.lastX = e.clientX;
      });
      const end = () => {
        const t = this.turn; if (!t.drag) return;
        t.drag = false; this.removeAttribute('data-dragging');
        t.offset = ((t.offset % SPACING) + SPACING * 1.5) % SPACING - SPACING / 2; // poses repeat every 36°: return the short way
        t.from = t.offset; t.t = 0; t.dur = 1.6 + Math.abs(t.offset) / 18;
      };
      svg.addEventListener('pointerup', end);
      svg.addEventListener('pointercancel', end);
      this.onVis = () => this.wake();
    }

    get mode() { const m = this.getAttribute('mode'); return m === 'turn' || m === 'slow' ? m : 'hover'; }
    get split() { const v = parseFloat(this.getAttribute('split')); return isNaN(v) ? 1 : Math.max(0, Math.min(3, v)); }
    get speed() { const v = parseFloat(this.getAttribute('speed')); return isNaN(v) ? 1 : Math.max(0, v); }

    connectedCallback() {
      this.io = new IntersectionObserver(es => { this.visible = es[es.length - 1].isIntersecting; this.wake(); });
      this.io.observe(this);
      document.addEventListener('visibilitychange', this.onVis);
      this.wake();
    }
    disconnectedCallback() {
      this.io?.disconnect(); document.removeEventListener('visibilitychange', this.onVis);
      cancelAnimationFrame(this.raf); this.raf = 0;
    }
    get weight() { const v = parseFloat(this.getAttribute('weight')); return isNaN(v) ? 1 : Math.max(.2, Math.min(3, v)); }
    attributeChangedCallback(name) {
      if (name === 'weight') this.g.setAttribute('stroke-width', SW * this.weight);
      if (name === 'mode') this.reset();
      this.wake();
    }

    /* back to the starting pose, all motion cleared */
    reset() {
      this.angle = 0; this.turn.auto = 0; this.turn.offset = 0; this.turn.dur = 0;
      this.hv.phase = 'idle'; this.sl.vel = TURN * SLOW * this.speed; this.sl.burst = -1;
      this.draw(0);
    }

    enter() {
      this.over = true;
      if (!this.reduce.matches) {
        if (this.mode === 'hover' && this.hv.phase === 'idle') { this.hv.phase = 'spin'; this.hv.t = 0; }
        if (this.mode === 'slow') this.sl.burst = 0;
      }
      this.wake();
    }

    wake() {
      if (!this.raf && this.isConnected && this.visible && !document.hidden) {
        this.last = performance.now(); this.raf = requestAnimationFrame(this.tick);
      }
    }

    /* a front-facing meridian at longitude λ projects to a half-ellipse with rx = R·|sin λ| */
    draw(deg) {
      const off = ((deg % SPACING) + SPACING) % SPACING;
      this.paths.forEach((p, k) => {
        const lam = (-90 + off + k * SPACING) * Math.PI / 180;
        if (lam > Math.PI / 2 + 1e-6) { p.setAttribute('d', ''); return; }
        const s = Math.sin(lam), rx = Math.abs(s) * R;
        if (rx < 0.05) { p.setAttribute('d', `M0 ${-R} L0 ${R}`); return; }
        p.setAttribute('d', `M0 ${-R} A${rx} ${R} 0 0 ${s > 0 ? 1 : 0} 0 ${R}`);
      });
    }

    tick(now) {
      this.raf = 0;
      if (!this.visible || document.hidden) return;
      const dt = Math.min(0.04, (now - this.last) / 1000); this.last = now;
      const still = this.reduce.matches, sp = this.speed, mode = this.mode;
      let busy = false;

      if (this.hasAttribute('demo') && now - this.demoAt > 4000) {
        this.demoAt = now; this.enter(); setTimeout(() => { this.over = false; }, 900);
      }

      if (mode === 'turn') {
        const t = this.turn;
        if (!still) { t.auto += TURN * sp * dt; busy = true; }
        if (!t.drag && t.dur > 0) {
          t.t += dt; const x = Math.min(1, t.t / t.dur);
          t.offset = t.from * (1 - easeInOut(x));
          if (x >= 1) { t.offset = 0; t.dur = 0; }
          busy = true;
        }
        if (t.drag) busy = true;
        this.angle = t.auto + t.offset;
      } else if (mode === 'hover') {
        const h = this.hv, v = 300 * sp;
        if (h.phase === 'spin') {
          h.t += dt;
          this.angle += v * Math.min(1, h.t / 0.04) * dt;
          if (h.t >= 0.1) {
            // ease-out cubic whose starting speed matches the spin, landing exactly on a starting pose
            h.a1 = this.angle;
            h.dist = Math.ceil((h.a1 + v * 2.4 / 3) / SPACING) * SPACING - h.a1;
            h.T = 3 * h.dist / v; h.phase = 'settle'; h.t = 0;
          }
          busy = true;
        } else if (h.phase === 'settle') {
          h.t += dt; const x = Math.min(1, h.t / h.T);
          this.angle = h.a1 + h.dist * (1 - Math.pow(1 - x, 3));
          if (x >= 1) { this.angle = 0; h.phase = 'idle'; }
          busy = true;
        }
      } else {
        const s = this.sl;
        if (s.burst >= 0) {
          s.burst += dt;
          s.vel += (300 * sp - s.vel) * (1 - Math.exp(-dt * 14));
          if (s.burst >= 0.7) s.burst = -1;
        } else {
          s.vel += ((still ? 0 : TURN * SLOW * sp) - s.vel) * (1 - Math.exp(-dt * 1.6));
        }
        this.angle += s.vel * dt;
        busy = busy || Math.abs(s.vel) > 0.01;
      }
      this.draw(this.angle);

      // aberration eases in on hover, out on leave
      const target = this.over ? 1 : 0;
      this.ab += (target - this.ab) * (1 - Math.exp(-dt * (this.over ? 8 : 4)));
      if (!this.over && this.ab < 0.002) this.ab = 0;
      else busy = true;
      const d = this.ab * AB_MAX * this.split;
      this.uses[0].setAttribute('transform', `translate(${-d} ${d * 0.25})`);
      this.uses[2].setAttribute('transform', `translate(${d} ${-d * 0.25})`);

      if (busy || this.hasAttribute('demo')) this.raf = requestAnimationFrame(this.tick);
    }
  }

  customElements.define('panorama-globe-spin', PanoramaGlobeSpin);
})();
