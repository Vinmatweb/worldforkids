$ErrorActionPreference = "Stop"

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$sourcePath = Join-Path $projectRoot "pruvodce-spojovacky.html"

$targets = @{
    "pruvodce-aktivitami.html"  = "activity-guide.html"
    "pruvodce-bludiste.html"    = "maze-guide.html"
    "pruvodce-omalovanky.html"  = "coloring-guide.html"
	"pruvodce-obtahovacky.html" = "tracing-guide.html"
    "urovne-obtiznosti.html"    = "difficulty-levels.html"
    "nas-pribeh.html"           = "our-story.html"
    "privacy-cz.html"           = "privacy.html"
    "terms-cz.html"             = "terms.html"
}

$startMarker = "<!-- HEADER START -->"
$endMarker   = "<!-- HEADER END -->"
$utf8NoBom   = New-Object System.Text.UTF8Encoding($false)

function Get-HeaderBlock {
    param([string]$Content)

    $start = $Content.IndexOf($startMarker, [System.StringComparison]::Ordinal)
    $end = $Content.IndexOf($endMarker, $start, [System.StringComparison]::Ordinal)

    if ($start -lt 0 -or $end -lt 0) {
        throw "HEADER START or HEADER END is missing in source file."
    }

    $end += $endMarker.Length
    return $Content.Substring($start, $end - $start)
}

if (-not (Test-Path $sourcePath)) {
    throw "Source file not found: $sourcePath"
}

$sourceContent = [System.IO.File]::ReadAllText($sourcePath)
$sourceHeader = Get-HeaderBlock -Content $sourceContent

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupDir = Join-Path $projectRoot "_backup_update_cz_header_$timestamp"
New-Item -ItemType Directory -Path $backupDir | Out-Null

foreach ($targetName in $targets.Keys) {
    $targetPath = Join-Path $projectRoot $targetName
    $languageTarget = $targets[$targetName]

    if (-not (Test-Path $targetPath)) {
        Write-Host "SKIPPED - file not found: $targetName"
        continue
    }

    $content = [System.IO.File]::ReadAllText($targetPath)

    $start = $content.IndexOf($startMarker, [System.StringComparison]::Ordinal)
    $end = $content.IndexOf($endMarker, $start, [System.StringComparison]::Ordinal)

    if ($start -lt 0 -or $end -lt 0) {
        Write-Host "SKIPPED - header markers missing: $targetName"
        continue
    }

    $end += $endMarker.Length

    $targetHeader = $sourceHeader.Replace(
        "dot-to-dot-guide.html",
        $languageTarget
    )

    Copy-Item $targetPath (Join-Path $backupDir $targetName) -Force

    $newContent =
        $content.Substring(0, $start) +
        $targetHeader +
        $content.Substring($end)

    [System.IO.File]::WriteAllText($targetPath, $newContent, $utf8NoBom)

    Write-Host "UPDATED: $targetName -> EN: $languageTarget"
}

Write-Host ""
Write-Host "DONE - CZ headers updated."
Write-Host "Backup: $backupDir"
