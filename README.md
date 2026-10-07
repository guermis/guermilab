# Guermi Lab

## Media performance

- Images use native lazy loading. The project grid, about content, and contact form mount when approaching the viewport.
- Video and album viewers are separate chunks, requested on their first click.
- The 16:9 hero starts muted. Its sound control changes only the video's muted property, preserving playback.

## WebP images

For files in `public/images/`, convert once before committing them (requires Python and Pillow: `python3 -m pip install Pillow`):

```sh
python3 - <<'PY'
from pathlib import Path
from PIL import Image
for source in Path('public/images').iterdir():
    if source.suffix.lower() in {'.jpg', '.jpeg', '.png'}:
        with Image.open(source) as image:
            image.save(source.with_suffix('.webp'), 'WEBP', quality=82, method=6)
PY
```

Reference the converted filename directly: `<img src="/images/project-1.webp" loading="lazy" decoding="async" alt="Project title" />`. Vite serves public files unchanged; they do not need a conversion plugin. Keep originals until all references have been updated and verified. Upload WebP cover photos, portraits, and thumbnails through the admin to reduce their transfer size too; SVG/ICO button icons can stay in their original format. WebP is for images, not hero videos.

For imported images under `src/assets`, the optional build-time alternative is `vite-imagetools`: install with `bun add -d vite-imagetools`, add `imagetools()` to the Vite plugins, and import `./photo.jpg?format=webp` (declare `*?format=webp` as a string module in a `.d.ts` file).
