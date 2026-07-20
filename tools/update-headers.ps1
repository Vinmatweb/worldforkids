$ErrorActionPreference = "Stop"

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

$enSource = "guide-dot-to-dot.html"
$czSource = "cs/pruvodce-spojovacky.html"

$enTargets = @{
    "guide-activities.html"  = "/worldforkids/cs/pruvodce-aktivitami.html"
    "guide-mazes.html"       = "/worldforkids/cs/pruvodce-bludiste.html"
    "guide-coloring.html"    = "/worldforkids/cs/pruvodce-omalovanky.html"
    "difficulty-levels.html" = "/worldforkids/cs/urovne-obtiznosti.html"
    "our-story.html"         = "/worldforkids/cs/nas-pribeh.html"
    "privacy.html"           = "/worldforkids/cs/zasady-ochrany-osobnich-udaju.html"
    "terms.html"             = "/worldforkids/cs/podminky-uziti.html"
    "guide-tracing.html"     = "/worldforkids/cs/pruvodce-obtahovacky.html"
    "history-tracing.html"   = "/worldforkids/cs/historie-obkreslovani.html"
}

$czTargets = @{
    "cs/pruvodce-aktivitami.html"          = "/worldforkids/guide-activities.html"
    "cs/pruvodce-bludiste.html"            = "/worldforkids/guide-mazes.html"
    "cs/pruvodce-omalovanky.html"          = "/worldforkids/guide-coloring.html"
    "cs/urovne-obtiznosti.html"            = "/worldforkids/difficulty-levels.html"
    "cs/nas-pribeh.html"                   = "/worldforkids/our-story.html"
    "cs/zasady-ochrany-osobnich-udaju.html" = "/worldforkids/privacy.html"
    "cs/podminky-uziti.html"               = "/worldforkids/terms.html"
    "cs/pruvodce-obtahovacky.html"         = "/worldforkids/guide-tracing.html"
    "cs/historie-obkreslovani.html"        = "/worldforkids/history-tracing.html"
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

        $backupPath = Join-Path $BackupDir $targetName
        New-Item -ItemType Directory -Path (Split-Path $backupPath -Parent) -Force | Out-Null
        Copy-Item $targetPath $backupPath -Force

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
    -SourceLanguageLink "/worldforkids/cs/pruvodce-spojovacky.html" `
    -GroupLabel "EN" `
    -BackupDir $backupDir

Update-HeaderGroup `
    -SourceName $czSource `
    -Targets $czTargets `
    -SourceLanguageLink "/worldforkids/guide-dot-to-dot.html" `
    -GroupLabel "CZ" `
    -BackupDir $backupDir

Write-Host ""
Write-Host "DONE - all headers updated."
Write-Host "Backup: $backupDir"
