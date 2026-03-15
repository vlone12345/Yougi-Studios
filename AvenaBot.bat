@echo off
title Avena Ticket Bot
color 0b

echo.
echo  ==========================================
echo   Avena Roleplay - Ticket Bot
echo  ==========================================
echo.

:: Check Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Node.js is not installed!
    echo  Download from: https://nodejs.org
    pause & exit /b 1
)
for /f "tokens=*" %%v in ('node -v') do set NODEVER=%%v
echo  [OK] Node.js %NODEVER%
echo.

:: First-time setup via Node.js (properly saves .env)
if not exist .env (
    echo  Running first-time setup...
    echo.
    node setup.js
    if %errorlevel% neq 0 (
        echo  [ERROR] Setup failed.
        pause & exit /b 1
    )
    echo.
)

:: Install dependencies
if not exist node_modules (
    echo  [INSTALL] Installing dependencies...
    call npm install --silent
    if %errorlevel% neq 0 (
        echo  [ERROR] npm install failed.
        pause & exit /b 1
    )
    echo  [OK] Dependencies installed.
    echo.
)

:: Deploy slash commands once
if not exist data\.commands_deployed (
    echo  [DEPLOY] Registering slash commands...
    node deploy-commands.js
    if %errorlevel% neq 0 (
        echo  [ERROR] Failed. Check your token/IDs in .env
        pause & exit /b 1
    )
    if not exist data mkdir data
    echo. > data\.commands_deployed
    echo  [OK] Commands registered.
    echo.
)

:: Start bot
echo  ==========================================
echo   Bot starting... (close window to stop)
echo  ==========================================
echo.
node main.js

echo.
echo  [!] Bot stopped or crashed. See error above.
pause
