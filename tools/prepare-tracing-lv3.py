#!/usr/bin/env python3
"""Prepare approved LV3 source drawings with matching shared samples."""
import csv,hashlib,importlib.util,json,re,shutil,sys
from pathlib import Path
from PIL import Image
import numpy as np
import zxingcpp
root=Path(__file__).resolve().parent.parent
work=root.parent
sources=json.loads((work/'lv3-local-sources.json').read_text())
samples=json.loads((work/'lv3-local-samples.json').read_text())
spec=importlib.util.spec_from_file_location('brand',root/'tools/brand-printable.py')
brand=importlib.util.module_from_spec(spec);spec.loader.exec_module(brand)
def read(file):
    with file.open() as f:
        r=csv.DictReader(f);return r.fieldnames,list(r)
headers,colors=read(root/'assets/data/omalovanky.csv')
trace_headers,traces=read(root/'assets/data/obtahovacky.csv')
new_names={
 '10193_1':['Čarodějnice nad podzimní vesnicí u měsíce','Witch Flying over an Autumn Village by the Moon','Hexe über einem Herbstdorf beim Mond','Bruja sobre un pueblo otoñal junto a la luna'],
 '10193_2':['Čarodějnice nad podzimní vesnicí mezi hvězdami','Witch Flying over an Autumn Village among Stars','Hexe über einem Herbstdorf unter Sternen','Bruja sobre un pueblo otoñal entre estrellas'],
 '10195_1':['Drak držící dýni v podzimní zahradě','Dragon Holding a Pumpkin in an Autumn Garden','Drache mit einem Kürbis in den Händen im Herbstgarten','Dragón sosteniendo una calabaza en un jardín otoñal'],
 '10195_2':['Drak u dýně v podzimní zahradě','Dragon beside a Pumpkin in an Autumn Garden','Drache neben einem Kürbis im Herbstgarten','Dragón junto a una calabaza en un jardín otoñal']
}
for row in colors:
    m=re.match(r'lv3_[^_]+_(\d+_\d+)_',row['soubor'])
    if m and m[1] in new_names:
        for lang,new in zip(['Cz','En','De','Es'],new_names[m[1]]):
            old=row['nazev'+lang]
            for k in row:
                if (k=='nazev'+lang or k.startswith('alt'+lang)) and row[k]:
                    row[k]=row[k].replace(old,new)
items=[]
proof=Image.new('RGB',(1800,2460),'#eee')
for i,source in enumerate(sources):
    match=re.match(r'lv3_[^_]+_[^_]+_(\d+)_(en-.+)-tracing-coloring.png$',source['title'])
    assert match,source['title']
    version,suffix=match.groups()
    color=next(r for r in colors if r['soubor'].startswith('lv3_') and '_en-' in r['soubor'] and r['soubor'].split('_')[3]==version and r['soubor'].split('_en-',1)[1]==suffix[3:]+'-coloring-page')
    base=color['soubor'].replace('-coloring-page','-tracing')
    sample=next(s for s in samples if s['title']==source['title'].replace('-tracing-coloring.png','-coloring-page-sample.png'))
    target=root/'public/obtahovacky/en'/(base+'-coloring')
    print_source=Path(source['local'])
    placement=brand.place_title(Image.open(print_source),'VinMat Tracing')
    if not placement:
        # Reserve a clean header/footer on dense sheets; retain the full illustration.
        original=Image.open(print_source).convert('RGB')
        canvas=Image.new('RGB',original.size,'white')
        top=round(original.height*22/297);bottom=round(original.height*22/297)
        drawing=original.copy();drawing.thumbnail((original.width,original.height-top-bottom),Image.Resampling.LANCZOS)
        canvas.paste(drawing,((original.width-drawing.width)//2,top))
        print_source=work/(base+'-print-layout.png');canvas.save(print_source)
    brand.compose(print_source,target,color['nazevEn']+' - Tracing','VinMat Tracing')
    with Image.open(target.with_suffix('.png')) as im:
        assert any(q.text==brand.URL for q in zxingcpp.read_barcodes(np.asarray(im.convert('RGB')))),base
        thumb=im.copy();thumb.thumbnail((300,410));proof.paste(thumb,((i%6)*300,(i//6)*820))
    placement=brand.place_title(Image.open(print_source),'VinMat Tracing')
    assert placement,base+' has no title space'
    trace_preview=Path(str(target)+'-preview')
    sample_preview=root/'public/omalovanky/en'/(color['soubor']+'-sample-preview')
    for src,dst in [(source['local'],trace_preview),(sample['local'],sample_preview)]:
        shutil.copyfile(src,dst.with_suffix('.png'))
        with Image.open(src) as im:
            im.save(dst.with_suffix('.webp'),'WEBP',quality=92,method=6)
            assert Image.open(dst.with_suffix('.png')).tobytes()==im.tobytes()
    im=Image.open(source['local']).convert('RGB');im.thumbnail((300,410));proof.paste(im,((i%6)*300,(i//6)*820+410))
    row={key:color.get(key,'') for key in trace_headers}
    row.update(soubor=base,datumPridani='2026-10-05',assetDirectory='en',pdf='1',sampleBase='/worldforkids/public/omalovanky/en/'+color['soubor']+'-sample',previewBase='/worldforkids/'+str(trace_preview.relative_to(root)),samplePreviewBase='/worldforkids/'+str(sample_preview.relative_to(root)))
    for lang,template in {
      'Cz':': obtahovačka LV3 s tenkými šedými vodicími čarami pro děti 7–9 let, zdarma k vytisknutí na A4.',
      'En':': LV3 tracing worksheet with thin gray guide lines for ages 7–9, free to print on A4 paper.',
      'De':': Nachspurblatt der Stufe 3 mit dünnen grauen Hilfslinien für Kinder von 7–9 Jahren, kostenlos auf A4 drucken.',
      'Es':': ficha de trazado de nivel 3 con líneas guía grises finas para niños de 7–9 años, gratis para imprimir en A4.'
    }.items():row['alt'+lang+'_coloring']=color['nazev'+lang]+template
    traces=[r for r in traces if r['soubor']!=base]+[row]
    paths=[target.with_suffix('.'+ext) for ext in ['png','pdf','webp']]+[p.with_suffix('.'+ext) for p in [trace_preview,sample_preview] for ext in ['png','webp']]
    manifests=[]
    for p in paths:
        data=p.read_bytes();manifests.append({'path':str(p.relative_to(root)),'bytes':len(data),'sha':hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()})
    items.append({'fileBase':base,'motifId':color['ID'],'coloringBase':color['soubor'],'sourceId':source['id'],'sourceLocal':source['local'],'sampleSourceId':sample['id'],'titlePlacement':placement,'tracingRow':row,'files':manifests})
for file,h,rows in [(root/'assets/data/omalovanky.csv',headers,colors),(root/'assets/data/obtahovacky.csv',trace_headers,traces)]:
    with file.open('w',newline='') as f:
        w=csv.DictWriter(f,h,lineterminator='\n');w.writeheader();w.writerows(rows)
state={'state':'prepared','items':items,'count':len(items),'rule':'Related activities match motif ID plus drawing variant'}
(root/'tools/tracing-lv3-import-state.json').write_text(json.dumps(state,ensure_ascii=False,indent=2)+'\n')
proof.save(work/'lv3-branded-proof.jpg')
print('PREPARED',len(items),'LV3 tracing worksheets')
