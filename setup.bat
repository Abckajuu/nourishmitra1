@echo off
title NourishMitra Setup
color 0A
echo.
echo  ================================================
echo   NourishMitra - One Time Setup
echo   Your Personal Food Companion
echo  ================================================
echo.
echo  This will set up everything you need.
echo  Please keep this window open until it finishes.
echo.
pause

:: ── Step 1: Check Node.js ─────────────────────────────────────────
echo.
echo  [1/5] Checking Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo  Node.js not found. Please install it from https://nodejs.org
    echo  Download the LTS version, install it, then run this setup again.
    pause
    exit /b 1
)
echo  Node.js found.

:: ── Step 2: Check/Install Ollama ─────────────────────────────────
echo.
echo  [2/5] Checking Ollama...
where ollama >nul 2>&1
if %errorlevel% neq 0 (
    echo  Ollama not found. Downloading Ollama installer...
    curl -L "https://ollama.com/download/OllamaSetup.exe" -o "%TEMP%\OllamaSetup.exe"
    if %errorlevel% neq 0 (
        echo  Download failed. Please check your internet connection.
        pause
        exit /b 1
    )
    echo  Installing Ollama silently...
    "%TEMP%\OllamaSetup.exe" /S
    timeout /t 5 /nobreak >nul
    echo  Ollama installed successfully.
) else (
    echo  Ollama already installed.
)

:: ── Step 3: Pull Gemma model ──────────────────────────────────────
echo.
echo  [3/5] Downloading AI model (gemma3n:e2b)...
echo  This may take 10-20 minutes depending on your internet speed.
echo  Please wait and do not close this window.
echo.
ollama pull gemma3n:e2b
if %errorlevel% neq 0 (
    echo  Model download failed. Please check your internet and try again.
    pause
    exit /b 1
)
echo  AI model downloaded successfully.

:: ── Step 4: Install server dependencies ──────────────────────────
echo.
echo  [4/5] Installing server dependencies...
cd /d "%~dp0server"
call npm install
if %errorlevel% neq 0 (
    echo  Server setup failed. Please make sure Node.js is installed correctly.
    pause
    exit /b 1
)
echo  Server dependencies installed.

:: ── Step 5: Build React frontend ─────────────────────────────────
echo.
echo  [5/5] Building the app interface...
cd /d "%~dp0client"
call npm install
call npm run build
if %errorlevel% neq 0 (
    echo  Frontend build failed.
    pause
    exit /b 1
)
echo  App interface built successfully.

:: ── Done ──────────────────────────────────────────────────────────
echo.
echo  ================================================
echo   Setup Complete!
echo   Double-click start.bat to launch NourishMitra.
echo  ================================================
echo.
pause