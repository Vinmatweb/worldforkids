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
