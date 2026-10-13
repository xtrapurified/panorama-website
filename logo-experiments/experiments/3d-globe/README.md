# Panorama 3D pixel globe

This is a true analytic 3D sphere with a fixed camera and rotation around its local Y axis. Every pixel is evaluated at a ray/sphere intersection. Grid coordinates move continuously in 3D; no recorded frames or video are used.

The sphere orientation, grid spacing, thickness and phase were numerically fitted against the supplied screenshot. Rotation direction and speed were estimated from successive recording frames. This is a close reconstruction, not a pixel-identical reproduction. The largest remaining differences are around the poles and silhouette.

## Preview
Open panorama-globe-3d.html directly in a browser. No network or packages required. Horizontal drag rotates on the fixed axis; vertical drag does not tilt it. Release adds inertia. Left/right keys rotate; Space pauses; Home resets. Controls switch between the two reference colour schemes.

Autoplay uses the recording's approximately 10 fps cadence, 4/4/4/4/2 degree steps, and roughly 10 seconds per full turn. Pixel rendering is binary at 64x64, with a globe diameter of about 51 pixels. Nearest-neighbour scaling prevents antialiasing. Preview size uses integer pixel multiples.

## Embed the component
Copy globe3d.js into your website assets:

```html
<script src="/assets/globe3d.js" defer></script>
<panorama-globe-3d color="#ffffff" speed="1"
  style="width:384px;max-width:100%;margin:auto"></panorama-globe-3d>
```

The background is transparent. For equally sized square pixels, choose sizes divisible by 64, such as 256, 320, 384, 448 or 512 CSS pixels. Do not set height independently. Supported attributes: color, speed (-5 to 5), paused (boolean). g.paused=true pauses; g.reset() restores the reference angle. Negative speed reverses autoplay without changing the fixed axis.

Reduced-motion preference pauses autoplay. Explicit Play overrides it. Animation sleeps offscreen and in hidden tabs. Component cleanup supports removing and reconnecting elements. If the hosting preview sandboxes HTML, enable scripts. For sites with strict CSP, allow the local script and the component's shadow-root inline stylesheet under the site's appropriate policy.

Alternative iframe: panorama-globe-3d.html?embed=1 hides the preview interface.

## Model files
model.json defines the sphere, camera rotation, grid and raster settings. panorama-globe-wireframe.obj contains the underlying 3D meridian and parallel curves as OBJ line elements, for 3D packages that support them. It is a wireframe, not a solid mesh. Its raw appearance in a 3D editor differs from the website because stroke thickness, front-hemisphere occlusion and deliberate pixel sampling are implemented in globe3d.js. Spin around local Y first, then apply tiltX followed by tiltZ; the camera looks along negative Z, with positive Z facing the viewer.

## Validation
Headless Chromium: initial rendering, autoplay, horizontal drag direction, vertical-axis lock, colour switching, desktop and mobile layouts. No JavaScript errors or mobile horizontal overflow observed. All canvas alpha samples were 0 or 255. Safari and physical touch-device testing have not been performed.
