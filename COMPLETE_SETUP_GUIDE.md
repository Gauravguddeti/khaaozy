# 🚀 Complete Setup Guide - VU Canteen App

This guide will help you set up and run the complete Vishwakarma University Canteen App with all components.

## 📋 What You Need from Supabase

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create an account
2. Click "New Project" and choose:
   - Organization: Your organization
   - Name: "VU Canteen App" (or any name you prefer)
   - Database Password: Create a strong password
   - Region: Choose the closest to your users (e.g., Asia South for India)

### Step 2: Get Your Credentials
After your project is ready (takes 2-3 minutes), go to **Settings > API**:

📝 **Copy these three values:**
- **Project URL**: `https://your-project-id.supabase.co`
- **Anon/Public Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long string)
- **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (different long string)

### Step 3: Set Up Database
1. Go to **SQL Editor** in Supabase
2. Copy and run these files **in order**:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql` 
   - `supabase/migrations/003_sample_data.sql`

### Step 4: Set Up Storage
1. Go to **Storage** in Supabase
2. Create these buckets:
   - `menu-images` (make it **public**)
   - `user-avatars` (make it **public**)
   - `menu-uploads` (keep **private**)

### Step 5: Configure Authentication
1. Go to **Authentication > Settings**
2. Set **Site URL** to `http://localhost:3000`
3. Enable **Email/Password** authentication
4. For development, disable **Confirm Email**

## 🔧 Setup Instructions

### Prerequisites
Install these on your system:
- **Node.js 18+** from [nodejs.org](https://nodejs.org)
- **Python 3.9+** from [python.org](https://python.org)
- **Android Studio** for mobile app development

### Quick Setup (Automated)

#### Windows (PowerShell)
```powershell
# Navigate to project directory
cd d:\projects\canteenapp

# Run the setup script
.\scripts\setup-dev.ps1
```

#### Linux/Mac (Bash)
```bash
# Navigate to project directory
cd /path/to/canteenapp

# Make script executable and run
chmod +x scripts/setup-dev.sh
./scripts/setup-dev.sh
```

### Manual Setup

#### 1. Admin Dashboard
```bash
cd admin-dashboard

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your Supabase credentials:
# VITE_SUPABASE_URL=https://your-project-id.supabase.co
# VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Start development server
npm run dev
```
Dashboard will be available at `http://localhost:5173`

#### 2. AI Menu Parser
```bash
cd ai-menu-parser

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
# Create .env file with:
# SUPABASE_URL=https://your-project-id.supabase.co
# SUPABASE_SERVICE_KEY=your_service_role_key_here

# Start the API server
python main.py
```
API will be available at `http://localhost:8000`

#### 3. Android App
```bash
# Open android-app/ folder in Android Studio
# Update app/build.gradle.kts with your Supabase credentials:

buildConfigField("String", "SUPABASE_URL", "\"https://your-project-id.supabase.co\"")
buildConfigField("String", "SUPABASE_ANON_KEY", "\"your_anon_key_here\"")

# Sync project and run on emulator or device
```

## 🚀 Running the Complete System

### Start All Services
1. **Database**: Supabase (cloud - always running)
2. **Admin Dashboard**: `npm run dev` in `admin-dashboard/`
3. **AI Menu Parser**: `python main.py` in `ai-menu-parser/`
4. **Android App**: Build and run in Android Studio

### Service URLs
- **Admin Dashboard**: http://localhost:5173
- **AI Menu Parser**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Supabase Dashboard**: https://supabase.com/dashboard

## 👥 Test User Accounts

After running the sample data migration, you can use these test accounts:

### Admin User
- **Email**: admin@vishwakarma.edu
- **Password**: admin123
- **Role**: Admin
- **Access**: Full admin dashboard

### Canteen Owner
- **Email**: owner@maincanteen.vu.edu
- **Password**: owner123
- **Role**: Owner
- **Access**: Canteen management

### Student
- **Email**: john.smith@student.vu.edu
- **Password**: student123
- **Role**: Student
- **Access**: Mobile app ordering

## 🏗️ Project Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Android App   │    │ Admin Dashboard │    │ AI Menu Parser  │
│ (Kotlin/Compose)│    │   (React/TS)    │    │    (Python)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │    Supabase     │
                    │  (PostgreSQL)   │
                    │   + Auth + API  │
                    └─────────────────┘
```

## 🔐 Security Features

- **Row Level Security (RLS)**: Users only see their college's data
- **JWT Authentication**: Secure token-based auth
- **Role-based Access**: Students, Owners, Admins have different permissions
- **Multi-tenant**: Each college's data is completely isolated

## 📱 Features Included

### For Students & Faculty
✅ Browse canteens by college  
✅ View menus with real-time availability  
✅ Place orders (dine-in/takeaway)  
✅ Track order status  
✅ Order history and feedback  

### For Canteen Owners
✅ AI-powered menu upload (OCR)  
✅ Manual menu management  
✅ Order management  
✅ Sales analytics  
✅ Operating hours management  

### For Administrators
✅ Multi-college management  
✅ Canteen oversight  
✅ User account management  
✅ Comprehensive analytics  
✅ System monitoring  

## 🚢 Deployment

### Admin Dashboard (Vercel)
1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

### AI Menu Parser (Railway/Heroku)
1. Create `requirements.txt` (already provided)
2. Create `Procfile`: `web: uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Deploy to Railway or Heroku with environment variables

### Android App (Google Play)
1. Build release APK in Android Studio
2. Sign with release keystore
3. Upload to Google Play Console

## 🆘 Troubleshooting

### Common Issues

**"Cannot find module" errors in admin dashboard**
```bash
cd admin-dashboard
rm -rf node_modules package-lock.json
npm install
```

**Python dependencies not installing**
```bash
# Ensure you're in virtual environment
pip install --upgrade pip
pip install -r requirements.txt
```

**Supabase connection errors**
- Check your `.env` files have correct credentials
- Verify your Supabase project is running
- Check if database migrations were applied

**Android build errors**
- Clean and rebuild project in Android Studio
- Check if Supabase credentials are properly set in build.gradle.kts
- Ensure Kotlin and Compose versions are compatible

### Getting Help
- Check the logs in each service's terminal
- Verify environment variables are set correctly
- Ensure Supabase database migrations are applied
- Check that all services are running on different ports

## 🎯 Next Steps

Once everything is running:

1. **Test the complete flow**: Sign up → Browse canteens → Place order → Check admin dashboard
2. **Upload menu images**: Test AI OCR functionality
3. **Customize**: Update branding, colors, and college information
4. **Deploy**: Push to production when ready

---

**Need help?** Check the individual README files in each component folder for detailed instructions.
