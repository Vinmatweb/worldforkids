# Mezinárodní dny – izolovaná preview sekce

## Bezpečnost nasazení
- Pracovní větev: `preview/international-days-2026`, mimo `main`. Nemergovat během kontroly AdSense.
- Neměnit `index.html` W4K, navigaci, `sitemap.xml`, `robots.txt`, existující workflows ani žádnou ostrou publikaci.
- Nové HTML neobsahuje AdSense ani Google Analytics, mají `noindex,follow`.
- **Zatím nejsou spuštěné žádné automatické GitHub Pages**; samostatnou GitHub preview adresu je potřeba zřídit odděleně, ideálně v novém bezpečném preview repozitáři bez vlastní domény. Neaktivovat Pages v existujícím W4K repozitáři bez potvrzení vztahu k ostrému provozu.

## Souborová struktura
- `id/index.html`: kalendář měsíce / týdne / dne; základní vzhled W4K.
- `id/irbis/index.html`: odborně podložený detail levharta sněžného.
- `id/assets/style.css`: sdílený design bez kopírování původních stylů.
- `id/assets/calendar.js`: přepínání pohledů, dne, organizace a statusu.
- `id/assets/activities.js`: načtení aktivit přiřazených do kolekce.
- `id/assets/irbis-range.svg`: schéma horských oblastí, nikoli přesná distribuční mapa.
- `id/data/events.json`: datum/opakování, instituce, kategorie, ověřující zdroj, URL detailu a status.
- `id/data/activities.json`: přiřazení ke kolekcím bez kopírování existujících materiálů.

## Aktivity
`activities.json` zatím obsahuje `activities: []`, protože v ověřených souborech tohoto repozitáře není publikovaný materiál o irbisovi. Nová aktivita musí mít skutečný náhled, funkční URL, kategorii, úroveň, příznak `verified: true` a `collectionIds: ["international-days-snow-leopard"]`. Jedna aktivita může současně patřit do běžné kategorie a několika kolekcí, nejsou potřeba duplikované soubory.

## URL a hosting
Dnešní repo je publikované pod `/worldforkids/`. Zde připravované soubory jsou relativní, takže je lze bez úprav použít i na samostatné GitHub Pages preview, např. pod `/id/`. Uživatelem požadované budoucí adresy:
- `https://vinmat.eu/w4k/id/`
- `https://vinmat.eu/w4k/id/irbis/`

Tyto adresy vyžadují **samostatné přesměrování/rewrite na produkčním hostingu** teprve po schválení AdSense; samotný repo `worldforkids` nemůže rozhodnout o URL aliasu `/w4k/` v kořeni domény. QR kódy zatím nevytvářet.

## Lokální ověření
```bash
python3 -m http.server 8080
# http://localhost:8080/id/
# http://localhost:8080/id/irbis/
```

Prověřit na šířkách 375px a 1440px kalendář měsíc/týden/den, navigaci šipkami, tlačítko Dnes, filtr Naturewatch a OSN, možnost vybrat konkrétní den i detail 23. 10., mobilní layout a načtení externích zdrojů. Nepřidávat aktuální větev do produkčního buildu a sitemap.
