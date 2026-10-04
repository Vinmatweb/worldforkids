#!/usr/bin/env python3
import concurrent.futures,csv,hashlib,io,json,sys,time,urllib.request
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parent.parent
state=json.loads((root/'tools/tracing-correction-state.json').read_text())
files=[f for item in state['items'] for f in item['files']]
def sha(data):
    return hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
def local(f):
    path=root/f['path']
    if path.stat().st_size==0 and path.suffix=='.webp':
        # Reconstruct an interrupted encoding from the untouched preview PNG.
        png=path.with_suffix('.png')
        if '-preview' not in path.stem:
            png=path.with_name(path.stem+'-preview.png')
        with Image.open(png) as image:image.save(path,'WEBP',quality=92,method=6)
    data=path.read_bytes()
    assert len(data)==f['bytes'] and sha(data)==f['sha'],f['path']
def public(f):
    for attempt in range(3):
        try:
            with urllib.request.urlopen('https://vinmat.eu/worldforkids/'+f['path'],timeout=45) as r:data=r.read()
            assert len(data)==f['bytes'] and sha(data)==f['sha'],f['path']
            return
        except Exception:
            if attempt==2:raise
            time.sleep(1)
for file in files:local(file)
print('Local correction assets verified:',len(files),flush=True)
if '--public' in sys.argv:
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:list(pool.map(public,files))
    def get(path):
        with urllib.request.urlopen('https://vinmat.eu/worldforkids/'+path,timeout=45) as response:return response.read().decode()
    rows=list(csv.DictReader(io.StringIO(get('assets/data/obtahovacky.csv'))))
    assert len(rows)==17
    for item in state['items']:
        row=next(r for r in rows if r['soubor']==item['fileBase'])
        assert row['previewBase']==item['previewBase'] and row['samplePreviewBase']==item['samplePreviewBase']
    pages=[]
    for folder,prefix in [('activities','tracing-'),('cs/aktivity','obtahovacka-'),('de/aktivitaeten','nachzeichnen-'),('es/actividades','trazado-')]:
        pages.extend(str(p.relative_to(root)) for p in (root/folder).glob(prefix+'*.html'))
    assert len(pages)==68
    def check_page(path):
        html=get(path)
        assert 'class="activity-screen-picture"' in html and 'class="activity-print-original"' in html,path
        assert 'selected.preview' in html and 'selected.base' in html,path
        assert 'activity-screen-picture { display: none !important; }' in html,path
        assert '-preview.webp' in html and '-sample-preview' in html,path
        assert 'id="activity-png"' in html and 'id="activity-pdf"' in html,path
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:list(pool.map(check_page,pages))
    for prefix in ['', 'cs/', 'de/', 'es/']:
        html=get(prefix+'index.html')
        assert 'function ziskejCestuNahledu(' in html and 'previewBase: row.previewBase' in html,prefix
        assert 'obrazekHTML(ziskejCestuNahledu(p,aktivniModalVerze)' in html,prefix
    result=dict(result='passed',items=len(state['items']),assets=len(files),unbrandedPreviewPairs=2*len(state['items']),localizedPages=len(pages),localizedIndexes=4)
    (root/'tools/tracing-correction-verification.json').write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps(result),flush=True)
