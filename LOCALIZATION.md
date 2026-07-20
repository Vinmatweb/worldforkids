# Lokalizace a statický katalog

## Co je zdroj pravdy

- `assets/data/bludiste.csv`, `assets/data/omalovanky.csv`, `assets/data/spojovacky.csv` obsahují aktivity, názvy a ALT texty pro EN/CZ.
- `public/` obsahuje PNG a WEBP pracovní listy. Struktura se nemění.
- `scripts/build-static-site.mjs` vytváří statické výstupy.

## Generování

Po změně CSV spusť v kořeni projektu:

```bash
npm run build:static
```

Skript automaticky vytvoří nebo aktualizuje:

- statické karty v `index.html` a `cs/index.html`,
- EN detailní stránky v `activities/`,
- CZ detailní stránky v `cs/aktivity/`,
- CZ kopie existujících průvodců v `cs/`,
- `sitemap.xml`.

GitHub Actions provede stejný krok automaticky po změně CSV nebo generátoru.

## URL aktivit

URL má formát `aktivita-motiv`, například `maze-ant.html` a
`bludiste-mravenec.html`. Pokud se stejný motiv opakuje ve více levelech,
skript přidá level až za motiv, například `coloring-teddy-bear-lv2.html`.
To zachová čitelnost adres a zároveň jejich jedinečnost.

## Přidání dalšího jazyka

1. Přidej jazyk do konfigurace v `assets/js/site-config.js` a do generátoru.
2. Doplň názvy, ALT texty a lokální slugy do dat aktivit.
3. Připrav přeložené průvodce v příslušné jazykové složce.
4. Spusť generátor; vytvoří statické stránky, `hreflang` a sitemap.
