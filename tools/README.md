# Nástroje projektu VinMat's World for Kids

## update-headers.ps1

Skript sjednotí hlavičky všech EN a CZ stránek.

### Aktuální vzorové soubory

- EN hlavička: `guide-dot-to-dot.html`
- CZ hlavička: `cs/pruvodce-spojovacky.html`

Skript kopíruje pouze blok mezi:

```html
<!-- HEADER START -->
...
<!-- HEADER END -->
```

Každé cílové stránce zároveň nastaví správný odkaz na její jazykový protějšek.

### Spuštění

PowerShell otevři v kořeni projektu:

```powershell
Unblock-File .\tools\update-headers.ps1
.\tools\update-headers.ps1
```

`Unblock-File` je obvykle potřeba jen po stažení nebo nahrazení souboru.

### Záloha

Před změnami se automaticky vytvoří složka:

```text
_backup_update_headers_YYYY-MM-DD_HH-mm-ss
```

Obsahuje původní verze všech skutečně upravených stránek.

### Přidání nové jazykové dvojice

V souboru `update-headers.ps1` doplň stejnou dvojici do obou map:

```powershell
$enTargets = @{
    "guide-tracing.html" = "/worldforkids/cs/pruvodce-obtahovacky.html"
}

$czTargets = @{
    "cs/pruvodce-obtahovacky.html" = "/worldforkids/guide-tracing.html"
}
```

Aktuálně je dvojice obtahovaček už ve skriptu připravená. Pokud `guide-tracing.html` ještě neexistuje, skript jej pouze přeskočí.

### Budoucí změna vzorových souborů

Až budou jako vzor sloužit průvodci aktivitami, změň nahoře pouze:

```powershell
$enSource = "guide-activities.html"
$czSource = "cs/pruvodce-aktivitami.html"
```

Současně změň odkazy ve dvou voláních `Update-HeaderGroup`:

```powershell
-SourceLanguageLink "pruvodce-aktivitami.html"
-SourceLanguageLink "/worldforkids/guide-activities.html"
```

### Doporučený postup

1. Uprav a online otestuj hlavičku na vzorové EN stránce.
2. Uprav a online otestuj hlavičku na vzorové CZ stránce.
3. Spusť `update-headers.ps1`.
4. Zkontroluj jednu EN a jednu CZ cílovou stránku.
5. Zkopíruj změny do GitHub repozitáře, proveď commit a push.
