@echo off
REM Grounded PWA Launcher for Windows
REM This script tries multiple methods to start the server

setlocal
set PORT=%1
if "%PORT%"=="" set PORT=8000

set SCRIPT_DIR=%~dp0
set DIST_DIR=%SCRIPT_DIR%dist

if not exist "%DIST_DIR%" (
  echo ❌ Error: dist/ folder not found.
  echo    Make sure you are in the Grounded-Install folder.
  pause
  exit /b 1
)

echo.
echo 🚀 Starting Grounded PWA...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REM Method 1: Try Node.js server (best - includes AI model support)
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
  echo ✅ Using Node.js server (AI models will work)
  cd /d "%SCRIPT_DIR%"
  node launcher.js %PORT%
  exit /b 0
)

REM Method 2: Try npx serve (if Node.js is installed)
where npx >nul 2>&1
if %ERRORLEVEL% EQU 0 (
  echo ⚠️  Using npx serve (AI models may not work)
  echo    For full AI support, install Node.js and use: node launcher.js
  cd /d "%DIST_DIR%"
  npx -y serve -p %PORT% --cors
  exit /b 0
)

REM Method 3: Try Python
where python >nul 2>&1
if %ERRORLEVEL% EQU 0 (
  echo ⚠️  Using Python server (AI models will NOT work)
  echo    Install Node.js for full AI support: https://nodejs.org
  cd /d "%DIST_DIR%"
  python -m http.server %PORT%
  exit /b 0
)

REM Method 4: Try PHP
where php >nul 2>&1
if %ERRORLEVEL% EQU 0 (
  echo ⚠️  Using PHP server (AI models will NOT work)
  echo    Install Node.js for full AI support: https://nodejs.org
  cd /d "%DIST_DIR%"
  php -S localhost:%PORT%
  exit /b 0
)

echo ❌ No server found. Please install one of:
echo    1. Node.js (recommended): https://nodejs.org
echo    2. Python: https://www.python.org
echo    3. PHP: https://www.php.net
pause
exit /b 1
