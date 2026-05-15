@echo off
title NourishMitra
color 0A
echo.
echo  ================================================
echo   NourishMitra - Starting...
echo   Your Personal Food Companion
echo  ================================================
echo.

:: ── Check if setup was done ───────────────────────────────────────
if not exist "%~dp0server\node_modules" (
    echo  Setup not complete. Please run setup.bat first.
    pause
    exit /b 1
)

if not exist "%~dp0client\build" (
    echo  Setup not complete. Please run setup.bat first.
    pause
    exit /b 1
)

:: ── Start Ollama ──────────────────────────────────────────────────
echo  Starting AI engine...
tasklist /fi "imagename eq ollama.exe" 2>nul | find /i "ollama.exe" >nul
if %errorlevel% neq 0 (
    start /B ollama serve
    timeout /t 4 /nobreak >nul
    echo  AI engine started.
) else (
    echo  AI engine already running.
)

:: ── Update server to use local Ollama ─────────────────────────────
set OLLAMA_URL=http://localhost:11434
set SERVE_STATIC=true

:: ── Start Node.js server ──────────────────────────────────────────
echo  Starting NourishMitra server...
cd /d "%~dp0server"
start /B node index.js
timeout /t 2 /nobreak >nul
echo  Server started.

:: ── Open app in browser ───────────────────────────────────────────
echo  Opening NourishMitra...
timeout /t 1 /nobreak >nul

:: Serve the built React app via the Node server
:: Open in default browser
start http://localhost:5000

echo.
echo  ================================================
echo   NourishMitra is running!
echo   Opening in your browser now...
echo   Keep this window open while using the app.
echo   Close this window to stop NourishMitra.
echo  ================================================
echo.

:: ── Keep window open and wait ─────────────────────────────────────
:wait
timeout /t 5 /nobreak >nul
tasklist /fi "imagename eq node.exe" 2>nul | find /i "node.exe" >nul
if %errorlevel% neq 0 (
    echo  Server stopped unexpectedly. Restarting...
    cd /d "%~dp0server"
    start /B node index.js
)
goto wait