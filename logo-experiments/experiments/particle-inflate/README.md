# LE-008 · Particle inflate

Chosen by Andrija on 2026-10-13 from six hover studies (PS-01 to PS-06, kept in `originals/particle-studies.html`). The flat globe is sampled pixel by pixel from the logo file. On hover it swells into a turning 3D sphere of dust with the globe's own lines wrapped around it, thinned by an ordered dither toward the far side. Depth drives the colour split: red and blue separate one way on the near side and the other way on the far side; at rest the logo is plain and single-coloured. Leaving flattens it back into the logo.

Drag turns it in any direction (left/right spins, up/down tips, limited so the lines stay readable); letting go keeps the flick's spin, which slows back to its own pace while the tip levels out. On phones a tap holds it open or flattens it; a drag turns it. Space or Enter toggles it, arrow keys spin it.

Open `panorama-globe-inflate.html` directly. It is self-contained and is also the downloadable file. `?embed=1` hides the surrounding controls.

For integration, load `globe-inflate.js` once and insert:

```html
<panorama-globe-inflate style="width:179px" color="#fff" split="1"></panorama-globe-inflate>
```

The logo fills 80% of the element (a 179 px element gives the header's ~143 px sphere). `split` sets the colour split from 0 to 2 (default 1). `inflated` holds it open. `reset()` flattens and clears any rotation. Transparent background, white by default. Respects reduced motion (no automatic turning), stops drawing offscreen, in a hidden tab, and whenever it has settled flat. No external dependencies; the logo image is embedded.
