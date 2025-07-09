# Complete Supabase Setup Guide for Canteen App

## 🚀 STEP-BY-STEP SUPABASE SETUP

### 1. Get Your Service Role Key
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: `kqmvyuwxeaoboyvjndto`
3. Go to **Settings** → **API**
4. Copy the **service_role** key (the long secret key)
5. Update `ai-menu-parser/.env` with this key

### 2. Set Up Database Tables
Go to **SQL Editor** in your Supabase dashboard and run these scripts **IN ORDER**:

#### Script 1: Create Tables and Enums
```sql
-- First, create the enums
CREATE TYPE user_role AS ENUM ('student', 'faculty', 'owner', 'admin');
CREATE TYPE order_status AS ENUM ('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED');
CREATE TYPE order_type AS ENUM ('DINE_IN', 'TAKEAWAY');

-- Create colleges table
CREATE TABLE colleges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role user_role DEFAULT 'student',
    college_id UUID REFERENCES colleges(id),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create canteens table
CREATE TABLE canteens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255) NOT NULL,
    college_id UUID REFERENCES colleges(id) NOT NULL,
    owner_id UUID REFERENCES users(id),
    phone VARCHAR(20),
    email VARCHAR(255),
    opening_time TIME DEFAULT '08:00:00',
    closing_time TIME DEFAULT '20:00:00',
    is_open BOOLEAN DEFAULT true,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create menu_categories table
CREATE TABLE menu_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    canteen_id UUID REFERENCES canteens(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create menu_items table
CREATE TABLE menu_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    canteen_id UUID REFERENCES canteens(id) ON DELETE CASCADE,
    category_id UUID REFERENCES menu_categories(id),
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    is_vegetarian BOOLEAN DEFAULT true,
    preparation_time INTEGER DEFAULT 15, -- in minutes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    canteen_id UUID REFERENCES canteens(id) NOT NULL,
    status order_status DEFAULT 'PENDING',
    order_type order_type DEFAULT 'TAKEAWAY',
    total_amount DECIMAL(10,2) NOT NULL,
    notes TEXT,
    estimated_time INTEGER, -- in minutes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create feedback table
CREATE TABLE feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    canteen_id UUID REFERENCES canteens(id) NOT NULL,
    order_id UUID REFERENCES orders(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Script 2: Create Row Level Security (RLS) Policies
```sql
-- Enable RLS on all tables
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE canteens ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Colleges policies
CREATE POLICY "Anyone can view colleges" ON colleges FOR SELECT USING (true);
CREATE POLICY "Only admins can modify colleges" ON colleges FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
);

-- Users policies
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (
    auth.uid() = id OR auth.jwt() ->> 'role' = 'admin'
);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (
    auth.uid() = id
);
CREATE POLICY "Anyone can insert users" ON users FOR INSERT WITH CHECK (true);

-- Canteens policies
CREATE POLICY "Anyone can view canteens" ON canteens FOR SELECT USING (true);
CREATE POLICY "Owners can modify their canteens" ON canteens FOR ALL USING (
    auth.uid() = owner_id OR auth.jwt() ->> 'role' = 'admin'
);

-- Menu categories policies
CREATE POLICY "Anyone can view menu categories" ON menu_categories FOR SELECT USING (true);
CREATE POLICY "Owners can modify their menu categories" ON menu_categories FOR ALL USING (
    EXISTS (
        SELECT 1 FROM canteens 
        WHERE canteens.id = menu_categories.canteen_id 
        AND (canteens.owner_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin')
    )
);

-- Menu items policies
CREATE POLICY "Anyone can view menu items" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Owners can modify their menu items" ON menu_items FOR ALL USING (
    EXISTS (
        SELECT 1 FROM canteens 
        WHERE canteens.id = menu_items.canteen_id 
        AND (canteens.owner_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin')
    )
);

-- Orders policies
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (
        SELECT 1 FROM canteens 
        WHERE canteens.id = orders.canteen_id 
        AND canteens.owner_id = auth.uid()
    ) OR 
    auth.jwt() ->> 'role' = 'admin'
);
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (
    auth.uid() = user_id
);
CREATE POLICY "Owners can update orders for their canteens" ON orders FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM canteens 
        WHERE canteens.id = orders.canteen_id 
        AND (canteens.owner_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin')
    )
);

-- Order items policies
CREATE POLICY "Users can view order items for their orders" ON order_items FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = order_items.order_id 
        AND (orders.user_id = auth.uid() OR 
             EXISTS (SELECT 1 FROM canteens WHERE canteens.id = orders.canteen_id AND canteens.owner_id = auth.uid()) OR
             auth.jwt() ->> 'role' = 'admin')
    )
);
CREATE POLICY "Users can insert order items" ON order_items FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = order_items.order_id 
        AND orders.user_id = auth.uid()
    )
);

-- Feedback policies
CREATE POLICY "Users can view feedback" ON feedback FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (
        SELECT 1 FROM canteens 
        WHERE canteens.id = feedback.canteen_id 
        AND canteens.owner_id = auth.uid()
    ) OR 
    auth.jwt() ->> 'role' = 'admin'
);
CREATE POLICY "Users can create feedback" ON feedback FOR INSERT WITH CHECK (
    auth.uid() = user_id
);

-- Notifications policies
CREATE POLICY "Users can view their notifications" ON notifications FOR SELECT USING (
    auth.uid() = user_id
);
CREATE POLICY "Users can update their notifications" ON notifications FOR UPDATE USING (
    auth.uid() = user_id
);
```

#### Script 3: Insert Sample Data
```sql
-- Insert sample college
INSERT INTO colleges (id, name, address, phone, email) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'Vishwakarma University', 'Pune, Maharashtra, India', '+91-20-12345678', 'info@vu.edu.in');

-- Insert sample users
INSERT INTO users (id, email, full_name, phone, role, college_id) VALUES 
('550e8400-e29b-41d4-a716-446655440002', 'admin@vu.edu.in', 'Admin User', '+91-9876543210', 'admin', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440003', 'owner@vu.edu.in', 'Canteen Owner', '+91-9876543211', 'owner', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440004', 'student@vu.edu.in', 'John Student', '+91-9876543212', 'student', '550e8400-e29b-41d4-a716-446655440001');

-- Insert sample canteens
INSERT INTO canteens (id, name, description, location, college_id, owner_id, phone, opening_time, closing_time) VALUES 
('550e8400-e29b-41d4-a716-446655440005', 'Main Canteen', 'Primary canteen serving various cuisines', 'Ground Floor, Main Building', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', '+91-20-87654321', '08:00:00', '20:00:00'),
('550e8400-e29b-41d4-a716-446655440006', 'Food Court', 'Quick snacks and beverages', 'First Floor, Student Center', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', '+91-20-87654322', '09:00:00', '18:00:00');

-- Insert sample menu categories
INSERT INTO menu_categories (id, name, description, canteen_id, display_order) VALUES 
('550e8400-e29b-41d4-a716-446655440007', 'Breakfast', 'Morning meals and beverages', '550e8400-e29b-41d4-a716-446655440005', 1),
('550e8400-e29b-41d4-a716-446655440008', 'Lunch', 'Full meals and thalis', '550e8400-e29b-41d4-a716-446655440005', 2),
('550e8400-e29b-41d4-a716-446655440009', 'Snacks', 'Quick bites and snacks', '550e8400-e29b-41d4-a716-446655440006', 1),
('550e8400-e29b-41d4-a716-446655440010', 'Beverages', 'Hot and cold drinks', '550e8400-e29b-41d4-a716-446655440006', 2);

-- Insert sample menu items
INSERT INTO menu_items (id, name, description, price, canteen_id, category_id, is_vegetarian, preparation_time) VALUES 
('550e8400-e29b-41d4-a716-446655440011', 'Masala Dosa', 'Crispy dosa with spiced potato filling', 45.00, '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440007', true, 10),
('550e8400-e29b-41d4-a716-446655440012', 'Idli Sambhar', '3 soft idlis with sambhar and chutney', 35.00, '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440007', true, 5),
('550e8400-e29b-41d4-a716-446655440013', 'Veg Thali', 'Complete vegetarian meal with rice, dal, vegetables', 120.00, '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440008', true, 15),
('550e8400-e29b-41d4-a716-446655440014', 'Paneer Curry', 'Spicy paneer curry with rice/roti', 95.00, '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440008', true, 20),
('550e8400-e29b-41d4-a716-446655440015', 'Samosa', 'Crispy fried samosa with chutney', 15.00, '550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440009', true, 2),
('550e8400-e29b-41d4-a716-446655440016', 'Pav Bhaji', 'Spicy bhaji with butter pav', 55.00, '550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440009', true, 8),
('550e8400-e29b-41d4-a716-446655440017', 'Masala Chai', 'Hot spiced tea', 10.00, '550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440010', true, 3),
('550e8400-e29b-41d4-a716-446655440018', 'Cold Coffee', 'Refreshing iced coffee', 25.00, '550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440010', true, 5);

-- Insert sample order
INSERT INTO orders (id, user_id, canteen_id, status, order_type, total_amount, notes) VALUES 
('550e8400-e29b-41d4-a716-446655440019', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005', 'DELIVERED', 'TAKEAWAY', 80.00, 'No onions please');

-- Insert sample order items
INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES 
('550e8400-e29b-41d4-a716-446655440019', '550e8400-e29b-41d4-a716-446655440011', 1, 45.00),
('550e8400-e29b-41d4-a716-446655440019', '550e8400-e29b-41d4-a716-446655440012', 1, 35.00);
```

### 3. Set Up Authentication
1. Go to **Authentication** → **Settings** in your Supabase dashboard
2. Set **Site URL** to: `http://localhost:3000` (for development)
3. Add **Redirect URLs**: 
   - `http://localhost:3000/**`
   - `http://localhost:5173/**` (for Vite dev server)
4. **Enable Email/Password** authentication
5. **Disable email confirmations** for development (enable for production)

### 4. Set Up Storage Buckets
Go to **Storage** in your Supabase dashboard:

1. **Create bucket: `menu-images`**
   - Public bucket: ✅ Yes
   - File size limit: 10MB
   - Allowed MIME types: `image/*`

2. **Create bucket: `user-avatars`**
   - Public bucket: ✅ Yes
   - File size limit: 5MB
   - Allowed MIME types: `image/*`

3. **Create bucket: `menu-uploads`** (for AI processing)
   - Public bucket: ❌ No (private)
   - File size limit: 10MB
   - Allowed MIME types: `image/*`

### 5. Create Your First Admin User
After running the SQL scripts, you need to create your admin user:

1. Go to **Authentication** → **Users** in Supabase dashboard
2. Click **Add User**
3. Fill in:
   - Email: `admin@vu.edu.in`
   - Password: `admin123` (change this!)
   - Auto-confirm user: ✅ Yes
4. After creating, go to **SQL Editor** and run:
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@vu.edu.in';
```

### 6. Get Your Service Role Key
1. Go to **Settings** → **API**
2. Copy the **service_role** key (secret key)
3. Update `ai-menu-parser/.env`:
```env
SUPABASE_URL=https://kqmvyuwxeaoboyvjndto.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here
```

### 7. Test Your Setup
Run this in SQL Editor to verify everything works:
```sql
SELECT 
    c.name as college_name,
    count(DISTINCT canteens.id) as total_canteens,
    count(DISTINCT menu_items.id) as total_menu_items,
    count(DISTINCT users.id) as total_users
FROM colleges c
LEFT JOIN canteens ON c.id = canteens.college_id
LEFT JOIN menu_items ON canteens.id = menu_items.canteen_id
LEFT JOIN users ON c.id = users.college_id
GROUP BY c.id, c.name;
```

You should see:
- Vishwakarma University with 2 canteens, 8 menu items, and 3 users

## 🎉 READY TO RUN!

After completing all steps above, you can run:
1. **Admin Dashboard**: `cd admin-dashboard && npm run dev`
2. **AI Menu Parser**: `cd ai-menu-parser && python main.py`
3. **Android App**: Open in Android Studio and build

Your login credentials for the admin dashboard:
- Email: `admin@vu.edu.in`
- Password: `admin123`
