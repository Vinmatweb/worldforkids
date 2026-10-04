import concurrent.futures,csv,hashlib,io,json,re,time,urllib.request
from pathlib import Path
from urllib.parse import urljoin
ROOT=Path(__file__).resolve().parents[1]
BASE='https://vinmat.eu/worldforkids/'
state=json.loads((ROOT/'tools/tracing-import-state.json').read_text())
def get(relative):
    for attempt in range(3):
        try:
            with urllib.request.urlopen(urljoin(BASE,relative),timeout=45) as r:
                assert r.status==200
                return r.read()
        except (OSError,TimeoutError):
            if attempt==2:raise
            time.sleep(1)
def check_file(f):
    b=get(f['path']);assert len(b)==f['bytes'],f['path']
    assert hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()==f['sha'],f['path']
    return f['path']
files=[f for i in state['items'] for f in i['files']]
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:verified=list(pool.map(check_file,files))
print(f'Public asset SHA/size checks passed: {len(verified)}',flush=True)
rows=list(csv.DictReader(io.StringIO(get('assets/data/obtahovacky.csv').decode())))
assert len(rows)==17 and len({r['soubor'] for r in rows})==17
assert {r['soubor']:r['ID'] for r in rows}=={i['fileBase']:i['motifId'] for i in state['items']}
pages=[]
for folder,prefix in [('activities','tracing-'),('cs/aktivity','obtahovacka-'),('de/aktivitaeten','nachzeichnen-'),('es/actividades','trazado-')]:
    found=list((ROOT/folder).glob(prefix+'*.html'));assert len(found)==17,(folder,len(found));pages.extend(found)
samples={r['sampleBase'] for r in rows}
def check_page(p):
    html=get(str(p.relative_to(ROOT))).decode()
    assert 'id="activity-pdf"' in html and 'id="activity-png"' in html
    assert any(s in html for s in samples),str(p)
    for lang in ['en','cs','de','es']:assert 'hreflang="'+lang+'"' in html,str(p)
    return str(p.relative_to(ROOT))
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:page_checks=list(pool.map(check_page,pages))
print(f'Localized tracing pages passed: {len(page_checks)}',flush=True)
for prefix in ['', 'cs/', 'de/', 'es/']:
    html=get(prefix+'index.html').decode()
    assert 'motifId:String(row.ID' in html and 'modal-related-activities' in html and 'sampleBase: row.sampleBase' in html
    assert 'related-activities.js' in html and 'data-empty-tracing-category' not in html
assert 'Also available as' in get('assets/js/related-activities.js').decode()
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:list(pool.map(get,[s+'.'+ext for s in samples for ext in ['png','pdf']]))
result={'assets':len(verified),'localizedPages':len(page_checks),'csvRows':len(rows),'localizedIndexes':4,'sharedSamples':len(samples),'result':'passed'}
(ROOT/'tools/tracing-public-verification.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result),flush=True)
