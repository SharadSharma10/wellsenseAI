@echo off
title WellSense AI - React Vite Frontend
echo ========================================================
echo Starting WellSense AI Frontend on http://127.0.0.1:5173
echo ========================================================
cd /d "%~dp0frontend"
npm run dev -- --host 127.0.0.1 --port 5173
pause
