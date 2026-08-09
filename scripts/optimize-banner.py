from pathlib import Path
import re
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'assets' / 'images' / 'banner.png'
TARGET = ROOT / 'assets' / 'images' / 'banner.webp'
PAGES = {
    ROOT / 'index.html': '',
    ROOT / 'cs' / 'index.html': '../',
    ROOT / 'de' / 'index.html': '../',
    ROOT / 'es' / 'index.html': '../',
}

with Image.open(SOURCE) as image:
    if image.mode not in ('RGB', 'RGBA'):
        image = image.convert('RGB')
    image.save(TARGET, 'WEBP', quality=82, method=6)

source_size = SOURCE.stat().st_size
webp_size = TARGET.stat().st_size
saved = source_size - webp_size
percent = (saved / source_size * 100) if source_size else 0
print(f'Optimized banner: {source_size:,} B -> {webp_size:,} B ({percent:.1f}% smaller)')

for page, prefix in PAGES.items():
    if not page.exists():
        continue
    html = page.read_text(encoding='utf-8')
    png = f"{prefix}assets/images/banner.png"
    webp = f"{prefix}assets/images/banner.webp"

    # Keep a PNG fallback, then let modern browsers use the smaller WebP.
    replacement = (
        f"background-image:url('{png}');"
        f"background-image:image-set(url('{webp}') type('image/webp'),url('{png}') type('image/png'));"
    )
    html = re.sub(
        r"background-image:url\('(?:\.\./)?assets/images/banner\.png'\);(?:background-image:image-set\([^;]+\);)?",
        replacement,
        html,
        count=1,
    )

    preload = f'<link rel="preload" as="image" href="{webp}" type="image/webp" fetchpriority="high">'
    html = re.sub(r'\s*<link\s+rel="preload"\s+as="image"\s+href="(?:\.\./)?assets/images/banner\.webp"[^>]*>', '', html)
    if '<meta name="viewport"' in html:
        html = html.replace('</head>', f'    {preload}\n</head>')

    page.write_text(html, encoding='utf-8')
    print(f'Updated hero image loading: {page.relative_to(ROOT)}')
