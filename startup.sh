#!/bin/bash

# PitchPerfect Startup Script for Unix-like systems (Mac/Linux)
# 
# This script ensures that all dependencies are installed and both server and client
# are running properly. It provides detailed reporting and error handling.
# 
# Usage:
#   ./startup.sh
#   bash startup.sh

set -e  # Exit on any error

# Colors for console output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SERVER_PORT=5001
CLIENT_PORT=3000
TIMEOUT=30
RETRIES=3

# Utility functions
log() {
    local message="$1"
    local color="${2:-NC}"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    echo -e "${!color}[${timestamp}] ${message}${NC}"
}

log_error() {
    log "ERROR: $1" "RED"
}

log_success() {
    log "SUCCESS: $1" "GREEN"
}

log_warning() {
    log "WARNING: $1" "YELLOW"
}

log_info() {
    log "INFO: $1" "BLUE"
}

# Check if a port is in use
is_port_in_use() {
    local port=$1
    if lsof -i :$port >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is not in use
    fi
}

# Kill process on port
kill_process_on_port() {
    local port=$1
    if is_port_in_use $port; then
        log_warning "Port $port is in use, killing existing process..."
        lsof -ti :$port | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Check if Node.js is installed
check_node_version() {
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        return 1
    fi
    
    local version=$(node --version)
    local major_version=$(echo $version | sed 's/v//' | cut -d. -f1)
    
    if [ "$major_version" -lt 16 ]; then
        log_error "Node.js version $version is too old. Please install Node.js 16 or higher."
        return 1
    fi
    
    log_success "Node.js version: $version"
    return 0
}

# Check if npm is installed
check_npm_version() {
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        return 1
    fi
    
    local version=$(npm --version)
    log_success "npm version: $version"
    return 0
}

# Check if required files exist
check_required_files() {
    local required_files=(
        "package.json"
        "server/package.json"
        "client/package.json"
        "server/index.js"
        "client/src/App.js"
    )
    
    local missing_files=()
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            missing_files+=("$file")
        fi
    done
    
    if [ ${#missing_files[@]} -ne 0 ]; then
        log_error "Missing required files: ${missing_files[*]}"
        return 1
    fi
    
    log_success "All required files found"
    return 0
}

# Check if dependencies are installed
check_dependencies() {
    local dir=$1
    local name=$2
    
    if [ ! -d "$dir/node_modules" ]; then
        log_warning "node_modules not found in $name"
        return 1
    fi
    
    if [ ! -f "$dir/package.json" ]; then
        log_warning "package.json not found in $name"
        return 1
    fi
    
    log_success "Dependencies found for $name"
    return 0
}

# Install dependencies for a directory
install_dependencies() {
    local dir=$1
    local name=$2
    
    log_info "Installing dependencies for $name..."
    
    if ! npm install --prefix "$dir"; then
        log_error "Failed to install dependencies for $name"
        return 1
    fi
    
    log_success "Dependencies installed for $name"
    return 0
}

# Check if a service is responding
check_service_health() {
    local port=$1
    local name=$2
    
    if curl -s -o /dev/null -w "%{http_code}" "http://localhost:$port" | grep -q "200\|404"; then
        log_success "$name is responding on port $port"
        return 0
    else
        log_error "$name health check failed"
        return 1
    fi
}

# Generate a comprehensive report
generate_report() {
    local results="$1"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    local platform=$(uname -s)
    local node_version=$(node --version)
    
    # JSON report
    cat > startup-report.json << EOF
{
  "timestamp": "$timestamp",
  "platform": "$platform",
  "nodeVersion": "$node_version",
  "results": $results
}
EOF
    
    log_info "Report saved to: startup-report.json"
    
    # Human-readable report
    cat > startup-report.txt << EOF
PitchPerfect Startup Report
Generated: $timestamp
Platform: $platform
Node Version: $node_version

$results
EOF
    
    log_info "Human-readable report saved to: startup-report.txt"
}

# Main startup function
main() {
    local results="{}"
    
    log_info "Starting PitchPerfect application..."
    log_info "Platform: $(uname -s)"
    log_info "Node version: $(node --version)"
    
    # Step 1: Check Node.js and npm
    log_info "Step 1: Checking Node.js and npm..."
    if ! check_node_version; then
        log_error "Node.js check failed"
        exit 1
    fi
    
    if ! check_npm_version; then
        log_error "npm check failed"
        exit 1
    fi
    
    # Step 2: Check required files
    log_info "Step 2: Checking required files..."
    if ! check_required_files; then
        log_error "Required files check failed"
        exit 1
    fi
    
    # Step 3: Kill existing processes
    log_info "Step 3: Checking for existing processes..."
    kill_process_on_port $SERVER_PORT
    kill_process_on_port $CLIENT_PORT
    
    # Step 4: Check and install dependencies
    log_info "Step 4: Checking and installing dependencies..."
    
    # Root dependencies
    if ! check_dependencies "." "root"; then
        log_info "Installing root dependencies..."
        if ! install_dependencies "." "root"; then
            log_error "Failed to install root dependencies"
            exit 1
        fi
    fi
    
    # Server dependencies
    if ! check_dependencies "server" "server"; then
        log_info "Installing server dependencies..."
        if ! install_dependencies "server" "server"; then
            log_error "Failed to install server dependencies"
            exit 1
        fi
    fi
    
    # Client dependencies
    if ! check_dependencies "client" "client"; then
        log_info "Installing client dependencies..."
        if ! install_dependencies "client" "client"; then
            log_error "Failed to install client dependencies"
            exit 1
        fi
    fi
    
    # Step 5: Start the application
    log_info "Step 5: Starting the application..."
    
    # Start server in background
    log_info "Starting server..."
    cd server && npm start > ../server.log 2>&1 &
    local server_pid=$!
    cd ..
    
    # Wait for server to start
    sleep 5
    
    # Check server health
    if check_service_health $SERVER_PORT "Server"; then
        log_success "Server started successfully"
    else
        log_warning "Server may not be responding"
    fi
    
    # Start client in background
    log_info "Starting client..."
    cd client && npm start > ../client.log 2>&1 &
    local client_pid=$!
    cd ..
    
    # Wait for client to start
    sleep 5
    
    # Check client health
    if check_service_health $CLIENT_PORT "Client"; then
        log_success "Client started successfully"
    else
        log_warning "Client may not be responding"
    fi
    
    # Step 6: Final health check
    log_info "Step 6: Final health check..."
    local server_health=false
    local client_health=false
    
    if check_service_health $SERVER_PORT "Server"; then
        server_health=true
    fi
    
    if check_service_health $CLIENT_PORT "Client"; then
        client_health=true
    fi
    
    # Generate report
    local final_results="{
      \"nodeCheck\": {\"success\": true},
      \"npmCheck\": {\"success\": true},
      \"filesCheck\": {\"success\": true},
      \"processCleanup\": {\"success\": true, \"message\": \"Process cleanup completed\"},
      \"rootDeps\": {\"success\": true, \"message\": \"Root dependencies ready\"},
      \"serverDeps\": {\"success\": true, \"message\": \"Server dependencies ready\"},
      \"clientDeps\": {\"success\": true, \"message\": \"Client dependencies ready\"},
      \"serverStart\": {\"success\": $server_health, \"message\": \"Server ${server_health:+started successfully}${server_health:-may not be responding}\"},
      \"clientStart\": {\"success\": $client_health, \"message\": \"Client ${client_health:+started successfully}${client_health:-may not be responding}\"},
      \"finalHealth\": {\"success\": $([ \"$server_health\" = true ] && [ \"$client_health\" = true ] && echo true || echo false), \"message\": \"Server: ${server_health:+OK}${server_health:-FAILED}, Client: ${client_health:+OK}${client_health:-FAILED}\"}
    }"
    
    generate_report "$final_results"
    
    # Summary
    if [ "$server_health" = true ] && [ "$client_health" = true ]; then
        log_success "🎉 PitchPerfect startup completed successfully!"
        log_info "Server: http://localhost:$SERVER_PORT"
        log_info "Client: http://localhost:$CLIENT_PORT"
        log_info "Press Ctrl+C to stop the application"
        
        # Keep the script running and show logs
        log_info "Showing logs (Ctrl+C to stop)..."
        tail -f server.log client.log &
        local tail_pid=$!
        
        # Wait for interrupt
        trap "log_info 'Shutting down...'; kill $server_pid $client_pid $tail_pid 2>/dev/null; exit 0" INT TERM
        wait
    else
        log_error "❌ PitchPerfect startup completed with errors"
        log_info "Check the startup report for details"
        exit 1
    fi
}

# Run the main function
main "$@"
