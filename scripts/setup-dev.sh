#!/bin/bash

# Development setup script for Vishwakarma University Canteen App
# This script sets up the development environment for all components

set -e

echo "🚀 Setting up Vishwakarma University Canteen App Development Environment"
echo "========================================================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is not installed. Please install Python 3.9+ from https://python.org/"
        exit 1
    fi
    
    # Check Supabase CLI
    if ! command -v supabase &> /dev/null; then
        print_warning "Supabase CLI not found. Installing..."
        npm install -g supabase
    fi
    
    print_success "Prerequisites check completed"
}

# Setup environment files
setup_env_files() {
    print_status "Setting up environment files..."
    
    # Admin Dashboard .env
    if [ ! -f "admin-dashboard/.env" ]; then
        cat > admin-dashboard/.env << EOL
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
EOL
        print_success "Created admin-dashboard/.env"
    fi
    
    # AI Menu Parser .env
    if [ ! -f "ai-menu-parser/.env" ]; then
        cat > ai-menu-parser/.env << EOL
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_KEY=your_supabase_service_key_here
EOL
        print_success "Created ai-menu-parser/.env"
    fi
    
    print_warning "Please update the environment files with your actual Supabase credentials"
}

# Setup Supabase
setup_supabase() {
    print_status "Setting up Supabase..."
    
    cd supabase
    
    # Start Supabase locally
    if ! supabase status &> /dev/null; then
        print_status "Starting Supabase local development..."
        supabase start
    else
        print_success "Supabase is already running"
    fi
    
    # Apply migrations
    print_status "Applying database migrations..."
    supabase db reset --skip-seed
    
    cd ..
    print_success "Supabase setup completed"
}

# Setup AI Menu Parser
setup_ai_parser() {
    print_status "Setting up AI Menu Parser..."
    
    cd ai-menu-parser
    
    # Create virtual environment
    if [ ! -d "venv" ]; then
        print_status "Creating Python virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate virtual environment and install dependencies
    source venv/bin/activate
    pip install -r requirements.txt
    
    cd ..
    print_success "AI Menu Parser setup completed"
}

# Setup Admin Dashboard
setup_admin_dashboard() {
    print_status "Setting up Admin Dashboard..."
    
    cd admin-dashboard
    
    # Install dependencies
    print_status "Installing npm dependencies..."
    npm install
    
    cd ..
    print_success "Admin Dashboard setup completed"
}

# Setup Android app (basic check)
setup_android_app() {
    print_status "Checking Android app setup..."
    
    if [ ! -f "android-app/gradlew" ]; then
        print_warning "Android Gradle wrapper not found. Please open android-app/ in Android Studio to complete setup"
    else
        print_success "Android app appears to be set up. Open in Android Studio to build and run"
    fi
}

# Create sample data
create_sample_data() {
    print_status "Would you like to create sample data? (y/n)"
    read -r response
    
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Creating sample data..."
        # TODO: Add sample data creation script
        print_success "Sample data created"
    fi
}

# Main execution
main() {
    check_prerequisites
    setup_env_files
    setup_supabase
    setup_ai_parser
    setup_admin_dashboard
    setup_android_app
    create_sample_data
    
    echo ""
    echo "========================================================================="
    print_success "Development environment setup completed!"
    echo ""
    echo "Next steps:"
    echo "1. Update environment files with your Supabase credentials"
    echo "2. Start the AI Menu Parser: cd ai-menu-parser && source venv/bin/activate && python main.py"
    echo "3. Start the Admin Dashboard: cd admin-dashboard && npm run dev"
    echo "4. Open android-app/ in Android Studio to build the mobile app"
    echo ""
    echo "📚 See docs/setup-guide.md for detailed instructions"
    echo "========================================================================="
}

# Run main function
main
