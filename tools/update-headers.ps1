$ErrorActionPreference = "Stop"

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

$enSource = "dot-to-dot-guide.html"
$czSource = "pruvodce-spojovacky.html"

$enTargets = @{
    "activity-guide.html"    = "pruvodce-aktivitami.html"
    "maze-guide.html"        = "pruvodce-bludiste.html"
    "coloring-guide.html"    = "pruvodce-omalovanky.html"
    "difficulty-levels.html" = "urovne-obtiznosti.html"
    "our-story.html"         = "nas-pribeh.html"
    "privacy.html"           = "privacy-cz.html"
    "terms.html"             = "terms-cz.html"
    "tracing-guide.html"     = "pruvodce-obtahovacky.html"
}

$czTargets = @{
    "pruvodce-aktivitami.html"  = "activity-guide.html"
    "pruvodce-bludiste.html"    = "maze-guide.html"
    "pruvodce-omalovanky.html"  = "coloring-guide.html"
    "urovne-obtiznosti.html"    = "difficulty-levels.html"
    "nas-pribeh.html"           = "our-story.html"
    "privacy-cz.html"           = "privacy.html"
    "terms-cz.html"             = "terms.html"
    "pruvodce-obtahovacky.html" = "tracing-guide.html"
}

$startMarker = "<!-- HEADER START -->"
$endMarker   = "<!-- HEADER END -->"
$utf8NoBom   = New-Object System.Text.UTF8Encoding($false)

function Get-HeaderBlock {
    param(
        [string]$Content,
        [string]$FileName
    )

    $start = $Content.IndexOf($startMarker, [System.StringComparison]::Ordinal)

    if ($start -lt 0) {
        throw "HEADER START is missing in: $FileName"
    }

    $end = $Content.IndexOf(
        $endMarker,
        $start,
        [System.StringComparison]::Ordinal
    )

    if ($end -lt 0) {
        throw "HEADER END is missing in: $FileName"
    }

    $end += $endMarker.Length

    return $Content.Substring($start, $end - $start)
}

function Update-HeaderGroup {
    param(
        [string]$SourceName,
        [hashtable]$Targets,
        [string]$SourceLanguageLink,
        [string]$GroupLabel,
        [string]$BackupDir
    )

    $sourcePath = Join-Path $projectRoot $SourceName

    if (-not (Test-Path $sourcePath)) {
        throw "Source file not found: $sourcePath"
    }

    $sourceContent = [System.IO.File]::ReadAllText($sourcePath)
    $sourceHeader = Get-HeaderBlock -Content $sourceContent -FileName $SourceName

    foreach ($targetName in $Targets.Keys) {
        $targetPath = Join-Path $projectRoot $targetName
        $languageTarget = $Targets[$targetName]

        if (-not (Test-Path $targetPath)) {
            Write-Host "SKIPPED - file not found: $targetName"
            continue
        }

        $content = [System.IO.File]::ReadAllText($targetPath)

        $start = $content.IndexOf($startMarker, [System.StringComparison]::Ordinal)

        if ($start -lt 0) {
            Write-Host "SKIPPED - HEADER START missing: $targetName"
            continue
        }

        $end = $content.IndexOf(
            $endMarker,
            $start,
            [System.StringComparison]::Ordinal
        )

        if ($end -lt 0) {
            Write-Host "SKIPPED - HEADER END missing: $targetName"
            continue
        }

        $end += $endMarker.Length

        $targetHeader = $sourceHeader.Replace(
            $SourceLanguageLink,
            $languageTarget
        )

        Copy-Item $targetPath (Join-Path $BackupDir $targetName) -Force

        $newContent =
            $content.Substring(0, $start) +
            $targetHeader +
            $content.Substring($end)

        [System.IO.File]::WriteAllText(
            $targetPath,
            $newContent,
            $utf8NoBom
        )

        Write-Host "UPDATED [$GroupLabel]: $targetName -> $languageTarget"
    }
}

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupDir = Join-Path $projectRoot "_backup_update_headers_$timestamp"

New-Item -ItemType Directory -Path $backupDir | Out-Null

Update-HeaderGroup `
    -SourceName $enSource `
    -Targets $enTargets `
    -SourceLanguageLink "pruvodce-spojovacky.html" `
    -GroupLabel "EN" `
    -BackupDir $backupDir

Update-HeaderGroup `
    -SourceName $czSource `
    -Targets $czTargets `
    -SourceLanguageLink "dot-to-dot-guide.html" `
    -GroupLabel "CZ" `
    -BackupDir $backupDir

Write-Host ""
Write-Host "DONE - all headers updated."
Write-Host "Backup: $backupDir"
