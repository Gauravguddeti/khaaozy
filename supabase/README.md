# Supabase Backend Configuration

This directory contains the database schema, functions, and configuration for the Vishwakarma University Canteen App backend.

## Setup

1. Install Supabase CLI
2. Initialize project: `supabase init`
3. Start local development: `supabase start`
4. Apply migrations: `supabase db reset`

## Database Schema

### Core Tables
- `colleges` - University colleges
- `users` - All user types (students, faculty, owners, admins)
- `canteens` - Canteen information
- `menu_items` - Food items with pricing
- `orders` - Order tracking
- `order_items` - Individual order items
- `feedback` - Reviews and ratings

### Security
- Row Level Security (RLS) enabled on all tables
- Role-based access control
- Multi-tenant isolation by college_id

### Functions
- User role management
- Order processing
- Notification triggers
- Analytics queries

## Environment Variables

Create `.env` file:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
```
