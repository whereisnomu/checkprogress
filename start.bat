@echo off
setlocal

cd /d "%~dp0"

echo [progress-state] Starting local environment...
echo [progress-state] This will run migrations and start API, web, and bot.
echo.

npm.cmd run dev:all

if errorlevel 1 (
  echo.
  echo [progress-state] Startup failed.
  pause
)
