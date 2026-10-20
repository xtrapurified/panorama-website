"""Makes the 1200x630 JPEG share images (og:image) in media/og/<slug>.jpg from each project's still.
Run from the repo root when a project or its still is new:  python3 tools/seo/og.py
Projects without one fall back to their WebP still, which most apps also show."""
import json, os, subprocess
from PIL import Image
src = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', """
import fs from 'node:fs'; import { readSite } from './lib/site.js';
const s = readSite(fs.readFileSync('index.html', 'utf8'));
const o = { home: 'media/stills/reel.webp' };
for (const k of s.ORDER) o[s.slug[k]] = 'media/' + (s.F[k].img || 'stills/' + (s.F[k].still || k)) + '.webp';
console.log(JSON.stringify(o));"""]))
os.makedirs('media/og', exist_ok=True)
for name, p in src.items():
    im = Image.open(p).convert('RGB'); W, H = 1200, 630
    s = max(W / im.width, H / im.height); im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    l, t = (im.width - W) // 2, (im.height - H) // 2
    im.crop((l, t, l + W, t + H)).save(f'media/og/{name}.jpg', quality=82, optimize=True, progressive=True)
print(len(src), 'share images')
