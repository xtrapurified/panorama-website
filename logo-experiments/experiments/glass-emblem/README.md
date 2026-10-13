# LE-010 · Glass emblem

Built with Andrija on 2026-10-13, starting from his chrome study (Object Study 11, a three.js extrusion of the traced Panorama vector outline). The globe and the PANORAMA lettering are extruded as one shallow tablet: soft bevels on the globe frame, crisp bevels on the letters.

Two files:

- **`panorama-chrome-studio.html`**, the tuning studio. Finishes (White Glass, Red, Black and Silver Chrome), roughness, highlights, thickness, translucency, interaction toggles (magnetic tracking, cursor reflections, inertia, hover magnification, wheel, readable from both sides), a logo library (upload or drop any flat logo; it is traced and extruded in the same material, kept in that browser), and a header preview: sample footage or your own reel behind it, a mock nav, header heights and emblem size and position. The emblem stays on the lens axis and the image is shifted (off-axis projection), so it does not stretch in the corners.
- **`globe-glass.js`**, the component used in the header (`<panorama-globe-glass>`), with the settings Andrija chose in the studio: White Glass, roughness 0.16, studio highlights 1.5, thickness 1.10, translucency 0.99, front view, no auto-rotation; magnetic tracking, inertia and wheel off; cursor-controlled reflections, hover magnification and readable from both sides on.

```html
<script src="media/globe-glass.js"></script>
<panorama-globe-glass backdrop="media/stills/reel.webp" backdrop-for="#heroMedia"></panorama-globe-glass>
```

The element is square and the emblem fills 80% of it. `backdrop` is an image the glass refracts, mapped as `object-fit: cover` over the element named by `backdrop-for`, so the glass shows the part of the picture that sits behind it. The hero reel streams from Vimeo, whose frames a page cannot read, so the header uses the reel's still frame for the refraction. `backdrop-brightness` dims it (default 0.8). Without a backdrop the glass refracts soft white. Drag turns it and it stays where it is left; `reset()` eases it back to the front. `demo` turns it on its own every few seconds (catalogue thumbnail). three.js 0.180 loads from jsDelivr on first use; it draws only while something moves; `fallback` names an image for browsers without WebGL (default `media/logo.png`).

`panorama-globe-glass.html` is the standalone demo over the reel still; `?embed=1` hides the labels and turns on `demo`.
