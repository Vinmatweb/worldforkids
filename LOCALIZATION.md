# Lokalizace a statický katalog

## Co je zdroj pravdy

- `assets/data/bludiste.csv`, `assets/data/omalovanky.csv`, `assets/data/spojovacky.csv` obsahují aktivity, názvy a ALT texty pro EN/CZ.
- `public/` nyní obsahuje dosavadní PNG a WEBP pracovní listy. Ty se zatím
  nepřesouvají, aby se nekřížily s připravovaným brandingem pracovních listů.
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

## Připravená struktura obrázků

Jazykové složky jsou už založené pro `en`, `cs`, `de` a `es` v každé kategorii.
Do nich se budou obrázky ukládat až při jejich vytvoření v této podobě:

```text
public/bludiste/cs/bludiste-mravenec/bludiste-mravenec-cs-colored.webp
public/bludiste/cs/bludiste-mravenec/bludiste-mravenec-cs-colored.png
public/bludiste/en/maze-ant/maze-ant-en-colored.webp
```

- `cs` je technický jazykový kód (v přepínači se stále zobrazuje **CZ**).
- Název vždy obsahuje jazykový kód, i když je zároveň v jazykové složce.
- `colored`, `coloring` a `partly_colored` zůstávají jednotnými technickými
  názvy variant; před nimi je vždy lokalizovaný slug aktivity.
- Po dohodnutí výstupu brandingového procesu se jednorázově upraví generátor a
  odkazy na obrázky; do té doby web používá stávající cesty.

## URL aktivit

URL má formát `aktivita-motiv`, například `maze-ant.html` a
`bludiste-mravenec.html`. Pokud se stejný motiv opakuje ve více levelech,
skript přidá level až za motiv, například `coloring-teddy-bear-lv2.html`.
To zachová čitelnost adres a zároveň jejich jedinečnost.

## Přidání dalšího jazyka

1. Přidej jazyk do konfigurace v `assets/js/site-config.js` a do generátoru.
2. Doplň názvy, ALT texty a lokální slugy do dat aktivit.
3. Připrav přeložené průvodce v příslušné jazykové složce a obrázky ve stejné
   jazykové větvi v `public/`.
4. Spusť generátor; vytvoří statické stránky, `hreflang` a sitemap.
