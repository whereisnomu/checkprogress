$ErrorActionPreference = 'Stop'

param(
  [string]$ApiBaseUrl = "http://localhost:3001"
)

$health = Invoke-RestMethod -Uri "$ApiBaseUrl/health" -Method Get

if ($health.ok -ne $true) {
  throw "Health endpoint did not return ok=true"
}

Write-Output "API health check passed: $ApiBaseUrl/health"
