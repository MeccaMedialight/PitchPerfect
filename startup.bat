@echo off
setlocal enabledelayedexpansion

REM PitchPerfect Startup Script for Windows
REM 
REM This script ensures that all dependencies are installed and both server and client
REM are running properly. It provides detailed reporting and error handling.
REM 
REM Usage:
REM   startup.bat

REM Configuration
set SERVER_PORT=5001
set CLIENT_PORT=3000
set TIMEOUT=30
set RETRIES=3

REM Colors for console output (Windows 10+)
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "MAGENTA=[95m"
set "CYAN=[96m"
set "NC=[0m"

REM Utility functions
:log
set "message=%~1"
set "color=%~2"
if "%color%"=="" set "color=NC"
for /f "tokens=1-3 delims=: " %%a in ("%time%") do set "timestamp=%%a:%%b:%%c"
echo %!color![%timestamp%] %message%!NC!
goto :eof

:log_error
call :log "ERROR: %~1" "RED"
goto :eof

:log_success
call :log "SUCCESS: %~1" "GREEN"
goto :eof

:log_warning
call :log "WARNING: %~1" "YELLOW"
goto :eof

:log_info
call :log "INFO: %~1" "BLUE"
goto :eof

REM Check if a port is in use
:is_port_in_use
set "port=%~1"
netstat -ano | findstr ":%port%" >nul 2>&1
if %errorlevel% equ 0 (
    exit /b 0
) else (
    exit /b 1
)

REM Kill process on port
:kill_process_on_port
set "port=%~1"
call :is_port_in_use %port%
if %errorlevel% equ 0 (
    call :log_warning "Port %port% is in use, killing existing process..."
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%port%"') do (
        taskkill /f /pid %%a >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
)
goto :eof

REM Check if Node.js is installed
:check_node_version
node --version >nul 2>&1
if %errorlevel% neq 0 (
    call :log_error "Node.js is not installed"
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set "version=%%i"
for /f "tokens=1 delims=." %%a in ("%version:v=%") do set "major_version=%%a"

if %major_version% lss 16 (
    call :log_error "Node.js version %version% is too old. Please install Node.js 16 or higher."
    exit /b 1
)

call :log_success "Node.js version: %version%"
exit /b 0

REM Check if npm is installed
:check_npm_version
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    call :log_error "npm is not installed"
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set "version=%%i"
call :log_success "npm version: %version%"
exit /b 0

REM Check if required files exist
:check_required_files
set "missing_files="
if not exist "package.json" set "missing_files=%missing_files% package.json"
if not exist "server\package.json" set "missing_files=%missing_files% server\package.json"
if not exist "client\package.json" set "missing_files=%missing_files% client\package.json"
if not exist "server\index.js" set "missing_files=%missing_files% server\index.js"
if not exist "client\src\App.js" set "missing_files=%missing_files% client\src\App.js"

if defined missing_files (
    call :log_error "Missing required files: %missing_files%"
    exit /b 1
)

call :log_success "All required files found"
exit /b 0

REM Check if dependencies are installed
:check_dependencies
set "dir=%~1"
set "name=%~2"

if not exist "%dir%\node_modules" (
    call :log_warning "node_modules not found in %name%"
    exit /b 1
)

if not exist "%dir%\package.json" (
    call :log_warning "package.json not found in %name%"
    exit /b 1
)

call :log_success "Dependencies found for %name%"
exit /b 0

REM Install dependencies for a directory
:install_dependencies
set "dir=%~1"
set "name=%~2"

call :log_info "Installing dependencies for %name%..."

cd /d "%dir%"
npm install
if %errorlevel% neq 0 (
    call :log_error "Failed to install dependencies for %name%"
    exit /b 1
)

call :log_success "Dependencies installed for %name%"
exit /b 0

REM Check if a service is responding
:check_service_health
set "port=%~1"
set "name=%~2"

powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:%port%' -TimeoutSec 5 -UseBasicParsing; if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 404) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
if %errorlevel% equ 0 (
    call :log_success "%name% is responding on port %port%"
    exit /b 0
) else (
    call :log_error "%name% health check failed"
    exit /b 1
)

REM Generate a comprehensive report
:generate_report
set "results=%~1"
for /f "tokens=1-3 delims=: " %%a in ("%time%") do set "timestamp=%%a:%%b:%%c"
set "platform=Windows"
for /f "tokens=*" %%i in ('node --version') do set "node_version=%%i"

REM JSON report
echo { > startup-report.json
echo   "timestamp": "%timestamp%", >> startup-report.json
echo   "platform": "%platform%", >> startup-report.json
echo   "nodeVersion": "%node_version%", >> startup-report.json
echo   "results": %results% >> startup-report.json
echo } >> startup-report.json

call :log_info "Report saved to: startup-report.json"

REM Human-readable report
echo PitchPerfect Startup Report > startup-report.txt
echo Generated: %timestamp% >> startup-report.txt
echo Platform: %platform% >> startup-report.txt
echo Node Version: %node_version% >> startup-report.txt
echo. >> startup-report.txt
echo %results% >> startup-report.txt

call :log_info "Human-readable report saved to: startup-report.txt"
goto :eof

REM Main startup function
:main
call :log_info "Starting PitchPerfect application..."
call :log_info "Platform: Windows"
for /f "tokens=*" %%i in ('node --version') do call :log_info "Node version: %%i"

REM Step 1: Check Node.js and npm
call :log_info "Step 1: Checking Node.js and npm..."
call :check_node_version
if %errorlevel% neq 0 (
    call :log_error "Node.js check failed"
    exit /b 1
)

call :check_npm_version
if %errorlevel% neq 0 (
    call :log_error "npm check failed"
    exit /b 1
)

REM Step 2: Check required files
call :log_info "Step 2: Checking required files..."
call :check_required_files
if %errorlevel% neq 0 (
    call :log_error "Required files check failed"
    exit /b 1
)

REM Step 3: Kill existing processes
call :log_info "Step 3: Checking for existing processes..."
call :kill_process_on_port %SERVER_PORT%
call :kill_process_on_port %CLIENT_PORT%

REM Step 4: Check and install dependencies
call :log_info "Step 4: Checking and installing dependencies..."

REM Root dependencies
call :check_dependencies "." "root"
if %errorlevel% neq 0 (
    call :log_info "Installing root dependencies..."
    call :install_dependencies "." "root"
    if %errorlevel% neq 0 (
        call :log_error "Failed to install root dependencies"
        exit /b 1
    )
)

REM Server dependencies
call :check_dependencies "server" "server"
if %errorlevel% neq 0 (
    call :log_info "Installing server dependencies..."
    call :install_dependencies "server" "server"
    if %errorlevel% neq 0 (
        call :log_error "Failed to install server dependencies"
        exit /b 1
    )
)

REM Client dependencies
call :check_dependencies "client" "client"
if %errorlevel% neq 0 (
    call :log_info "Installing client dependencies..."
    call :install_dependencies "client" "client"
    if %errorlevel% neq 0 (
        call :log_error "Failed to install client dependencies"
        exit /b 1
    )
)

REM Step 5: Start the application
call :log_info "Step 5: Starting the application..."

REM Start server in background
call :log_info "Starting server..."
cd /d server
start /b npm start > ..\server.log 2>&1
cd /d ..

REM Wait for server to start
timeout /t 5 /nobreak >nul

REM Check server health
call :check_service_health %SERVER_PORT% "Server"
set "server_health=%errorlevel%"
if %server_health% equ 0 (
    call :log_success "Server started successfully"
) else (
    call :log_warning "Server may not be responding"
)

REM Start client in background
call :log_info "Starting client..."
cd /d client
start /b npm start > ..\client.log 2>&1
cd /d ..

REM Wait for client to start
timeout /t 5 /nobreak >nul

REM Check client health
call :check_service_health %CLIENT_PORT% "Client"
set "client_health=%errorlevel%"
if %client_health% equ 0 (
    call :log_success "Client started successfully"
) else (
    call :log_warning "Client may not be responding"
)

REM Step 6: Final health check
call :log_info "Step 6: Final health check..."

REM Generate report
if %server_health% equ 0 (
    set "server_status=true"
    set "server_message=started successfully"
) else (
    set "server_status=false"
    set "server_message=may not be responding"
)

if %client_health% equ 0 (
    set "client_status=true"
    set "client_message=started successfully"
) else (
    set "client_status=false"
    set "client_message=may not be responding"
)

if %server_health% equ 0 if %client_health% equ 0 (
    set "final_status=true"
    set "final_message=Server: OK, Client: OK"
) else (
    set "final_status=false"
    set "final_message=Server: FAILED, Client: FAILED"
)

set "final_results={\"nodeCheck\": {\"success\": true}, \"npmCheck\": {\"success\": true}, \"filesCheck\": {\"success\": true}, \"processCleanup\": {\"success\": true, \"message\": \"Process cleanup completed\"}, \"rootDeps\": {\"success\": true, \"message\": \"Root dependencies ready\"}, \"serverDeps\": {\"success\": true, \"message\": \"Server dependencies ready\"}, \"clientDeps\": {\"success\": true, \"message\": \"Client dependencies ready\"}, \"serverStart\": {\"success\": %server_status%, \"message\": \"Server %server_message%\"}, \"clientStart\": {\"success\": %client_status%, \"message\": \"Client %client_message%\"}, \"finalHealth\": {\"success\": %final_status%, \"message\": \"%final_message%\"}}"

call :generate_report "%final_results%"

REM Summary
if %server_health% equ 0 if %client_health% equ 0 (
    call :log_success "🎉 PitchPerfect startup completed successfully!"
    call :log_info "Server: http://localhost:%SERVER_PORT%"
    call :log_info "Client: http://localhost:%CLIENT_PORT%"
    call :log_info "Press Ctrl+C to stop the application"
    
    REM Keep the script running and show logs
    call :log_info "Showing logs (Ctrl+C to stop)..."
    echo.
    echo Server and client are running. Check server.log and client.log for details.
    echo Press any key to exit...
    pause >nul
) else (
    call :log_error "❌ PitchPerfect startup completed with errors"
    call :log_info "Check the startup report for details"
    exit /b 1
)

goto :eof

REM Run the main function
call :main
