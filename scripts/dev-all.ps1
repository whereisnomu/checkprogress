$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot

function Start-WorkspaceProcess {
  param(
    [string]$Name,
    [string]$Workspace
  )

  return Start-Process -FilePath "npm.cmd" `
    -ArgumentList @("run", "dev", "--workspace", $Workspace) `
    -WorkingDirectory $root `
    -NoNewWindow `
    -PassThru
}

Write-Host "[progress-state] Running migrations..."
& npm.cmd run migrate

Write-Host "[progress-state] Starting api, web, and bot..."

$processes = @()
$processes += Start-WorkspaceProcess -Name "api" -Workspace "@progress-state/api"
Start-Sleep -Milliseconds 500
$processes += Start-WorkspaceProcess -Name "web" -Workspace "@progress-state/web"
Start-Sleep -Milliseconds 500
$processes += Start-WorkspaceProcess -Name "bot" -Workspace "@progress-state/bot"

Write-Host "[progress-state] Services started. Press Ctrl+C to stop all."

try {
  while ($true) {
    Start-Sleep -Seconds 2

    foreach ($process in $processes) {
      if ($process.HasExited) {
        throw "A child process exited unexpectedly."
      }
    }
  }
}
finally {
  Write-Host "[progress-state] Stopping child processes..."
  foreach ($process in $processes) {
    if (-not $process.HasExited) {
      Stop-Process -Id $process.Id -Force
    }
  }
}
