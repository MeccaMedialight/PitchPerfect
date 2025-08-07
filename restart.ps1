# PitchPerfect Application Restart Script
# This script stops all running instances and restarts the application cleanly

param(
    [switch]$Force,
    [switch]$SkipInstall
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PitchPerfect Application Restart Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if a port is in use
function Test-Port {
    param([int]$Port)
    try {
        $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        return $connection -ne $null
    }
    catch {
        return $false
    }
}

# Function to stop processes by port
function Stop-ProcessByPort {
    param([int]$Port)
    try {
        $processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | 
                    Select-Object -ExpandProperty OwningProcess | 
                    ForEach-Object { Get-Process -Id $_ -ErrorAction SilentlyContinue }
        
        foreach ($process in $processes) {
            Write-Host "Stopping process $($process.ProcessName) (PID: $($process.Id)) on port $Port" -ForegroundColor Yellow
            Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        }
        return $true
    }
    catch {
        return $false
    }
}

# Function to read .env file and extract values
function Read-EnvFile {
    param([string]$FilePath)
    $envVars = @{}
    
    if (Test-Path $FilePath) {
        $content = Get-Content $FilePath -ErrorAction SilentlyContinue
        foreach ($line in $content) {
            if ($line -match '^([^#][^=]+)=(.*)$') {
                $key = $matches[1].Trim()
                $value = $matches[2].Trim()
                $envVars[$key] = $value
            }
        }
    }
    
    return $envVars
}

Write-Host "[1/7] Checking for .env file..." -ForegroundColor Green
$envFile = ".env"
if (-not (Test-Path $envFile)) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "Please create a .env file with the following variables:" -ForegroundColor Yellow
    Write-Host "   PORT=5001" -ForegroundColor White
    Write-Host "   CLIENT_URL=http://localhost:3000" -ForegroundColor White
    Write-Host "   REACT_APP_SERVER_URL=http://localhost:5001" -ForegroundColor White
    Write-Host "   REACT_APP_CLIENT_URL=http://localhost:3000" -ForegroundColor White
    Write-Host "   REACT_APP_API_BASE_URL=http://localhost:5001/api" -ForegroundColor White
    exit 1
} else {
    Write-Host "✓ .env file found" -ForegroundColor Green
}

Write-Host ""
Write-Host "[2/7] Reading .env configuration..." -ForegroundColor Green
$envVars = Read-EnvFile -FilePath $envFile

# Extract ports from .env or use defaults from server config
$serverPort = if ($envVars.PORT) { [int]$envVars.PORT } else { 5001 }
$clientPort = 3000  # React default port

# Extract URLs from .env or use defaults from config files
$serverUrl = if ($envVars.REACT_APP_SERVER_URL) { $envVars.REACT_APP_SERVER_URL } else { "http://localhost:$serverPort" }
$clientUrl = if ($envVars.REACT_APP_CLIENT_URL) { $envVars.REACT_APP_CLIENT_URL } else { "http://localhost:$clientPort" }
$apiBaseUrl = if ($envVars.REACT_APP_API_BASE_URL) { $envVars.REACT_APP_API_BASE_URL } else { "http://localhost:$serverPort/api" }

Write-Host "Server Port: $serverPort" -ForegroundColor White
Write-Host "Client Port: $clientPort" -ForegroundColor White
Write-Host "Server URL: $serverUrl" -ForegroundColor White
Write-Host "Client URL: $clientUrl" -ForegroundColor White
Write-Host "API Base URL: $apiBaseUrl" -ForegroundColor White

Write-Host ""
Write-Host "[3/7] Checking for running processes..." -ForegroundColor Green

# Check for processes on the configured ports
$portsToCheck = @($serverPort, $clientPort)
$foundProcesses = $false

foreach ($port in $portsToCheck) {
    if (Test-Port -Port $port) {
        Write-Host "Found process running on port $port" -ForegroundColor Yellow
        Stop-ProcessByPort -Port $port
        $foundProcesses = $true
    }
}

# Also check for any Node.js processes that might be running the app
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "Found $($nodeProcesses.Count) Node.js process(es)" -ForegroundColor Yellow
    foreach ($process in $nodeProcesses) {
        # Check if this is a PitchPerfect process by looking at command line
        try {
            $processInfo = Get-WmiObject -Class Win32_Process -Filter "ProcessId = $($process.Id)" -ErrorAction SilentlyContinue
            if ($processInfo -and ($processInfo.CommandLine -like "*PitchPerfect*" -or $processInfo.CommandLine -like "*server*" -or $processInfo.CommandLine -like "*client*")) {
                Write-Host "Stopping PitchPerfect Node.js process (PID: $($process.Id))" -ForegroundColor Yellow
                Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
                $foundProcesses = $true
            }
        }
        catch {
            # If we can't check the command line, stop the process anyway
            Write-Host "Stopping Node.js process (PID: $($process.Id))" -ForegroundColor Yellow
            Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
            $foundProcesses = $true
        }
    }
}

if (-not $foundProcesses) {
    Write-Host "✓ No running processes found" -ForegroundColor Green
}

Write-Host ""
Write-Host "[4/7] Waiting for processes to fully terminate..." -ForegroundColor Green
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "[5/7] Validating .env file..." -ForegroundColor Green
$requiredVars = @("PORT", "CLIENT_URL", "REACT_APP_SERVER_URL")
$missingVars = @()

foreach ($var in $requiredVars) {
    if (-not $envVars.ContainsKey($var)) {
        $missingVars += $var
    }
}

if ($missingVars.Count -gt 0) {
    Write-Host "⚠ Warning: Missing environment variables: $($missingVars -join ', ')" -ForegroundColor Yellow
    Write-Host "Using default values from server/client config..." -ForegroundColor White
} else {
    Write-Host "✓ .env file appears to be properly configured" -ForegroundColor Green
}

if (-not $SkipInstall) {
    Write-Host ""
    Write-Host "[6/7] Installing dependencies..." -ForegroundColor Green
    try {
        npm run install-all
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
        } else {
            Write-Host "⚠ Warning: Some dependencies may not have installed correctly" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠ Warning: Could not install dependencies" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "[6/7] Skipping dependency installation..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[7/7] Starting the application..." -ForegroundColor Green
Write-Host "Starting server and client with .env configuration..." -ForegroundColor White
Write-Host ""

# Display expected URLs based on .env configuration
Write-Host "The application will be available at:" -ForegroundColor Cyan
Write-Host "- Client: $clientUrl" -ForegroundColor White
Write-Host "- Server: $serverUrl" -ForegroundColor White
Write-Host "- API: $apiBaseUrl" -ForegroundColor White
Write-Host ""

Write-Host "Press Ctrl+C to stop the application" -ForegroundColor Yellow
Write-Host ""

try {
    npm start
} catch {
    Write-Host "❌ Failed to start the application" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} 