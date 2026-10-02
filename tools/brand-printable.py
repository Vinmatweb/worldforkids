#!/usr/bin/env python3
"""Compose an untouched source illustration on branded A4.

Requires Pillow, reportlab, qrcode and Poppler's pdftoppm.
Always supply the original, unbranded source (never the generated PNG).
Usage: python tools/brand-printable.py source.png output-base --title TITLE
Writes branded .pdf/.png and an unbranded .webp preview.
"""
import argparse
import subprocess
from pathlib import Path

import qrcode
from PIL import Image
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

URL = 'https://vinmat.eu/w4k'


def compose(source, output, title):
    source, output = Path(source), Path(output)
    if source.resolve() == output.with_suffix('.png').resolve():
        raise ValueError('Source must be the original, not the generated PNG')
    output.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as image:
        width, height = image.size
        page_width, page_height = A4
        margin, footer_top = 8 * mm, 27 * mm
        scale = min((page_width - 2 * margin) / width,
                    (page_height - margin - footer_top) / height)
        draw_width, draw_height = width * scale, height * scale
        pdf = canvas.Canvas(str(output.with_suffix('.pdf')), pagesize=A4)
        pdf.setTitle(title)
        pdf.setAuthor("VinMat's World for Kids")
        pdf.drawImage(ImageReader(image), (page_width - draw_width) / 2,
                      footer_top + (page_height - margin - footer_top - draw_height) / 2,
                      draw_width, draw_height, mask='auto')
        pdf.setFont('Helvetica', 8)
        baseline = 13 * mm
        pdf.drawString(margin, baseline, 'FREE PRINTABLE')
        qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M,
                           box_size=1, border=4)
        qr.add_data(URL)
        qr.make(fit=True)
        matrix = qr.get_matrix()
        qr_size, qr_bottom = 17 * mm, margin
        qr_left = page_width - margin - qr_size
        module = qr_size / len(matrix)
        for row, cells in enumerate(matrix):
            for col, black in enumerate(cells):
                if black:
                    pdf.rect(qr_left + col * module,
                             qr_bottom + (len(matrix) - row - 1) * module,
                             module, module, stroke=0, fill=1)
        pdf.drawRightString(qr_left - 2 * mm, baseline, 'vinmat.eu/w4k')
        pdf.linkURL(URL, (qr_left - 65, qr_bottom, page_width - margin,
                          qr_bottom + qr_size), relative=0)
        pdf.showPage()
        pdf.save()
    # Render the exact PDF composition; keep the original source resolution.
    dpi = width / (page_width / 72)
    subprocess.run(['pdftoppm', '-singlefile', '-png', '-r', str(dpi),
                    str(output.with_suffix('.pdf')), str(output)], check=True)
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
