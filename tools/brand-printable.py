#!/usr/bin/env python3
"""Compose an untouched source illustration on branded A4.

Requires Pillow, reportlab, qrcode, DejaVu Sans and Poppler's pdftoppm.
Always supply the original, unbranded source (never the generated PNG).
Usage: python tools/brand-printable.py source.png output-base --title TITLE
Writes branded .pdf/.png and an unbranded .webp preview.
"""
import argparse
import subprocess
import tempfile
from pathlib import Path

import qrcode
from PIL import Image
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

URL = 'https://vinmat.eu/w4k'
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'


def compose(source, output, title):
    source, output = Path(source), Path(output)
    if source.resolve() == output.with_suffix('.png').resolve():
        raise ValueError('Source must be the original, not the generated PNG')
    output.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as image:
        width, height = image.size
        page_width, page_height = A4
        # Original illustration fills its A4 canvas; no reserved footer strip.
        margin = 8 * mm
        scale = min(page_width / width, page_height / height)
        draw_width, draw_height = width * scale, height * scale
        pdf_temp = output.with_suffix('.pdf.tmp')
        pdf = canvas.Canvas(str(pdf_temp), pagesize=A4)
        pdf.setTitle(title)
        pdf.setAuthor("VinMat's World for Kids")
        pdf.drawImage(ImageReader(image), (page_width - draw_width) / 2,
                      (page_height - draw_height) / 2,
                      draw_width, draw_height, mask='auto')
        # Embed the font and give letters explicit breathing room at small sizes.
        pdfmetrics.registerFont(TTFont('PrintableSans', FONT))
        baseline = margin + 1.6 * mm
        pdf.setFillColorRGB(1, 1, 1)
        pdf.rect(margin, margin, 29 * mm, 6 * mm, stroke=0, fill=1)
        pdf.setFillColorRGB(0, 0, 0)
        label = pdf.beginText(margin + 1 * mm, baseline)
        label.setFont('PrintableSans', 8)
        label.setCharSpace(0.25)
        label.textLine('FREE PRINTABLE')
        pdf.drawText(label)
        qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M,
                           box_size=1, border=4)
        qr.add_data(URL)
        qr.make(fit=True)
        matrix = qr.get_matrix()
        qr_size, qr_bottom = 17 * mm, margin
        qr_left = page_width - margin - qr_size
        # Only the right corner gets a white backing, including QR quiet zone.
        right_left = qr_left - 25 * mm
        pdf.setFillColorRGB(1, 1, 1)
        pdf.rect(right_left, qr_bottom, 25 * mm + qr_size,
                 qr_size, stroke=0, fill=1)
        pdf.setFillColorRGB(0, 0, 0)
        module = qr_size / len(matrix)
        for row, cells in enumerate(matrix):
            for col, black in enumerate(cells):
                if black:
                    pdf.rect(qr_left + col * module,
                             qr_bottom + (len(matrix) - row - 1) * module,
                             module, module, stroke=0, fill=1)
        pdf.setFont('PrintableSans', 8)
        pdf.drawRightString(qr_left - 2 * mm, baseline, 'vinmat.eu/w4k')
        pdf.linkURL(URL, (qr_left - 65, qr_bottom, page_width - margin,
                          qr_bottom + qr_size), relative=0)
        pdf.showPage()
        pdf.save()
        pdf_temp.replace(output.with_suffix('.pdf'))
    # Render the exact PDF composition; keep the original source resolution.
    with tempfile.TemporaryDirectory(prefix='vinmat-printable-') as directory:
        rendered = Path(directory) / 'page'
        subprocess.run(['pdftoppm', '-singlefile', '-png',
                        '-scale-to-x', str(width), '-scale-to-y', str(height),
                        str(output.with_suffix('.pdf')), str(rendered)], check=True)
        rendered.with_suffix('.png').replace(output.with_suffix('.png'))
    # Website preview intentionally keeps the original illustration without footer.
    with Image.open(source) as original:
        original.save(output.with_suffix('.webp'), 'WEBP', quality=92, method=6)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source')
    parser.add_argument('output')
    parser.add_argument('--title', default="VinMat's World for Kids — Free Printable")
    args = parser.parse_args()
    compose(args.source, args.output, args.title)
