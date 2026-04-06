param(
  [string]$Source = "./data/sqlite/progress-state.db",
  [string]$OutputDir = "./data/backups"
)

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"

if (-not (Test-Path $Source)) {
  throw "SQLite source file not found: $Source"
}

if (-not (Test-Path $OutputDir)) {
  New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

$destination = Join-Path $OutputDir "progress-state-$timestamp.db"
Copy-Item -Path $Source -Destination $destination -Force

Write-Output "Backup created: $destination"
