@echo off
title WellSense AI Launcher
echo ========================================================
echo Launching WellSense AI Full-Stack Platform...
echo ========================================================
start "WellSense AI Backend" cmd /k "%~dp0start_backend.bat"
timeout /t 3 /nobreak >nul
start "WellSense AI Frontend" cmd /k "%~dp0start_frontend.bat"
timeout /t 2 /nobreak >nul
start http://127.0.0.1:5173
echo.
echo Platform successfully launched!
echo Backend:  http://127.0.0.1:8000
echo Frontend: http://127.0.0.1:5173
echo API Docs: http://127.0.0.1:8000/docs
echo.
pause
