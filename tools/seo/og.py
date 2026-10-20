"""Makes the 1200x630 JPEG share images (og:image) in media/og/ from the site's own stills.
Run after tools/seo/build.mjs, then run build.mjs once more so the pages point at the new images."""
import json, os
from PIL import Image
src = json.load(open('tools/seo/og-sources.json'))
os.makedirs('media/og', exist_ok=True)
for name, p in src.items():
    im = Image.open(p.lstrip('/')).convert('RGB')
    W, H = 1200, 630
    s = max(W / im.width, H / im.height)
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    l, t = (im.width - W) // 2, (im.height - H) // 2
    im.crop((l, t, l + W, t + H)).save(f'media/og/{name}.jpg', quality=82, optimize=True, progressive=True)
print(len(src), 'share images')
