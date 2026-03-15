@echo off
title Avena Bot - Creating .exe launcher
color 0e

echo.
echo  Creating AvenaBot.exe using IExpress...
echo.

:: Write the IExpress .SED config
(
echo [Version]
echo Class=IEXPRESS
echo SEDVersion=3
echo [Options]
echo PackagePurpose=InstallApp
echo ShowInstallProgramWindow=1
echo HideExtractAnimation=1
echo UseLongFileName=1
echo InsideCompressed=0
echo CAB_FixedSize=0
echo CAB_ResvCodeSigning=0
echo RebootMode=N
echo InstallPrompt=
echo DisplayLicense=
echo FinishMessage=
echo TargetName=%CD%\AvenaBot.exe
echo FriendlyName=Avena Ticket Bot
echo AppLaunched=cmd /c AvenaBot.bat
echo PostInstallCmd=<None>
echo AdminQuietInstCmd=
echo UserQuietInstCmd=
echo SourceFiles=SourceFiles
echo [Strings]
echo InstallPrompt=
echo DisplayLicense=
echo FinishMessage=
echo TargetName=%CD%\AvenaBot.exe
echo FriendlyName=Avena Ticket Bot
echo AppLaunched=cmd /c AvenaBot.bat
echo PostInstallCmd=<None>
echo [SourceFiles]
echo SourceFiles0=%CD%
echo [SourceFiles0]
echo AvenaBot.bat=
) > "%TEMP%\AvenaBot.sed"

iexpress /N /Q "%TEMP%\AvenaBot.sed"

if exist AvenaBot.exe (
    echo  [OK] AvenaBot.exe skapad!
    del "%TEMP%\AvenaBot.sed"
) else (
    echo  [INFO] IExpress ej tillgänglig. Använd AvenaBot.bat direkt.
)
echo.
pause
