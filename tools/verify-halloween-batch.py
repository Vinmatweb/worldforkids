#!/usr/bin/env python3
"""Verify deployed activity pages and exact binary assets for one small batch."""
import concurrent.futures, csv, hashlib, io, json, urllib.request
from pathlib import Path

root=Path(__file__).resolve().parent.parent
state=json.loads((root/'tools/halloween-active-batch.json').read_text())
base='https://vinmat.eu/worldforkids/'
def get(path):
    with urllib.request.urlopen(base+path,timeout=40) as response:
        assert response.status==200
        return response.read()
def verify_asset(f):
    data=get(f['path'])
    assert len(data)==f['bytes'], f['path']
    assert hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()==f['sha'], f['path']
    return f['path']
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
    assets=list(pool.map(verify_asset,state['files']))
pages=[]
for item in state['items']:
    matches=[]
    for directory in ['activities','cs/aktivity','de/aktivitaeten','es/actividades']:
        found=[p for p in (root/directory).glob('*.html') if item['base']+'-coloring.png' in p.read_text()]
        assert len(found)==1,(item['base'],directory,found)
        matches.extend(found)
    for p in matches:
        path=str(p.relative_to(root))
        html=get(path).decode()
        assert item['base']+'-coloring.png' in html
        assert item['base']+'-sample' in html and 'data-variant="sample"' in html
        assert "selected.base+'.png'" in html and "selected.base+'.pdf'" in html
        assert 'rel="canonical"' in html
        assert all('hreflang="'+lang+'"' in html for lang in ['en','cs','de','es'])
        assert '<h1' in html and 'activity-png' in html and 'activity-pdf' in html
        pages.append(path)
revision=hashlib.sha256((root/'assets/data/omalovanky.csv').read_bytes()).hexdigest()[:12]
rows=list(csv.DictReader(io.StringIO(get('assets/data/omalovanky.csv?v='+revision).decode('utf-8-sig'))))
for item in state['items']:
    assert sum(r['soubor']==item['base'] for r in rows)==1
assert len({r['soubor'] for r in rows})==len(rows)
result={'batch':state['batch'],'assets':len(assets),'pages':pages,'catalogRows':len(rows),'status':'passed'}
(root/'tools/halloween-active-verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(result,ensure_ascii=False))
