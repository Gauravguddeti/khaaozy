<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Vishwakarma University Canteen App - Copilot Instructions

## Project Overview
This is a multi-component Android canteen app for Vishwakarma University with support for students, faculty, canteen owners, and administrators.

## Architecture
- **android-app/**: Kotlin + Jetpack Compose mobile application
- **ai-menu-parser/**: Python-based OCR and menu text extraction
- **admin-dashboard/**: React + Tailwind web dashboard for administrators
- **supabase/**: Database schema, functions, and configuration
- **docs/**: Project documentation and setup guides

## Key Technologies
- Android: Kotlin, Jetpack Compose, Material3, Supabase Android SDK
- Backend: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- AI/OCR: Python, Tesseract OCR, OpenCV
- Admin: React, TypeScript, Tailwind CSS, Supabase JS SDK
- Notifications: Firebase Cloud Messaging

## User Roles
- **Students/Faculty**: Browse canteens, place orders, view history, give feedback
- **Canteen Owners**: Manage menus (AI upload + manual), view orders, update status
- **Administrators**: Manage colleges, canteens, users, analytics via web dashboard

## Coding Standards
- Use Material Design 3 principles for Android UI
- Follow clean architecture patterns (MVVM for Android)
- Implement proper error handling and loading states
- Use TypeScript for all JavaScript/React code
- Follow accessibility guidelines
- Implement proper security practices for multi-tenant architecture

## Database Design
All data is filtered by college_id for multi-college support. Role-based access control with users, owners, and admins having different permissions.
