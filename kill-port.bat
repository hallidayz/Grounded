@echo off
REM Script to kill process on port 3000 (Windows)
REM Usage: kill-port.bat [port]

set PORT=%1
if "%PORT%"=="" set PORT=3000

echo Checking for processes on port %PORT%...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%PORT% ^| findstr LISTENING') do (
    echo Killing process %%a on port %PORT%
    taskkill //F //PID %%a
    echo Port %PORT% is now free
    goto :done
)

echo No process found on port %PORT%
:done

