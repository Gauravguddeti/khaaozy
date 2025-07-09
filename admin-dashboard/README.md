# Admin Dashboard

React-based web dashboard for administrators to manage the Vishwakarma University Canteen App.

## Features

### College Management
- ➕ Add, edit, delete colleges
- 📊 View college statistics
- 🏛️ Manage college details and settings

### Canteen Management
- 🍴 Add, edit, delete canteens
- 👨‍💼 Assign owners to canteens
- 📈 View canteen performance metrics
- 🔧 Manage canteen settings and hours

### User Management
- 👥 View all users (students, faculty, owners)
- 🔒 Suspend/activate accounts
- 📧 Reset passwords
- 🎭 Manage user roles

### Menu Management
- 📋 View and edit all menus
- 💰 Price management
- 📦 Availability control
- 🗂️ Category management

### Order Analytics
- 📊 Real-time order dashboard
- 📈 Sales analytics
- 📥 Export reports (CSV/PDF)
- 🎯 Performance insights

### Notification System
- 📢 Send system-wide announcements
- 🔔 Push notifications to users
- 📨 Targeted messaging

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + Headless UI
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Backend**: Supabase
- **Charts**: Recharts
- **Icons**: Heroicons
- **Build Tool**: Vite

## Setup

```bash
cd admin-dashboard
npm install
npm run dev
```

## Environment Variables

Create `.env` file:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```
