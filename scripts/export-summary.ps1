param(
  [string]$ApiBaseUrl = "http://localhost:3001",
  [string]$OutputDir = "./data/exports"
)

if (-not (Test-Path $OutputDir)) {
  New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$summary = Invoke-RestMethod -Uri "$ApiBaseUrl/api/dashboard/summary" -Method Get
$charts = Invoke-RestMethod -Uri "$ApiBaseUrl/api/dashboard/charts" -Method Get

$payload = @{
  exportedAt = (Get-Date).ToString("o")
  summary = $summary.data
  charts = $charts.data
} | ConvertTo-Json -Depth 8

$destination = Join-Path $OutputDir "dashboard-export-$timestamp.json"
Set-Content -Path $destination -Value $payload -Encoding UTF8

Write-Output "Export created: $destination"
