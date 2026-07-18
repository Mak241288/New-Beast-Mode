@echo off
echo ==========================================
echo Starting BeastMode Servers
echo ==========================================

echo [1/2] Starting Backend Server...
start "BeastMode Backend" cmd /k "cd backend && npm run dev"

echo [2/2] Starting Frontend Server...
start "BeastMode Frontend" cmd /k "cd frontend && npm run dev"

echo ==========================================
echo Both servers have been launched in new windows!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo ==========================================
pause
