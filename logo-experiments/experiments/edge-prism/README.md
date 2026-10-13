# Panorama Edge prism

Edge prism is the only effect. All alternative variants and the selector have been removed. Default intensity is 0.10; the preview intensity slider is removed. Pointer movement controls broad optical distortion, with stronger red/blue separation at the left and right sides and a mostly clean centre. Horizontal dragging rotates the 3D globe on its fixed axis.

Open panorama-globe-edge-prism.html directly in a browser. No dependencies or network requests are needed. Auto gesture demonstrates the interaction; moving the pointer over the globe takes control. Intensity, colour, pause, background and reset controls remain available.

## Embed

```html
<script src="/assets/globe-optics.js" defer></script>
<panorama-globe-optics intensity="0.1" lens="prism" color="#fff"
  style="width:384px;max-width:100%;margin:auto">
</panorama-globe-optics>
```

Copy globe-optics.js to your website assets. The component is transparent and square. No variant attribute is needed. Optional attributes: intensity (0 to 1.5), lens (prism, glass, off), color, speed, paused and demo. iframe alternative: panorama-globe-edge-prism.html?embed=1.

The 3D sphere is calculated at 64x64, with a 128x128 optical pass and hard pixel sampling. Use sizes divisible by 128 for even output pixels. The optics are a stylized screen-space effect, not a physical glass simulation.
