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
- 3 informační karty LV2–LV4, každá černobíle i barevně; české verze.
- Aktivity nesou zdrojové ID souboru, úroveň, kategorii, jazyk a kolekci. Odkaz na Etsy není přidán.

Obtahovačky nalezené ve složce jsou pojmenované „ke kontrole“ a doprovodný přehled označuje všech 9 návrhů jako neschválené; proto nejsou zobrazené jako hotové listy. Složka `Příběh` se při kontrole jeví prázdná, takže příběhové omalovánky, vzory ani šest příběhových obtahovaček zatím nemají funkční odkazy v tomto preview.

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
