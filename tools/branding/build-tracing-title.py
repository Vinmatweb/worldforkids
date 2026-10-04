#!/usr/bin/env python3
"""Extend the approved vector lettering with Tracing; no font substitution."""
import json
from pathlib import Path
from shapely.geometry import Polygon, box
from shapely.ops import unary_union
from shapely.affinity import translate, scale

root = Path(__file__).parent
art = json.loads((root/'approved-rounded-title.json').read_text())
def contour(word,index):
    return Polygon(art['words'][word]['paths'][index]).buffer(0)
def outline(shape):
    return shape.buffer(10,quad_segs=12).difference(shape)
def move(shape,x):
    return translate(shape,xoff=x-shape.bounds[0])
letters = {}
letters['r'] = contour('Coloring',3)
letters['a'] = contour('VinMat',3).difference(contour('VinMat',4))
letters['c'] = translate(scale(contour('Coloring',16),xfact=.72,yfact=.72,origin=(0,0)),yoff=72)
letters['i'] = unary_union([contour('Coloring',2),contour('Coloring',14)])
letters['n'] = contour('Coloring',4)
letters['g'] = contour('Coloring',11).difference(contour('Coloring',12))
# Rounded capital T uses the same cap height, stroke and soft corners.
top = box(32,22,163,53).buffer(12,quad_segs=12)
stem = Polygon([(80,45),(121,45),(123,221),(117,242),(103,249),(88,245),(78,231)]).buffer(-8).buffer(8,quad_segs=12)
letters['T'] = unary_union([top,stem])
paths, x = [], 0
for letter in 'Tracing':
    black = move(outline(letters[letter]),x)
    for poly in ([black] if black.geom_type=='Polygon' else black.geoms):
        paths.append([[round(a,3),round(b,3)] for a,b in poly.exterior.coords])
        paths.extend([[[round(a,3),round(b,3)] for a,b in ring.coords] for ring in poly.interiors])
    x = black.bounds[2]+8
height = max(y for path in paths for _,y in path)
art['words']['Tracing'] = dict(width=round(x-8,3),height=round(height,3),paths=paths)
art['tracingSource'] = 'r/i/n/g and a reuse approved letter contours; c adapts the approved C; T is a matching rounded vector glyph.'
(root/'approved-rounded-title.json').write_text(json.dumps(art,separators=(',',':'))+'\n')
