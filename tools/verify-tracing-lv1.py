"""Verify only the eight newly imported LV1 worksheets and their variants."""
import concurrent.futures, csv, hashlib, io, json, re, sys, urllib.request
from pathlib import Path
from PIL import Image
import numpy as np
import zxingcpp
ROOT = Path(__file__).resolve().parents[1]
state = json.loads((ROOT/'tools/tracing-lv1-import-state.json').read_text())
live = '--live' in sys.argv
def get(path):
    if not live: return (ROOT/path).read_bytes()
    with urllib.request.urlopen('https://vinmat.eu/worldforkids/'+path, timeout=45) as r:
        assert r.status == 200
        return r.read()
rows = list(csv.DictReader(io.StringIO(get('assets/data/obtahovacky.csv').decode())))
colors = list(csv.DictReader(io.StringIO(get('assets/data/omalovanky.csv').decode())))
assert len(state['items']) == 8
paths = []
for item in state['items']:
    row = next(r for r in rows if r['soubor'] == item['fileBase'])
    color = next(r for r in colors if r['soubor'] == item['coloringBase'])
    assert row == item['tracingRow']
    assert row['soubor'].startswith('lv1_') and row['ID'] == color['ID']
    assert row['soubor'].split('_')[3] == color['soubor'].split('_')[3]
    assert row['sampleBase'].endswith(color['soubor']+'-sample')
    assert row['previewBase'].endswith('-preview')
    for lang in ['En','Cz','De','Es']:
        assert row['nazev'+lang] == color['nazev'+lang]
        assert '3–4' in row['alt'+lang+'_coloring']
    if not live:
        original = Image.open(item['sourceLocal']).convert('RGB')
        preview = Image.open(ROOT/(row['previewBase'].removeprefix('/worldforkids/')+'.png')).convert('RGB')
        assert original.size == preview.size and original.tobytes() == preview.tobytes()
        printed = Image.open(ROOT/(item['files'][0]['path'])).convert('RGB')
        assert any(q.text == 'https://vinmat.eu/w4k' for q in zxingcpp.read_barcodes(np.asarray(printed)))
    paths.extend(item['files'])
    for base in [row['sampleBase'],row['samplePreviewBase']]:
        for ext in (['png','pdf','webp'] if base == row['sampleBase'] else ['png','webp']):
            p=ROOT/(base.removeprefix('/worldforkids/')+'.'+ext)
            data=p.read_bytes()
            paths.append({'path':str(p.relative_to(ROOT)), 'bytes':len(data),'sha':hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()})
def verify_file(f):
    b=get(f['path'])
    assert len(b)==f['bytes'] and hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()==f['sha'], f['path']
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool: list(pool.map(verify_file,{f['path']:f for f in paths}.values()))
print('PASS: 8 LV1 worksheets, exact source previews, matching samples, branding and drawing-variant pairs.', flush=True)
if live:
    pages=[]
    for folder,prefix in [('activities','tracing-'),('cs/aktivity','obtahovacka-'),('de/aktivitaeten','nachzeichnen-'),('es/actividades','trazado-')]:
        found=[p for p in (ROOT/folder).glob(prefix+'*.html') if any(i['fileBase'] in p.read_text() for i in state['items'])]
        assert len(found)==8,(folder,len(found))
        pages.extend(found)
    def verify_page(p):
        html=get(str(p.relative_to(ROOT))).decode()
        item=next(i for i in state['items'] if i['fileBase'] in html)
        assert 'id="activity-pdf"' in html and 'id="activity-png"' in html
        assert item['tracingRow']['sampleBase'] in html and item['tracingRow']['previewBase'] in html
        return str(p.relative_to(ROOT))
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool: verified=list(pool.map(verify_page,pages))
    result={'result':'passed','worksheets':8,'localizedWorksheetPages':len(verified),'assets':len({f['path'] for f in paths}),'scope':'New LV1 worksheets only'}
    (ROOT/'tools/tracing-lv1-verification.json').write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps(result),flush=True)
