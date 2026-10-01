"""Zostaví index.html + style.css s cache bustingom (?v=hash) a galériou z galeria.json."""
import hashlib, json
from pathlib import Path
D = Path(__file__).parent
NAZOV = {'zahrady': 'Zimná záhrada', 'bazeny': 'Prekrytie bazéna', 'pristresky': 'Prístrešok'}
# pre pekné poradie premiešame kategórie (záhrada, bazén, prístrešok, …)
meta = json.load(open(D / 'galeria.json'))
po_kat = {}
for n, (k, *_rest) in meta.items(): po_kat.setdefault(k, []).append(n)
poradie = []
while any(po_kat.values()):
    for k in ('zahrady', 'bazeny', 'pristresky'):
        if po_kat.get(k): poradie.append(po_kat[k].pop(0))
gal = '\n'.join(
    f'      <figure class="gi" data-k="{meta[n][0]}" data-full="img/g-{n}.jpg"><img src="img/t-{n}.jpg" alt="{NAZOV[meta[n][0]]} – realizácia" loading="lazy" width="{meta[n][2][0]}" height="{meta[n][2][1]}"><figcaption>{NAZOV[meta[n][0]]}</figcaption></figure>'
    for n in poradie)
css = (D / 'fonts/fonts.css').read_text() + '\n' + (D / 'style.src.css').read_text()
(D / 'style.css').write_text(css)
h = lambda b: hashlib.md5(b).hexdigest()[:8]
html = (D / 'src.html').read_text().replace('{{galeria}}', gal)
html = html.replace('{{css}}', h(css.encode())).replace('{{js}}', h((D / 'main.js').read_bytes()))
(D / 'index.html').write_text(html)
print('ok', len(poradie), 'fotiek v galérii')
