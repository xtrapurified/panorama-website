# LE-007 · Clean globe

Smooth rendering of LE-004’s fitted analytic sphere: identical tilt, twelve meridians, parallel spacing, polar taper and front surface visibility. Antialiased lines at display resolution (up to 1024 px), continuous ten-second rotation, horizontal dragging and inertia. No lens distortion or colour separation. This is a new monochrome study; LE-006 retains its prism effect.

Open `panorama-globe-clean.html` directly. It is self-contained and is also the downloadable file. `?embed=1` hides the surrounding controls.

For integration, load `globe-clean.js` once and insert:

```html
<panorama-globe-clean style="width:180px" color="#fff" speed="1"></panorama-globe-clean>
```

`paused` stops autoplay. `speed` accepts -5 to 5; 1 is one turn per ten seconds, 0 stops autoplay. Arrow keys turn, Space pauses, Home resets. Respects reduced motion and stops drawing offscreen or in a hidden document. Transparent background, white by default. No external dependencies.
