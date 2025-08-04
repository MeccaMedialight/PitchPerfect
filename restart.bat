@echo off
echo Stopping all Node.js processes...
taskkill /f /im node.exe 2>nul
if %errorlevel% equ 0 (
    echo Successfully stopped Node.js processes
) else (
    echo No Node.js processes were running
)

echo.
echo Waiting 2 seconds for processes to fully terminate...
timeout /t 2 /nobreak >nul

echo.
echo Starting the application...
echo.
echo Starting server on port 5001...
start "Server" cmd /k "cd server && npm start"

echo.
echo Waiting 3 seconds for server to start...
timeout /t 3 /nobreak >nul

echo.
echo Starting client on port 3000...
start "Client" cmd /k "cd client && npm start"

echo.
echo Application restart complete!
echo.
echo Server should be running on: http://localhost:5001
echo Client should be running on: http://localhost:3000
echo.
echo Press any key to close this window...
pause >nul 