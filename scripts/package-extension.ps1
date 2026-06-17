# RecarregaAi! 1.7.6

# Script legado para Windows. O empacotamento principal usa Node:
# npm run zip

$ErrorActionPreference = "Stop"

$root = Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")
$dist = Join-Path $root "dist"
$zipPath = Join-Path $dist "recarregaai.zip"
$includePaths = @(
    "assets",
    "CSS",
    "JS",
    "manifest.json",
    "options.html",
    "privacy.html",
    "popup.html",
    "uninstall.html",
    "welcome.html"
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
        $absolutePath = Join-Path $root $includePath
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

        Get-ChildItem -LiteralPath $item.FullName -Recurse -File | ForEach-Object {
            $relativePath = $_.FullName.Substring($root.Path.Length)
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
