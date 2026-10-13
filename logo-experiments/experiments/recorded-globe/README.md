# Panorama reference globe

Source-derived interactive animation using the supplied recording. Preserves the captured silhouette, broken lines, pixel stepping and roughly 10 fps cadence. The 25-state cycle lasts 2.5 seconds at speed=1. Alpha is extracted from the recording, with minor codec-noise cleanup. This is a frame-based component, not a reconstructed 3D mesh. Drag controls the recorded rotation axis, not arbitrary camera angles. Frame-to-frame differences already present in the source remain. It is not guaranteed to be pixel-identical to the separate enlarged screenshot.

## Preview
Open panorama-globe.html directly in a browser. No server, packages, WebGL, fonts, CDN, or internet needed. Drag horizontally to scrub; release for inertia. Left/right keys step frames, Space pauses, Home resets. Appearance toggles white/black and black/grey. Mobile supports horizontal touch dragging while retaining vertical page scrolling. Reduced-motion preference pauses autoplay. Animation sleeps when outside the viewport or tab is hidden.

## Website integration
Copy panorama-globe.js to your assets directory. It contains the images inline, so no other asset URLs are required.

```html
<script src="/assets/panorama-globe.js" defer></script>
<panorama-globe color="#ffffff" speed="1"
  style="width: min(80vw, 600px); margin: auto;"></panorama-globe>
```

The component is transparent. Set the background on its parent. It keeps a square aspect ratio. Supported attributes: color (CSS color), speed (-5 to 5; negative reverses), paused (boolean). Use globe.paused=true or globe.reset() from JavaScript. Multiple instances are supported. If using CSP, allow data: for img-src, your script host in script-src, and the component's inline styles via your appropriate style policy. No eval or remote requests.

Alternative: iframe panorama-globe.html?embed=1, with a square width/height and a descriptive title. Scripts must be enabled if the host sandboxes HTML previews.

## Assets and provenance
The 480px transparent frames come from the user-supplied Recording 2026-10-12 at 20.54.03(1).mp4. The 5x5 PNG atlas and source-frame manifest are included for future editing. The single-file HTML and JS each embed the same atlas. Load just one in production. Raster resolution is 480px per frame; it retains the supplied low-resolution aesthetic at larger sizes but adds no new 3D detail.
