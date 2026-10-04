#!/usr/bin/env python3
"""Rebuild at most three tracing sheets from preserved Drive originals."""
import csv,hashlib,importlib.util,json,re,shutil,sys
from pathlib import Path
from PIL import Image
import numpy as np
import zxingcpp
root=Path(__file__).resolve().parent.parent
spec=importlib.util.spec_from_file_location('brand',root/'tools/brand-printable.py')
brand=importlib.util.module_from_spec(spec);spec.loader.exec_module(brand)
sources=json.loads((root/'tools/tracing-original-sources.json').read_text())
state_path=root/'tools/tracing-correction-state.json'
state=json.loads(state_path.read_text()) if state_path.exists() else dict(state='in-progress',items=[],batches=[])
published=json.loads((root/'tools/tracing-import-state.json').read_text())['items']
start=int(sys.argv[1]);items=published[start:start+3];assert 0<len(items)<=3
csv_path=root/'assets/data/obtahovacky.csv'
with csv_path.open() as f:
    reader=csv.DictReader(f);headers=reader.fieldnames;rows=list(reader)
for field in ['previewBase','samplePreviewBase']:
    if field not in headers:headers.append(field)
proof=Image.new('RGB',(len(items)*480,1360),'#eee')
for index,item in enumerate(items):
    suffix=item['fileBase'].split('_en-',1)[1]
    version=item['fileBase'].split('_')[3]
    source=next(s for s in sources if s['title'].split('_')[3]==version and s['title'].split('_en-',1)[1].replace('-tracing-page-tracing.png','-tracing')==suffix)
    target=root/'public/obtahovacky/en'/(item['fileBase']+'-coloring')
    brand.compose(source['local'],target,item['tracingRow']['nazevEn']+' - Tracing','VinMat Tracing')
    with Image.open(target.with_suffix('.png')) as img:
        assert any(c.text==brand.URL for c in zxingcpp.read_barcodes(np.asarray(img.convert('RGB'))))
        small=img.copy();small.thumbnail((470,660));proof.paste(small,(480*index,0))
    paths=[target.with_suffix('.'+ext) for ext in ['png','pdf','webp']]
    previews={}
    for kind,local,base in [('coloring',source['local'],target),('sample',source['sampleLocal'],root/'public/omalovanky/en'/(item['coloringBase']+'-sample'))]:
        preview=Path(str(base)+'-preview');previews[kind]='/worldforkids/'+str(preview.relative_to(root))
        png=preview.with_suffix('.png');shutil.copyfile(local,png)
        with Image.open(local) as original:
            original.save(preview.with_suffix('.webp'),'WEBP',quality=92,method=6)
            assert Image.open(png).tobytes()==original.tobytes()
            if kind=='coloring':
                small=original.copy();small.thumbnail((470,660));proof.paste(small,(480*index,680))
        paths.extend([png,preview.with_suffix('.webp')])
    row=next(r for r in rows if r['soubor']==item['fileBase'])
    row['previewBase']=previews['coloring'];row['samplePreviewBase']=previews['sample']
    manifest=[]
    for path in paths:
        data=path.read_bytes();assert len(data)>1024
        old=next((f for f in item['files'] if f['path']==str(path.relative_to(root))),{})
        manifest.append(dict(path=str(path.relative_to(root)),bytes=len(data),sha=hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest(),driveId=old.get('driveId')))
    record=dict(fileBase=item['fileBase'],motifId=item['motifId'],sourceId=source['id'],sampleSourceId=source['sample']['id'],previewBase=previews['coloring'],samplePreviewBase=previews['sample'],files=manifest,state='prepared')
    state['items']=[i for i in state['items'] if i['fileBase']!=item['fileBase']]+[record]
with csv_path.open('w',newline='') as f:
    writer=csv.DictWriter(f,headers,lineterminator='\n');writer.writeheader();writer.writerows(rows)
state_path.write_text(json.dumps(state,ensure_ascii=False,indent=2)+'\n')
proof.save('/tmp/tracing-correction-proof.png')
print(json.dumps(dict(prepared=[i['fileBase'] for i in items],total=len(state['items']))))
