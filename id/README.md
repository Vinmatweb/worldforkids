# Mezinárodní dny – izolovaná preview sekce

## Bezpečnost nasazení
- Pracovní větev: `preview/international-days-2026`, mimo `main`. Nemergovat během kontroly AdSense.
- Neměnit `index.html` W4K, navigaci, `sitemap.xml`, `robots.txt`, existující workflows ani žádnou ostrou publikaci.
- Nové HTML neobsahuje AdSense ani Google Analytics, mají `noindex,follow`.
- Žádné automatické GitHub Pages v produkčním repozitáři; samostatná preview URL se zřizuje odděleně bez vlastní domény.

## Stránky
- `id/index.html`: kalendář měsíce / týdne / dne, filtry, navigace.
- `id/irbis/index.html`: informace o levhartovi sněžném, zdroje a aktivity.
- `id/assets/style.css`: sjednocené styly.
- `id/assets/calendar.js`: pohledy a filtrování.
- `id/assets/activities.js`: vykreslení aktivit podle kategorie a kolekce.
- `id/assets/irbis-range.svg`: schematická mapka, nikoli přesná distribuční mapa.
- `id/data/events.json`: data událostí a ověřovací zdroje.
- `id/data/activities.json`: vazby na materiály a kolekce; soubory aktivit se neopakují.

## Dostupné podklady o irbisovi
V této větvi jsou převzaté původní soubory z poskytnuté složky:
- 5 omalovánek LV1–LV5 a 5 barevných vzorů.
- 12 příběhových omalovánek a 12 barevných vzorů, vystavených jako samostatné díly; krátké texty se doplní následně.
- 3 informační karty LV2–LV4, každá černobíle i barevně; české verze.
- Aktivity nesou zdrojové ID souboru, úroveň, kategorii, jazyk a kolekci. Odkaz na Etsy není přidán.

Všechny 9 obtahovaček jsou v podkladech označeny „ke kontrole“ a přehled výslovně říká, že žádná není schválena jako finální tiskový list. Proto zatím nejsou zobrazené jako hotové aktivity.

## Budoucí krátké adresy
- `https://vinmat.eu/w4k/id/`
- `https://vinmat.eu/w4k/id/irbis/`

Vyžadují samostatné směrování na produkčním hostingu až po dokončení kontroly AdSense. Novou sekci nyní nepřidávat do hlavní navigace ani sitemap. Zatím nevytvářet QR kód.

## Lokální ověření
```bash
python3 -m http.server 8080
# http://localhost:8080/id/
# http://localhost:8080/id/irbis/
```
