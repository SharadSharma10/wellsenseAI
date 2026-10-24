@echo off
title WellSense AI - FastAPI Backend Server
echo ========================================================
echo Starting WellSense AI Backend on http://127.0.0.1:8000
echo ========================================================
cd /d "%~dp0backend"
if exist .venv\Scripts\activate.bat (
    call .venv\Scripts\activate.bat
    python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
) else (
    echo [.venv] not found. Please run: py -3.11 -m venv .venv inside backend/
    pause
)
