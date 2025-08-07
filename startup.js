#!/usr/bin/env node

/**
 * PitchPerfect Startup Script
 * 
 * This script ensures that all dependencies are installed and both server and client
 * are running properly. It provides detailed reporting and error handling.
 * 
 * Usage:
 *   node startup.js
 *   npm run startup
 */

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Configuration
const CONFIG = {
  serverPort: 5001,
  clientPort: 3000,
  timeout: 30000, // 30 seconds
  retries: 3
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Utility functions
function log(message, color = 'reset') {
  const timestamp = new Date().toISOString();
  console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
}

function logError(message) {
  log(`ERROR: ${message}`, 'red');
}

function logSuccess(message) {
  log(`SUCCESS: ${message}`, 'green');
}

function logWarning(message) {
  log(`WARNING: ${message}`, 'yellow');
}

function logInfo(message) {
  log(`INFO: ${message}`, 'blue');
}

// Check if running on Windows
function isWindows() {
  return os.platform() === 'win32';
}

// Check if a port is in use
function isPortInUse(port) {
  try {
    if (isWindows()) {
      const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
      return result.trim().length > 0;
    } else {
      const result = execSync(`lsof -i :${port}`, { encoding: 'utf8' });
      return result.trim().length > 0;
    }
  } catch (error) {
    return false;
  }
}

// Kill process on port
function killProcessOnPort(port) {
  try {
    if (isWindows()) {
      execSync(`for /f "tokens=5" %a in ('netstat -aon ^| findstr :${port}') do taskkill /f /pid %a`, { stdio: 'ignore' });
    } else {
      execSync(`lsof -ti :${port} | xargs kill -9`, { stdio: 'ignore' });
    }
    logInfo(`Killed process on port ${port}`);
  } catch (error) {
    logWarning(`Could not kill process on port ${port}: ${error.message}`);
  }
}

// Check if Node.js is installed
function checkNodeVersion() {
  try {
    const version = execSync('node --version', { encoding: 'utf8' }).trim();
    const majorVersion = parseInt(version.replace('v', '').split('.')[0]);
    
    if (majorVersion < 16) {
      throw new Error(`Node.js version ${version} is too old. Please install Node.js 16 or higher.`);
    }
    
    logSuccess(`Node.js version: ${version}`);
    return true;
  } catch (error) {
    logError(`Node.js check failed: ${error.message}`);
    return false;
  }
}

// Check if npm is installed
function checkNpmVersion() {
  try {
    const version = execSync('npm --version', { encoding: 'utf8' }).trim();
    logSuccess(`npm version: ${version}`);
    return true;
  } catch (error) {
    logError(`npm check failed: ${error.message}`);
    return false;
  }
}

// Check if required files exist
function checkRequiredFiles() {
  const requiredFiles = [
    'package.json',
    'server/package.json',
    'client/package.json',
    'server/index.js',
    'client/src/App.js'
  ];
  
  const missingFiles = [];
  
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      missingFiles.push(file);
    }
  }
  
  if (missingFiles.length > 0) {
    logError(`Missing required files: ${missingFiles.join(', ')}`);
    return false;
  }
  
  logSuccess('All required files found');
  return true;
}

// Install dependencies for a directory
function installDependencies(dir, name) {
  return new Promise((resolve, reject) => {
    logInfo(`Installing dependencies for ${name}...`);
    
    const npmCommand = isWindows() ? 'npm.cmd' : 'npm';
    const installProcess = spawn(npmCommand, ['install'], {
      cwd: dir,
      stdio: 'pipe',
      shell: true
    });
    
    let output = '';
    let errorOutput = '';
    
    installProcess.stdout.on('data', (data) => {
      output += data.toString();
      process.stdout.write(data);
    });
    
    installProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      process.stderr.write(data);
    });
    
    installProcess.on('close', (code) => {
      if (code === 0) {
        logSuccess(`Dependencies installed for ${name}`);
        resolve();
      } else {
        logError(`Failed to install dependencies for ${name}: ${errorOutput}`);
        reject(new Error(`Installation failed with code ${code}`));
      }
    });
    
    installProcess.on('error', (error) => {
      logError(`Failed to start installation for ${name}: ${error.message}`);
      reject(error);
    });
  });
}

// Check if dependencies are installed
function checkDependencies(dir, name) {
  try {
    const nodeModulesPath = path.join(dir, 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
      logWarning(`node_modules not found in ${name}`);
      return false;
    }
    
    // Check if package.json exists and has dependencies
    const packageJsonPath = path.join(dir, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      logWarning(`package.json not found in ${name}`);
      return false;
    }
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    if (!packageJson.dependencies && !packageJson.devDependencies) {
      logWarning(`No dependencies found in ${name}/package.json`);
      return false;
    }
    
    logSuccess(`Dependencies found for ${name}`);
    return true;
  } catch (error) {
    logError(`Error checking dependencies for ${name}: ${error.message}`);
    return false;
  }
}

// Start a process and monitor it
function startProcess(command, args, cwd, name) {
  return new Promise((resolve, reject) => {
    logInfo(`Starting ${name}...`);
    
    const process = spawn(command, args, {
      cwd: cwd,
      stdio: 'pipe',
      shell: true,
      env: { ...process.env, FORCE_COLOR: '1' }
    });
    
    let output = '';
    let errorOutput = '';
    
    process.stdout.on('data', (data) => {
      output += data.toString();
      process.stdout.write(data);
    });
    
    process.stderr.on('data', (data) => {
      errorOutput += data.toString();
      process.stderr.write(data);
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        logSuccess(`${name} started successfully`);
        resolve();
      } else {
        logError(`${name} failed to start: ${errorOutput}`);
        reject(new Error(`${name} failed with code ${code}`));
      }
    });
    
    process.on('error', (error) => {
      logError(`Failed to start ${name}: ${error.message}`);
      reject(error);
    });
    
    // Set a timeout
    setTimeout(() => {
      if (process.exitCode === null) {
        logSuccess(`${name} is running (timeout reached)`);
        resolve();
      }
    }, CONFIG.timeout);
  });
}

// Check if a service is responding
function checkServiceHealth(port, name) {
  return new Promise((resolve) => {
    const http = require('http');
    const options = {
      hostname: 'localhost',
      port: port,
      path: '/',
      method: 'GET',
      timeout: 5000
    };
    
    const req = http.request(options, (res) => {
      if (res.statusCode === 200 || res.statusCode === 404) {
        logSuccess(`${name} is responding on port ${port}`);
        resolve(true);
      } else {
        logWarning(`${name} responded with status ${res.statusCode}`);
        resolve(false);
      }
    });
    
    req.on('error', (error) => {
      logError(`${name} health check failed: ${error.message}`);
      resolve(false);
    });
    
    req.on('timeout', () => {
      logError(`${name} health check timed out`);
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

// Generate a comprehensive report
function generateReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    platform: os.platform(),
    nodeVersion: process.version,
    results: results
  };
  
  const reportPath = path.join(process.cwd(), 'startup-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  logInfo(`Report saved to: ${reportPath}`);
  
  // Also create a human-readable report
  const humanReportPath = path.join(process.cwd(), 'startup-report.txt');
  let humanReport = `PitchPerfect Startup Report
Generated: ${new Date().toISOString()}
Platform: ${os.platform()}
Node Version: ${process.version}

`;

  for (const [step, result] of Object.entries(results)) {
    humanReport += `${step}: ${result.success ? 'SUCCESS' : 'FAILED'}\n`;
    if (result.message) {
      humanReport += `  ${result.message}\n`;
    }
    if (result.error) {
      humanReport += `  Error: ${result.error}\n`;
    }
    humanReport += '\n';
  }
  
  fs.writeFileSync(humanReportPath, humanReport);
  logInfo(`Human-readable report saved to: ${humanReportPath}`);
}

// Main startup function
async function startup() {
  const results = {};
  
  logInfo('Starting PitchPerfect application...');
  logInfo(`Platform: ${os.platform()}`);
  logInfo(`Node version: ${process.version}`);
  
  try {
    // Step 1: Check Node.js and npm
    logInfo('Step 1: Checking Node.js and npm...');
    results.nodeCheck = { success: checkNodeVersion() };
    results.npmCheck = { success: checkNpmVersion() };
    
    if (!results.nodeCheck.success || !results.npmCheck.success) {
      throw new Error('Node.js or npm check failed');
    }
    
    // Step 2: Check required files
    logInfo('Step 2: Checking required files...');
    results.filesCheck = { success: checkRequiredFiles() };
    
    if (!results.filesCheck.success) {
      throw new Error('Required files check failed');
    }
    
    // Step 3: Kill existing processes
    logInfo('Step 3: Checking for existing processes...');
    if (isPortInUse(CONFIG.serverPort)) {
      logWarning(`Port ${CONFIG.serverPort} is in use, killing existing process...`);
      killProcessOnPort(CONFIG.serverPort);
    }
    
    if (isPortInUse(CONFIG.clientPort)) {
      logWarning(`Port ${CONFIG.clientPort} is in use, killing existing process...`);
      killProcessOnPort(CONFIG.clientPort);
    }
    
    results.processCleanup = { success: true, message: 'Process cleanup completed' };
    
    // Step 4: Check and install dependencies
    logInfo('Step 4: Checking and installing dependencies...');
    
    // Root dependencies
    if (!checkDependencies('.', 'root')) {
      logInfo('Installing root dependencies...');
      await installDependencies('.', 'root');
    }
    results.rootDeps = { success: true, message: 'Root dependencies ready' };
    
    // Server dependencies
    if (!checkDependencies('server', 'server')) {
      logInfo('Installing server dependencies...');
      await installDependencies('server', 'server');
    }
    results.serverDeps = { success: true, message: 'Server dependencies ready' };
    
    // Client dependencies
    if (!checkDependencies('client', 'client')) {
      logInfo('Installing client dependencies...');
      await installDependencies('client', 'client');
    }
    results.clientDeps = { success: true, message: 'Client dependencies ready' };
    
    // Step 5: Start the application
    logInfo('Step 5: Starting the application...');
    
    // Start server
    try {
      const serverProcess = spawn(isWindows() ? 'npm.cmd' : 'npm', ['start'], {
        cwd: 'server',
        stdio: 'pipe',
        shell: true,
        env: { ...process.env, FORCE_COLOR: '1' }
      });
      
      // Wait a bit for server to start
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Check if server is responding
      const serverHealth = await checkServiceHealth(CONFIG.serverPort, 'Server');
      results.serverStart = { success: serverHealth, message: serverHealth ? 'Server started successfully' : 'Server may not be responding' };
      
    } catch (error) {
      results.serverStart = { success: false, error: error.message };
    }
    
    // Start client
    try {
      const clientProcess = spawn(isWindows() ? 'npm.cmd' : 'npm', ['start'], {
        cwd: 'client',
        stdio: 'pipe',
        shell: true,
        env: { ...process.env, FORCE_COLOR: '1' }
      });
      
      // Wait a bit for client to start
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Check if client is responding
      const clientHealth = await checkServiceHealth(CONFIG.clientPort, 'Client');
      results.clientStart = { success: clientHealth, message: clientHealth ? 'Client started successfully' : 'Client may not be responding' };
      
    } catch (error) {
      results.clientStart = { success: false, error: error.message };
    }
    
    // Step 6: Final health check
    logInfo('Step 6: Final health check...');
    const finalServerHealth = await checkServiceHealth(CONFIG.serverPort, 'Server');
    const finalClientHealth = await checkServiceHealth(CONFIG.clientPort, 'Client');
    
    results.finalHealth = {
      success: finalServerHealth && finalClientHealth,
      message: `Server: ${finalServerHealth ? 'OK' : 'FAILED'}, Client: ${finalClientHealth ? 'OK' : 'FAILED'}`
    };
    
    // Generate report
    generateReport(results);
    
    // Summary
    const allSuccess = Object.values(results).every(result => result.success);
    
    if (allSuccess) {
      logSuccess('🎉 PitchPerfect startup completed successfully!');
      logInfo(`Server: http://localhost:${CONFIG.serverPort}`);
      logInfo(`Client: http://localhost:${CONFIG.clientPort}`);
      logInfo('Press Ctrl+C to stop the application');
    } else {
      logError('❌ PitchPerfect startup completed with errors');
      logInfo('Check the startup report for details');
      process.exit(1);
    }
    
  } catch (error) {
    logError(`Startup failed: ${error.message}`);
    results.startupError = { success: false, error: error.message };
    generateReport(results);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  logInfo('Shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logInfo('Shutting down...');
  process.exit(0);
});

// Run the startup
if (require.main === module) {
  startup().catch((error) => {
    logError(`Unhandled error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { startup, checkNodeVersion, checkNpmVersion, checkRequiredFiles };
