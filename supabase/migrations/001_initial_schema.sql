-- Database schema for Vishwakarma University Canteen App
-- Multi-college support with role-based access control

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- User roles enum
CREATE TYPE user_role AS ENUM ('user', 'owner', 'admin');

-- Order status enum
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled', 'refunded');

-- Order type enum
CREATE TYPE order_type AS ENUM ('dine_in', 'takeaway');

-- Payment status enum
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');

-- Canteen status enum
CREATE TYPE canteen_status AS ENUM ('open', 'closed', 'temporarily_closed', 'maintenance');

-- Food category enum
CREATE TYPE food_category AS ENUM ('breakfast', 'lunch', 'dinner', 'snacks', 'beverages', 'desserts', 'fast_food', 'south_indian', 'north_indian', 'chinese', 'continental', 'street_food');

-- Food type enum
CREATE TYPE food_type AS ENUM ('veg', 'non_veg', 'vegan', 'jain', 'gluten_free');

-- Colleges table
CREATE TABLE colleges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role DEFAULT 'user',
    college_id UUID REFERENCES colleges(id),
    name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    profile_image_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Canteens table
CREATE TABLE canteens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES users(id),
    description TEXT,
    image_url TEXT,
    location TEXT,
    phone_number VARCHAR(20),
    open_time TIME,
    close_time TIME,
    is_open_24_hours BOOLEAN DEFAULT false,
    closed_days TEXT[], -- Array of day names
    status canteen_status DEFAULT 'open',
    rating DECIMAL(3,2) DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menu items table
CREATE TABLE menu_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    canteen_id UUID NOT NULL REFERENCES canteens(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category food_category NOT NULL,
    type food_type NOT NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    preparation_time INTEGER DEFAULT 15, -- minutes
    ingredients TEXT[],
    allergens TEXT[],
    calories INTEGER,
    protein DECIMAL(5,2),
    carbs DECIMAL(5,2),
    fat DECIMAL(5,2),
    fiber DECIMAL(5,2),
    sugar DECIMAL(5,2),
    popularity INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    canteen_id UUID NOT NULL REFERENCES canteens(id),
    total_amount DECIMAL(10,2) NOT NULL,
    status order_status DEFAULT 'pending',
    order_type order_type NOT NULL,
    payment_status payment_status DEFAULT 'pending',
    special_instructions TEXT,
    estimated_preparation_time INTEGER, -- minutes
    order_number VARCHAR(20) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Order items table
CREATE TABLE order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES menu_items(id),
    name VARCHAR(255) NOT NULL, -- Store name for history
    price DECIMAL(10,2) NOT NULL, -- Store price for history
    quantity INTEGER NOT NULL DEFAULT 1,
    special_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feedback table
CREATE TABLE feedback (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    canteen_id UUID NOT NULL REFERENCES canteens(id),
    order_id UUID REFERENCES orders(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    food_quality INTEGER CHECK (food_quality >= 1 AND food_quality <= 5),
    service_quality INTEGER CHECK (service_quality >= 1 AND service_quality <= 5),
    cleanliness INTEGER CHECK (cleanliness >= 1 AND cleanliness <= 5),
    value INTEGER CHECK (value >= 1 AND value <= 5),
    image_urls TEXT[],
    is_anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Owner applications table (for admin review)
CREATE TABLE owner_applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    college_id UUID REFERENCES colleges(id),
    canteen_name VARCHAR(255),
    experience TEXT,
    documents TEXT[], -- URLs to uploaded documents
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- order_update, promotion, announcement
    data JSONB, -- Additional data for the notification
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_college_id ON users(college_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_canteens_college_id ON canteens(college_id);
CREATE INDEX idx_canteens_owner_id ON canteens(owner_id);
CREATE INDEX idx_menu_items_canteen_id ON menu_items(canteen_id);
CREATE INDEX idx_menu_items_category ON menu_items(category);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_canteen_id ON orders(canteen_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_feedback_canteen_id ON feedback(canteen_id);
CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    order_num TEXT;
BEGIN
    -- Generate order number: YYYYMMDD + 6 digit random number
    order_num := TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');
    
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM orders WHERE order_number = order_num) LOOP
        order_num := TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');
    END LOOP;
    
    RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_colleges_updated_at BEFORE UPDATE ON colleges
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_canteens_updated_at BEFORE UPDATE ON canteens
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_updated_at BEFORE UPDATE ON feedback
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to set order number on insert
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number_trigger BEFORE INSERT ON orders
    FOR EACH ROW EXECUTE FUNCTION set_order_number();

-- Function to update canteen rating
CREATE OR REPLACE FUNCTION update_canteen_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE canteens SET
        rating = (
            SELECT COALESCE(AVG(rating::DECIMAL), 0)
            FROM feedback
            WHERE canteen_id = NEW.canteen_id
        ),
        total_reviews = (
            SELECT COUNT(*)
            FROM feedback
            WHERE canteen_id = NEW.canteen_id
        )
    WHERE id = NEW.canteen_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update rating after feedback
CREATE TRIGGER update_canteen_rating_trigger AFTER INSERT OR UPDATE ON feedback
    FOR EACH ROW EXECUTE FUNCTION update_canteen_rating();
