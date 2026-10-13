# LE-009 · Vector spin

Built with Andrija on 2026-10-13. A vector globe (outline, equator, two bowed parallels and meridians every 36°, line weight about 9% of the radius) turning as a sphere: the meridians slide across the face while the outline and parallels stay put. Three motion modes, chosen with a switch on the demo page (Spin on hover first):

- **Spin on hover** (`mode="hover"`, default): still until the pointer arrives, then a 0.1 s spin and a slow ease-out (about 2.4 s) that lands exactly on the starting pose.
- **Continuous turn** (`mode="turn"`): turns steadily (about 9 s a revolution). Drag left or right to turn it by hand; on release it slowly glides back to where its own turn would be and carries on.
- **Slow turn** (`mode="slow"`): drifts at 0.3× the continuous speed; on hover a 0.7 s spin burst, then it eases back down to the drift.

In every mode a subtle chromatic aberration fades in while the pointer is over it: red, green and blue copies of the globe separate slightly and merge back to white on leave.

Open `panorama-globe-spin.html` directly. It is self-contained and is also the downloadable file. `?mode=turn` or `?mode=slow` opens on another mode; `?embed=1` hides the surrounding controls and turns on `demo`.

For integration, load `globe-spin.js` once and insert:

```html
<panorama-globe-spin style="width:179px" mode="hover"></panorama-globe-spin>
```

The logo fills 80% of the element. `split` sets the aberration strength from 0 to 3 (default 1). `speed` multiplies all speeds (default 1). `demo` triggers the hover behaviour on its own every four seconds (used for the catalogue thumbnail, where nobody can hover). `reset()` returns it to the starting pose. White on a dark background only: the three colour channels add up to white when aligned. Transparent background. Respects reduced motion (no automatic turning), stops drawing offscreen, in a hidden tab, and once it has settled. On phones a tap plays the hover behaviour. No external dependencies.

This is a redrawn approximation of the mark, not the authentic logo file.
