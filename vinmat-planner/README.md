# VinMat Planner v2

Nahraj celou složku `vinmat-planner` do `worldforkids/`.

Předpokládaná struktura:

```text
worldforkids/
├── vinmat-planner/
│   ├── index.html
│   ├── styles.css
│   └── app.js
└── assets/data/
    ├── bludiste.csv
    ├── omalovanky.csv
    ├── spojovacky.csv
    └── obtahovacky.csv
```

Planner je pak dostupný na `/worldforkids/vinmat-planner/`.

## Automatická CSV

Cesty jsou v horní části `app.js` v konstantě `AUTO_CSV_SOURCES`. Neexistující budoucí soubory se přeskočí.

## Logika

- Plán se ukládá samostatně pro každý týden, měsíc, půlrok a rok.
- Skutečně publikované aktivity se počítají pouze z `datumPridani` v CSV.
- Level se načítá z `soubor`, například `lv3_gem_...`.
- Období bez plánu se v archivu zobrazí jako „Bez stanoveného plánu“.
- Týden je pondělí–neděle.
- Data plánů jsou v localStorage konkrétního prohlížeče; používej Export zálohy.


## Verze 2.1

- aktuální týden je po otevření uprostřed 52týdenního grafu,
- aktuální měsíc je uprostřed 60měsíčního grafu,
- aktuální období je jemně zvýrazněné,
- tlačítko Dnes vrátí graf na tuto vystředěnou pozici.


## Verze 2.2

- Automatický denní režim od 7:00 do 18:59 a noční režim od 19:00 do 6:59.
- Ruční přepnutí vzhledu se uloží do prohlížeče.
- Týdenní a měsíční graf mají nezávislé zapínání aktivit.
- Každý graf lze samostatně přepnout mezi skládaným a skupinovým zobrazením.
- Plány jsou uložené v localStorage pod klíčem `vinmatPlansV2`, nikoliv v souboru na GitHubu.
