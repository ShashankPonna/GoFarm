@echo off
echo Installing GOFaRm Application...
echo.

echo Step 1: Installing backend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Backend installation failed!
    pause
    exit /b %errorlevel%
)

echo.
echo Step 2: Installing frontend dependencies...
cd client
call npm install
if %errorlevel% neq 0 (
    echo Frontend installation failed!
    pause
    exit /b %errorlevel%
)

cd ..
echo.
echo Installation completed successfully!
echo.
echo Next steps:
echo 1. Create .env file in root directory with MongoDB URI and JWT secret
echo 2. Create .env file in client directory with API URL
echo 3. Run 'npm run dev' to start backend
echo 4. Run 'cd client && npm start' to start frontend
echo.
pause
