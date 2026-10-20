# LE-012 · Chrome dither

Built with Andrija on 2026-10-20 from a reference clip (a dithered chrome logo animation on cosmos.so).

The authentic logo (`media/logo.png`, embedded as a data URI; never redrawn) used as a mask, filled with liquid chrome and shown as one-bit ordered dither (8×8 Bayer), white dots on black.

- **Flow:** the chrome follows the shape of the logo. A spiral phase sends a bright section of chrome round the rim and out along the latitudes, the wordmark and the meridian, with a dimmer tail behind it.
- **Tube:** each stroke has a soft tube cross-section with a thin reflection streak along one side (Bevel).
- **Fade:** the whole logo breathes between bright and sparse dots.
- **Cursor:** a small pool of chrome travels with the pointer (dark core, rippling rings) and holds back the fade under it. Moving fast speeds the flow up; on leave it eases back. Touch works the same way.

Values chosen by Andrija (2026-10-20), set as the defaults: Dot 2, Speed 0.7, Fade 1.0, Size 90, Flow 2.5, Turns 1, Radial 5, Res shift 0, Bevel 1.00. Res shift (coarser dots as the chrome dims) is off in his values but kept as a slider.

Open `panorama-globe-chrome-dither.html` directly: it is self-contained (WebGL2, no external assets) and is also the downloadable file. The control strip has the sliders, Invert (black dots on white), Swap logo (any PNG/SVG; transparent-background logos use their alpha) and Hide (H). `?embed=1` hides the controls, for the catalogue thumbnail.

The cursor-free version Andrija approved first is also saved in the claude.ai Project as `claude/milestones/2026-10-20-chrome-dither-globe.html` (artifact "Chrome Globe Dither", version 5).

Not in the header. Needs WebGL2.
