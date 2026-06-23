# RecarregaAi! 2.3.7

# Script legado para Windows. O empacotamento principal usa Node:
# npm run zip

$ErrorActionPreference = "Stop"

$root = Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")
$extensionRoot = Join-Path $root "extension"
$dist = Join-Path $root "dist"
$zipPath = Join-Path $dist "recarregaai.zip"
$includePaths = @(
    "assets",
    "css",
    "js",
    "manifest.json",
    "onboarding.html",
    "options.html",
    "popup.html"
)
$publicOnlyFiles = @(
    "css/privacy.css",
    "css/uninstall.css",
    "js/modules/public-page-security.js",
    "js/privacy.js",
    "js/uninstall.js"
)

New-Item -ItemType Directory -Force -Path $dist | Out-Null

if (Test-Path -LiteralPath $zipPath) {
    Remove-Item -LiteralPath $zipPath -Force
}

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$archiveStream = [System.IO.File]::Open(
    $zipPath,
    [System.IO.FileMode]::CreateNew,
    [System.IO.FileAccess]::ReadWrite
)
$archive = New-Object System.IO.Compression.ZipArchive(
    $archiveStream,
    [System.IO.Compression.ZipArchiveMode]::Create
)

try {
    foreach ($includePath in $includePaths) {
        $absolutePath = Join-Path $extensionRoot $includePath
        $item = Get-Item -LiteralPath $absolutePath

        if (-not $item.PSIsContainer) {
            [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
                $archive,
                $item.FullName,
                $includePath.Replace("\", "/"),
                [System.IO.Compression.CompressionLevel]::Optimal
            ) | Out-Null

            continue
        }

        Get-ChildItem -LiteralPath $item.FullName -Recurse -File |
            Where-Object {
                $relativePath = $_.FullName.Substring($extensionRoot.Length)
                $relativePath = $relativePath.TrimStart([char[]]@("\", "/"))
                $relativePath = $relativePath.Replace("\", "/")

                $_.Name -ne ".gitkeep" -and $relativePath -notin $publicOnlyFiles
            } |
            ForEach-Object {
                $relativePath = $_.FullName.Substring($extensionRoot.Length)
                $relativePath = $relativePath.TrimStart([char[]]@("\", "/"))
                $relativePath = $relativePath.Replace("\", "/")

                [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
                    $archive,
                    $_.FullName,
                    $relativePath,
                    [System.IO.Compression.CompressionLevel]::Optimal
                ) | Out-Null
            }
    }
} finally {
    $archive.Dispose()
    $archiveStream.Dispose()
}

Write-Host "Pacote criado em $zipPath"
