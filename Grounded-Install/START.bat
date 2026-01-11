@echo off
REM Auto-Launcher for Grounded PWA
REM Just double-click this file - everything is automated!

cd /d "%~dp0"

REM Check for Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo.
  echo ❌ Node.js is required but not found.
  echo.
  echo 📥 Please install Node.js:
  echo    Visit: https://nodejs.org
  echo    Download and install, then try again.
  echo.
  pause
  exit /b 1
)

REM Run the auto-launcher
node launcher.js
pause
