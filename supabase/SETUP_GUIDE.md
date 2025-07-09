# Supabase Setup Instructions for Canteen App

## 🚀 Quick Setup Guide

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login and create a new project
3. Choose a region close to your users (e.g., Asia South for India)
4. Wait for the project to be ready (2-3 minutes)

### 2. Get Your Credentials
After project creation, go to **Settings > API** and copy:
- **Project URL**: `https://your-project-ref.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (public key)
- **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (private key)

### 3. Set Up Database
Go to **SQL Editor** in your Supabase dashboard and run these scripts in order:

1. **Schema Setup**: Copy and paste `migrations/001_initial_schema.sql`
2. **Security Policies**: Copy and paste `migrations/002_rls_policies.sql`
3. **Sample Data**: Copy and paste `migrations/003_sample_data.sql`

### 4. Configure Authentication
Go to **Authentication > Settings**:
- **Site URL**: `http://localhost:3000` (for development)
- **Redirect URLs**: Add your production domains later
- **Email Auth**: Enable email/password authentication
- **Confirm Email**: Disable for development (enable for production)

### 5. Set Up Storage
Go to **Storage** and create these buckets:
- `menu-images` (public bucket for menu item photos)
- `user-avatars` (public bucket for profile pictures)
- `menu-uploads` (private bucket for AI processing)

**Storage Policy Example**:
```sql
-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images" ON storage.objects
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow public read access to menu images
CREATE POLICY "Public read access to menu images" ON storage.objects
FOR SELECT USING (bucket_id = 'menu-images');
```

### 6. Environment Configuration

#### For Android App
Update `android-app/app/build.gradle.kts`:
```kotlin
buildConfigField("String", "SUPABASE_URL", "\"https://your-project-ref.supabase.co\"")
buildConfigField("String", "SUPABASE_ANON_KEY", "\"your-anon-key-here\"")
```

#### For AI Menu Parser
Create `ai-menu-parser/.env`:
```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here
```

#### For Admin Dashboard (Vercel)
In your Vercel project settings, add environment variables:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 7. Test Admin Access
Create an admin user by running this in SQL Editor:
```sql
-- First, sign up normally through your app/dashboard, then run:
UPDATE users SET role = 'admin' WHERE email = 'your-email@domain.com';
```

### 8. Production Setup (Later)
- Add your production domains to **Authentication > URL Configuration**
- Set up **Database Backups**
- Configure **Edge Functions** if needed
- Set up **Real-time subscriptions** for live order updates

## 🔑 Required Credentials Summary

You'll need these three values:
1. **SUPABASE_URL**: Your project URL
2. **SUPABASE_ANON_KEY**: Public key for client apps
3. **SUPABASE_SERVICE_KEY**: Private key for server operations

## 🛡️ Security Features Included

- **Row Level Security (RLS)**: Users can only see their college's data
- **Role-based Access**: Students, Owners, and Admins have different permissions
- **Multi-tenant**: Each college's data is isolated
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: All queries are validated and sanitized

## 📊 Sample Data Included

The setup includes:
- 3 Sample colleges (Vishwakarma campuses)
- 6 Test users (students, faculty, owners, admin)
- 3 Sample canteens
- 14 Menu items with different categories
- 3 Sample orders with items
- Feedback and notifications

## 🔧 Development vs Production

**Development**:
- Local Supabase instance (optional)
- Relaxed CORS settings
- Email confirmation disabled

**Production**:
- Enable email confirmation
- Set proper CORS origins
- Enable database backups
- Monitor usage and performance
