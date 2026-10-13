# Logo Experiments

An evolving, self-contained catalogue of Panorama Films logo studies.

## Open

Open `index.html` locally, or visit `/logo-experiments/` on the website. No build step, dependencies, external fonts or network assets are required. The catalogue displays the newest ID first. Select a study to open its original interactive demo; closing it unloads that demo. Offscreen thumbnail demos unload to avoid running the entire collection at once.

The page has `noindex,nofollow`, and the hosting configuration sends `X-Robots-Tag` for this folder. It is unlinked from the homepage. This is a public reference collection, not access-controlled storage.

## Stable references

| ID | Study | Main integration source |
| --- | --- | --- |
| LE-001 | Recorded globe | experiments/recorded-globe/panorama-globe.js |
| LE-002 | Stable / v09 | experiments/stable-v9/panorama_globe_v9_stable_match.html |
| LE-003 | Thin / v15 | experiments/thin-v15/panorama_globe_v15_thinner_stable.html |
| LE-004 | 3D globe | experiments/3d-globe/globe3d.js |
| LE-005 | Optical lens | experiments/optical-lens/panorama-globe-lens.html |
| LE-006 | Edge prism | experiments/edge-prism/globe-optics.js |
| LE-007 | Clean globe | experiments/clean-globe/globe-clean.js |

Example request: “Use LE-006, Edge prism, in the homepage header at intensity 0.1.” The Copy reference action includes the exact source path and a direct catalogue link.

## Add another experiment

1. Create `experiments/short-descriptive-name/` and put the complete working demo and its assets there.
2. Keep the uploaded original HTML or ZIP in `originals/`.
3. Add one object to `catalog.js`, matching the existing fields. Assign the next ID (`LE-008`), never renumber existing IDs. Use relative paths so local opening and subfolder hosting work.
4. Supply a `preview.html` that hides the demo's own navigation and fills a small square viewport; point `preview` to it. Preserve the original demo unchanged at `entry`. If no adapter is needed, `preview` can point directly to `entry`.
5. Add a row above and update project.md. Verify all entry, preview, download and source paths, then follow the repo's dev workflow.

`index.html`, `style.css` and `index.js` are the collection interface. `catalog.js` is the only registry. The bundled experiments are isolated in iframes so their custom elements and keyboard controls cannot conflict.

## Preservation and integration

The six supplied uploads and all extracted source files are preserved byte-for-byte. Only generated `preview.html` adapters change presentation framing. Read each experiment's README before integrating it. The originals may describe older controls; for Edge prism the actual uploaded preview uses intensity 0.1 and has no intensity slider. Earlier lens controls remain in LE-005, an independently archived experiment.

The 3D model is a wireframe OBJ plus an analytic sphere renderer; its pixel appearance is produced by the renderer. LE-001 uses recorded frames. These approaches should not be treated as interchangeable implementations.

## Validation

Originals checked against their uploads; all registered paths checked; catalogue and embedded JavaScript syntax checked. Browser visual and interaction QA was not available in this session. Review the dev preview on desktop and phone before approving production.
