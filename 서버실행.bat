@echo off
cd /d "%~dp0"
title AMT Research Archive - Local Server
set "PORT=8000"
set "PYCMD="

echo ============================================
echo   AMT Research Archive - Local Server
echo ============================================
echo.
echo Looking for Python...

rem 1) py launcher first (real Python, not the Microsoft Store stub)
py -3 --version >nul 2>nul && set "PYCMD=py -3"

rem 2) real python.exe on PATH (exclude the WindowsApps Store alias)
if not defined PYCMD (
    for /f "delims=" %%I in ('where python 2^>nul') do (
        echo %%I | find /i "WindowsApps" >nul || if not defined PYCMD set "PYCMD=%%I"
    )
)

rem 3) python3 fallback
if not defined PYCMD (
    for /f "delims=" %%I in ('where python3 2^>nul') do (
        echo %%I | find /i "WindowsApps" >nul || if not defined PYCMD set "PYCMD=%%I"
    )
)

if not defined PYCMD (
    echo.
    echo [ERROR] No working Python found.
    echo.
    echo  - Install Python: https://www.python.org/downloads/
    echo    Check "Add python.exe to PATH" during install.
    echo.
    echo  - If you have Node.js, type this here instead:
    echo        npx http-server -p %PORT% -o
    echo.
    echo  - Tip: open "Manage app execution aliases" and turn OFF
    echo    the Store aliases for python.exe / python3.exe
    echo.
    pause
    exit /b 1
)

echo   Using: %PYCMD%
echo   URL:   http://localhost:%PORT%
echo.
echo Press Ctrl+C or close this window to stop the server.
echo.

rem open browser after 2 seconds (once the server is up)
start "" /b powershell -NoProfile -Command "Start-Sleep -Seconds 2; Start-Process 'http://localhost:%PORT%'" >nul 2>nul

rem run the server (window stays open until you stop it)
%PYCMD% -m http.server %PORT%

echo.
echo Server stopped.
pause
