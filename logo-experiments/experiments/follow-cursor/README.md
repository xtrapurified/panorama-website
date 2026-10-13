# LE-011 · Follow the cursor

Built with Andrija on 2026-10-13, chosen from three meridian-only studies (Spin, Follow the cursor, Fan out) in the outline version, white on black.

The authentic outline logo, traced from the logo file. Only the vertical centre line was removed, and it is redrawn live as a meridian on the globe's exact axis (14 px in the 714 px file, centred on the rim). The rim, the latitudes, the band, the wordmark and the ® are the original artwork and never move. At rest the drawing matches the logo file to within anti-aliasing.

- While the pointer is over the globe, the meridian swings to sit under it, as if the globe turns to look at you. Meridians are 90° apart, so as one swings toward the edge the next comes round from the far side.
- When the pointer leaves, a spring brings it back to centre with a slight overshoot, and it comes to rest exactly on the original logo.
- While the pointer is over it, a subtle chromatic aberration fades in: red and blue copies part slightly in the direction of the pointer and merge back to white on leave.
- Moving meridians stop at the rim and at the edges of the wordmark band; they never cross the type.

Open `panorama-globe-follow.html` directly. It is self-contained and is also the downloadable file. A switch picks **Over the globe** (default) or **Anywhere on the page**; `?track=page` opens on the second. `?embed=1` hides the controls and turns on `demo`.

For integration, load `globe-follow.js` once and insert:

```html
<panorama-globe-follow style="width:179px"></panorama-globe-follow>
```

The sphere fills 80% of the element (rim line centre), the same framing as LE-009, so the two swap in place. `track` is `self` (default: follow while the pointer is over the element) or `page` (follow the pointer anywhere in the window). `split` sets the aberration strength from 0 to 3 (default 1). `demo` sweeps the meridian across and back every four seconds (for the catalogue thumbnail, where nobody can hover). `reset()` returns it to the logo at once. On touch screens the meridian swings to where the finger lands and returns shortly after it lifts. White on a dark background only: the three colour channels add up to white when aligned. Transparent background. Respects reduced motion (no following), stops drawing offscreen, in a hidden tab, and once it has settled. No external dependencies; the traced logo is embedded as path data (about 21 KB compressed).

In the website header since 2026-10-13 (`media/globe-follow.js`), replacing LE-009 Vector spin.
