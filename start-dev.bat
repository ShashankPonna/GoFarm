@echo off
echo Starting GOFaRm Development Servers...
echo.

start "GOFaRm Backend" cmd /k "npm run dev"
timeout /t 3 /nobreak > nul

start "GOFaRm Frontend" cmd /k "cd client && npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
