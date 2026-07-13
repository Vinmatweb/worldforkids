$ErrorActionPreference = "Stop"

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$sourcePath = Join-Path $projectRoot "dot-to-dot-guide.html"

$targets = @{
    "activity-guide.html"    = "pruvodce-aktivitami.html"
    "maze-guide.html"        = "pruvodce-bludiste.html"
    "coloring-guide.html"    = "pruvodce-omalovanky.html"
	"tracing-guide.html"     = "pruvodce-obtahovacky.html"
    "difficulty-levels.html" = "urovne-obtiznosti.html"
    "our-story.html"         = "nas-pribeh.html"
    "privacy.html"           = "privacy-cz.html"
    "terms.html"             = "terms-cz.html"
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
$backupDir = Join-Path $projectRoot "_backup_update_en_header_$timestamp"
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
        "pruvodce-spojovacky.html",
        $languageTarget
    )

    Copy-Item $targetPath (Join-Path $backupDir $targetName) -Force

    $newContent =
        $content.Substring(0, $start) +
        $targetHeader +
        $content.Substring($end)

    [System.IO.File]::WriteAllText($targetPath, $newContent, $utf8NoBom)

    Write-Host "UPDATED: $targetName -> CZ: $languageTarget"
}

Write-Host ""
Write-Host "DONE - EN headers updated."
Write-Host "Backup: $backupDir"
