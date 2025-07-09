# PowerShell setup script for Windows
# Development setup script for Vishwakarma University Canteen App

Write-Host "🚀 Setting up Vishwakarma University Canteen App Development Environment" -ForegroundColor Blue
Write-Host "=========================================================================" -ForegroundColor Blue

function Write-Status {
    param($Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Write-Success {
    param($Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param($Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param($Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check prerequisites
function Check-Prerequisites {
    Write-Status "Checking prerequisites..."
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        Write-Success "Node.js found: $nodeVersion"
    }
    catch {
        Write-Error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    }
    
    # Check Python
    try {
        $pythonVersion = python --version
        Write-Success "Python found: $pythonVersion"
    }
    catch {
        Write-Error "Python is not installed. Please install Python 3.9+ from https://python.org/"
        exit 1
    }
    
    # Check npm
    try {
        $npmVersion = npm --version
        Write-Success "npm found: $npmVersion"
    }
    catch {
        Write-Error "npm is not available. Please ensure Node.js is properly installed."
        exit 1
    }
    
    Write-Success "Prerequisites check completed"
}

# Setup environment files
function Setup-EnvFiles {
    Write-Status "Setting up environment files..."
    
    # Admin Dashboard .env
    if (-not (Test-Path "admin-dashboard\.env")) {
        @"
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
"@ | Out-File -FilePath "admin-dashboard\.env" -Encoding UTF8
        Write-Success "Created admin-dashboard\.env"
    }
    
    # AI Menu Parser .env
    if (-not (Test-Path "ai-menu-parser\.env")) {
        @"
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_KEY=your_supabase_service_key_here
"@ | Out-File -FilePath "ai-menu-parser\.env" -Encoding UTF8
        Write-Success "Created ai-menu-parser\.env"
    }
    
    Write-Warning "Please update the environment files with your actual Supabase credentials"
}

# Setup AI Menu Parser
function Setup-AiParser {
    Write-Status "Setting up AI Menu Parser..."
    
    Set-Location "ai-menu-parser"
    
    # Install Python dependencies
    Write-Status "Installing Python dependencies..."
    try {
        pip install -r requirements.txt
        Write-Success "Python dependencies installed"
    }
    catch {
        Write-Error "Failed to install Python dependencies. Please check your Python/pip installation."
    }
    
    Set-Location ".."
    Write-Success "AI Menu Parser setup completed"
}

# Setup Admin Dashboard
function Setup-AdminDashboard {
    Write-Status "Setting up Admin Dashboard..."
    
    Set-Location "admin-dashboard"
    
    # Install npm dependencies
    Write-Status "Installing npm dependencies..."
    try {
        npm install
        Write-Success "npm dependencies installed"
    }
    catch {
        Write-Error "Failed to install npm dependencies. Please check your Node.js/npm installation."
    }
    
    Set-Location ".."
    Write-Success "Admin Dashboard setup completed"
}

# Check Android setup
function Check-AndroidSetup {
    Write-Status "Checking Android app setup..."
    
    if (Test-Path "android-app\gradlew.bat") {
        Write-Success "Android Gradle wrapper found. Open android-app\ in Android Studio to build and run"
    }
    else {
        Write-Warning "Android Gradle wrapper not found. Please open android-app\ in Android Studio to complete setup"
    }
}

# Main execution
function Main {
    try {
        Check-Prerequisites
        Setup-EnvFiles
        Setup-AiParser
        Setup-AdminDashboard
        Check-AndroidSetup
        
        Write-Host ""
        Write-Host "=========================================================================" -ForegroundColor Blue
        Write-Success "Development environment setup completed!"
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "1. Update environment files with your Supabase credentials" -ForegroundColor Yellow
        Write-Host "2. Start the AI Menu Parser: cd ai-menu-parser && python main.py" -ForegroundColor Yellow
        Write-Host "3. Start the Admin Dashboard: cd admin-dashboard && npm run dev" -ForegroundColor Yellow
        Write-Host "4. Open android-app\ in Android Studio to build the mobile app" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "📚 See docs\setup-guide.md for detailed instructions" -ForegroundColor Cyan
        Write-Host "=========================================================================" -ForegroundColor Blue
    }
    catch {
        Write-Error "Setup failed: $($_.Exception.Message)"
        exit 1
    }
}

# Run main function
Main
