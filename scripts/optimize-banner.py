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

    # Change only the real hero style attribute. Do not run a broad replacement
    # over arbitrary text because the homepage also contains large inline JS.
    old_style = (
        f"style=\"background-image:url('{png}');"
        "background-size:cover;background-position:center bottom;min-height:300px;\""
    )
    new_style = (
        f"style=\"background-image:url('{png}');"
        f"background-image:image-set(url('{webp}') type('image/webp'),url('{png}') type('image/png'));"
        "background-size:cover;background-position:center bottom;min-height:300px;\""
    )

    # Make reruns idempotent by collapsing an already optimized style first.
    optimized_pattern = re.compile(
        r"style=\"background-image:url\('" + re.escape(png) + r"'\);"
        r"background-image:image-set\(url\('" + re.escape(webp) + r"'\) type\('image/webp'\),"
        r"url\('" + re.escape(png) + r"'\) type\('image/png'\)\);"
        r"background-size:cover;background-position:center bottom;min-height:300px;\""
    )
    html = optimized_pattern.sub(old_style, html, count=1)
    if old_style not in html:
        raise RuntimeError(f'Hero banner style not found in {page.relative_to(ROOT)}')
    html = html.replace(old_style, new_style, 1)

    preload = f'<link rel="preload" as="image" href="{webp}" type="image/webp" fetchpriority="high">'
    html = re.sub(
        r'\s*<link\s+rel="preload"\s+as="image"\s+href="(?:\.\./)?assets/images/banner\.webp"[^>]*>',
        '',
        html,
    )
    html = html.replace('</head>', f'    {preload}\n</head>', 1)

    page.write_text(html, encoding='utf-8')
    print(f'Updated hero image loading: {page.relative_to(ROOT)}')
