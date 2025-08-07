@echo off
echo ========================================
echo PitchPerfect Application Restart Script
echo ========================================
echo.

echo [1/7] Checking for .env file...
if not exist ".env" (
    echo ❌ .env file not found! Please create a .env file with the following variables:
    echo    PORT=5001
    echo    CLIENT_URL=http://localhost:3000
    echo    REACT_APP_SERVER_URL=http://localhost:5001
    echo    REACT_APP_CLIENT_URL=http://localhost:3000
    echo    REACT_APP_API_BASE_URL=http://localhost:5001/api
    pause
    exit /b 1
) else (
    echo ✓ .env file found
)

echo.
echo [2/7] Reading .env configuration...

REM Read .env file and extract values (using defaults from server/client config)
set "serverPort=5001"
set "clientPort=3000"
set "serverUrl=http://localhost:5001"
set "clientUrl=http://localhost:3000"
set "apiBaseUrl=http://localhost:5001/api"

for /f "tokens=1,2 delims==" %%a in (.env) do (
    if not "%%a"=="" if not "%%a:~0,1%"=="#" (
        if "%%a"=="PORT" set "serverPort=%%b"
        if "%%a"=="CLIENT_URL" set "clientUrl=%%b"
        if "%%a"=="REACT_APP_SERVER_URL" set "serverUrl=%%b"
        if "%%a"=="REACT_APP_CLIENT_URL" set "clientUrl=%%b"
        if "%%a"=="REACT_APP_API_BASE_URL" set "apiBaseUrl=%%b"
    )
)

echo Server Port: %serverPort%
echo Client Port: %clientPort%
echo Server URL: %serverUrl%
echo Client URL: %clientUrl%
echo API Base URL: %apiBaseUrl%

echo.
echo [3/7] Stopping processes on configured ports...

REM Stop processes on server port
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%serverPort%') do (
    echo Stopping process on server port %serverPort% (PID: %%a)
    taskkill /f /pid %%a >nul 2>&1
)

REM Stop processes on client port
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%clientPort%') do (
    echo Stopping process on client port %clientPort% (PID: %%a)
    taskkill /f /pid %%a >nul 2>&1
)

REM Stop any Node.js processes that might be running the app
echo Stopping any running Node.js processes...
taskkill /f /im node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Stopped existing Node.js processes
) else (
    echo ℹ No running Node.js processes found
)

echo.
echo [4/7] Waiting for processes to fully terminate...
timeout /t 3 /nobreak >nul

echo.
echo [5/7] Validating .env file...
REM Check for required variables (basic check)
findstr /c:"PORT=" .env >nul
if %errorlevel% neq 0 (
    echo ⚠ Warning: PORT variable not found in .env, using default 5001 from server config
)

findstr /c:"CLIENT_URL=" .env >nul
if %errorlevel% neq 0 (
    echo ⚠ Warning: CLIENT_URL variable not found in .env, using default http://localhost:3000 from server config
)

findstr /c:"REACT_APP_SERVER_URL=" .env >nul
if %errorlevel% neq 0 (
    echo ⚠ Warning: REACT_APP_SERVER_URL variable not found in .env, using default http://localhost:5001 from client config
)

findstr /c:"REACT_APP_API_BASE_URL=" .env >nul
if %errorlevel% neq 0 (
    echo ⚠ Warning: REACT_APP_API_BASE_URL variable not found in .env, using default http://localhost:5001/api from client config
)

echo ✓ .env file validation complete

echo.
echo [6/7] Installing dependencies (if needed)...
call npm run install-all

echo.
echo [7/7] Starting the application...
echo Starting server and client with .env configuration...
echo.
echo The application will be available at:
echo - Client: %clientUrl%
echo - Server: %serverUrl%
echo - API: %apiBaseUrl%
echo.
echo Press Ctrl+C to stop the application
echo.

call npm start

pause 