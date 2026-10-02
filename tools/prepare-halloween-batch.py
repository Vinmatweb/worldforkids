#!/usr/bin/env python3
"""Prepare only the current registered batch, maximum three activity pairs."""
import csv, hashlib, importlib.util, json, re, shutil, sys
from pathlib import Path
from PIL import Image
import numpy as np
import zxingcpp

root = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location('brand', root/'tools/brand-printable.py')
brand = importlib.util.module_from_spec(spec)
spec.loader.exec_module(brand)
state = json.loads((root/'tools/halloween-active-batch.json').read_text())
assert 0 < len(state['items']) <= 3
out = Path('/tmp') / f"vinmat-halloween-batch-{state['batch']}"
out.mkdir(exist_ok=True)
csv_path = root/'assets/data/omalovanky.csv'
with csv_path.open() as stream:
    reader = csv.DictReader(stream)
    headers, rows = reader.fieldnames, list(reader)
ages = {1:'3–4', 2:'5–6', 3:'6–7', 4:'7–8', 5:'8–10'}
files, skipped = [], []
for item in state['items']:
    base = re.sub(r'H\d+', str(item['id']), item['originalBase'])
    level = int(base[2])
    row = dict(ID=str(item['id']),soubor=base,kategorie='svatky',podkategorie='halloween',datumPridani='2026-10-02',sezona='podzim,halloween',zamereni='jemna-motorika',assetDirectory='en',pdf='1')
    for lang,name in zip(['Cz','En','De','Es'],item['names']):
        row['nazev'+lang] = name
        row['alt'+lang+'_coloring'] = {'Cz':f'{name}: černobílá omalovánka LV{level} pro děti {ages[level]} let, zdarma k vytisknutí na A4.','En':f'{name}: black-and-white LV{level} coloring page for ages {ages[level]}, free to print on A4 paper.','De':f'{name}: schwarz-weißes Ausmalbild der Stufe {level} für Kinder von {ages[level]} Jahren, kostenlos auf A4 drucken.','Es':f'{name}: dibujo en blanco y negro de nivel {level} para niños de {ages[level]} años, gratis para imprimir en A4.'}[lang]
        row['alt'+lang+'_sample'] = {'Cz':f'{name}: barevný vzor k omalovánce LV{level}.','En':f'{name}: color sample for the LV{level} coloring page.','De':f'{name}: Farbvorlage zum Ausmalbild der Stufe {level}.','Es':f'{name}: modelo a color para el dibujo de nivel {level}.'}[lang]
    assert not any(r['soubor']==base for r in rows), f'Already published: {base}'
    item.update(base=base,row=row,level=level)
    rows.append(row)
    for variant in ['coloring','sample']:
        source = Path(item[variant+'Local'])
        target = out/(base+'-'+variant)
        heading = 'VinMat Coloring'+(' - Sample' if variant=='sample' else '')
        with Image.open(source) as image:
            dimensions = image.size
            placement = brand.place_title(image,heading)
        if not placement:
            skipped.append({'id':item['id'],'variant':variant,'reason':'No blank area for title without covering artwork'})
        brand.compose(source,target,item['names'][1]+(' - Color Sample' if variant=='sample' else ' - Coloring Page'),heading)
        with Image.open(target.with_suffix('.png')) as image:
            image.load()
            assert image.size==dimensions
            assert any(code.text==brand.URL for code in zxingcpp.read_barcodes(np.asarray(image.convert('RGB'))))
        for ext in ['png','pdf','webp']:
            file=target.with_suffix('.'+ext)
            data=file.read_bytes()
            dest=root/'public/omalovanky/en'/file.name
            temp=dest.with_suffix(dest.suffix+'.ready')
            shutil.copyfile(file,temp)
            temp.replace(dest)
            files.append({'file':str(file),'path':str(dest.relative_to(root)),'bytes':len(data),'sha':hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest(),'id':item['id'],'variant':variant,'ext':ext,'driveId':item[variant]['id'] if ext=='png' else None,'placement':placement})
with csv_path.open('w',newline='') as stream:
    writer=csv.DictWriter(stream,headers,lineterminator='\n');writer.writeheader();writer.writerows(rows)
state.update(files=files,skipped=skipped,state='prepared')
(root/'tools/halloween-active-batch.json').write_text(json.dumps(state,ensure_ascii=False,indent=2)+'\n')
(out/'manifest.json').write_text(json.dumps(files))
proof=Image.new('RGB',(1500,1416),'#eee')
for i,item in enumerate(state['items']):
    for j,variant in enumerate(['coloring','sample']):
        with Image.open(out/(item['base']+'-'+variant+'.png')) as image:
            image.thumbnail((480,680));proof.paste(image,(10+500*i,10+708*j))
proof.save(str(out/'proof.png'))
print(json.dumps({'batch':state['batch'],'prepared':len(state['items']),'skippedTitles':skipped}))
