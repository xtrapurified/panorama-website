# Panorama Chrome Logo

Interactive black-and-white dithered chrome animation for the Panorama globe, the P from its wordmark, or a custom logo. Plain JavaScript + WebGL. No npm install, build step, CDN, API key, or server-side processing.

## Open the demo

- Open `standalone.html` directly in a browser. All runtime assets are embedded.
- Or serve this directory and open `index.html` for the multi-file studio.
- `embed-example.html` demonstrates the animation with the controls hidden.

For local HTTP testing:

```sh
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Included files

| File | Purpose |
| --- | --- |
| `index.html`, `demo.js` | Studio with logo upload, presets, and sliders |
| `panorama-chrome.js` | Reusable component and rendering code |
| `panorama-chrome.css` | Scoped component styles |
| `embed-example.html`, `embed-example.js` | Integration without the studio controls |
| `standalone.html` | Self-contained offline studio |
| `settings-example.json` | Example configuration |
| `assets/` | Original Panorama PNG and masks for the globe and P |

## Embed in an existing page

Copy `panorama-chrome.js` and `panorama-chrome.css` into your website's public assets. The included globe and P are embedded in the JavaScript, so the `assets/` directory is not required for those shapes to render.

```html
<link rel="stylesheet" href="/assets/panorama-chrome.css">
<div id="chrome-logo" style="width:100%;max-width:720px"></div>
<script src="/assets/panorama-chrome.js"></script>
<script>
  PanoramaChrome.mount('#chrome-logo', {
    controls: false,
    shape: 'logo',
    resolution: 480,
    bevel: 1.2,
    speed: 0.65,
    flow: 1.4,
    variety: 0.8,
    contrast: 1,
    interaction: 1.5,
    scale: 1.2
  }).then(animation => {
    window.logoAnimation = animation;
  }).catch(console.error);
</script>
```

Call `mount` after the target element exists. It returns a Promise for the component controller. Multiple independent instances are supported. The canvas remains square and scales with its container.

### Your own logo

Put the logo on your website and pass its URL:

```js
const animation = await PanoramaChrome.mount('#chrome-logo', {
  controls: false,
  logoUrl: '/assets/my-logo.svg',
  maskMode: 'auto',
  resolution: 480,
  speed: 0.65
});
```

Or change it later:

```js
await animation.loadLogo('/assets/another-logo.png', 'auto');
// File objects from an <input type="file"> also work:
await animation.loadLogo(fileInput.files[0], 'alpha');
```

Uploads are processed in the browser. Nothing is uploaded to a service or retained on a server. A local upload is temporary; for production, retain the original file in your website's assets and load its URL. The settings JSON does not contain the uploaded image.

Supported inputs: PNG, SVG, WebP, JPEG. Uploaded files must be under 8 MB and decoded images below 40 megapixels. SVGs should be self-contained, with a viewBox and no external fonts or image references. Remote image URLs require permission from that host for canvas access; same-origin assets are simplest.

Extraction modes:

- `auto`: use transparency when present; otherwise infer the background from the corners.
- `alpha`: use the alpha channel as the silhouette.
- `dark`: select dark artwork on a light background.
- `light`: select light artwork on a dark background.

Transparent PNG/SVG files or clean, high-contrast artwork give the best results. Complex photographs and logos on textured backgrounds need a prepared mask first. The effect is monochrome; original logo colors are not retained.

## Controls and settings

| Setting | Range | Effect |
| --- | --- | --- |
| `shape` | `logo`, `p`, `custom` | Select a built-in shape or an already-loaded custom logo |
| `resolution` | 96–960, step 16 | Internal square render resolution; lower gives larger visible pixels |
| `bevel` | 0.15–3 | Multiplier for rounded edge depth |
| `speed` | 0–2 | Automatic animation speed |
| `flow` | 0–3 | Liquid deformation of the reflections |
| `variety` | 0–2 | Additional slowly evolving reflection changes |
| `contrast` | 0.4–2 | Contrast before black-and-white dithering |
| `interaction` | 0–3 | Strength of cursor/touch position and movement response |
| `scale` | 0.5–1.35 | Shape size within the canvas |
| `controls` | true / false | Show or hide the upload, sliders, and shape buttons |
| `paused` | true / false | Optional initial autoplay override |

`controls`, `paused`, `logoUrl`, and `maskMode` are mounting options. Update the numeric rendering settings and shape using `setOptions`:

```js
animation.setOptions({ speed: 0.5, bevel: 1.6, interaction: 2 });
console.log(animation.getOptions());
animation.pause(true);
animation.pause(false);
animation.destroy(); // Call when removing the element or changing SPA routes.
```

The studio's **Website settings** section shows the current JSON. Copy those values into the mount options. Set `controls: false` for a clean interactive website element. Choosing `custom` requires loading that image first, through `logoUrl` or `loadLogo`.

The `Reference`, `Liquid`, and `Sculpted` presets are starting points. At large scale values, artwork close to the canvas edges may be cropped. Use lower resolution on small/mobile placements.

The root element emits `chrome-ready` after initialization and `chrome-change` after studio control changes. Change events contain the current settings in `event.detail`. Programmatic calls can be read back with `getOptions`.

## React / Next.js

Load the CSS and script once using your framework's public-asset mechanism. For Next.js, load the script with `next/script`, and mount after its `onLoad`/`onReady`. This example assumes `window.PanoramaChrome` is already available:

```jsx
import { useEffect, useRef } from 'react';

export default function ChromeLogo() {
  const container = useRef(null);

  useEffect(() => {
    let canceled = false;
    let animation;
    window.PanoramaChrome.mount(container.current, {
      controls: false,
      shape: 'logo',
      resolution: 480,
      speed: 0.65
    }).then(instance => {
      if (canceled) instance.destroy();
      else animation = instance;
    }).catch(console.error);

    return () => {
      canceled = true;
      animation?.destroy();
    };
  }, []);

  return <div ref={container} style={{ width: '100%', maxWidth: 720 }} />;
}
```

For Next.js App Router, put `'use client'` at the top of the component file. Mounts into the same container are serialized, so the cleanup pattern also works with development Strict Mode. Independent containers can animate at the same time.

## Accessibility, performance, and hosting

- Reduced-motion preference pauses automatic animation initially, unless `paused` is explicitly supplied. Cursor/touch response remains available. A visible Play button is present when studio controls are enabled.
- Automatic drawing is skipped while the element is off-screen or the document is hidden; the observer/frame loop remains lightweight.
- `destroy()` stops the frame loop, disconnects observers, and frees the textures, program, and vertex buffer.
- WebGL is required. Initialization failures are displayed in the component and rejected from `mount`; a website can use that rejection to substitute its static logo.
- All styling is scoped to `.panorama-chrome`. Hide controls with the mounting option, not by removing their DOM elements.
- A strict Content Security Policy must permit the site's JavaScript/CSS and `data:` / `blob:` image decoding for the embedded masks and local uploads. Use the multi-file version when inline scripts/styles are prohibited.
- The implementation makes no external library or API requests. Only a custom `logoUrl` requests an image.
- No deployment or changes to the live Panorama website are included in this package.

## Validation

JavaScript syntax, component packaging, configuration controls, and upload preprocessing are checked during packaging. This package still needs a visual browser check in the final website layout, including its CSP, mobile behavior, and actual logo asset URLs.
