-- Row Level Security (RLS) policies for the Canteen App
-- Multi-tenant security with role-based access control

-- Enable RLS on all tables
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE canteens ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE owner_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
BEGIN
    RETURN (
        SELECT role
        FROM users
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get current user's college_id
CREATE OR REPLACE FUNCTION get_user_college_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT college_id
        FROM users
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user owns canteen
CREATE OR REPLACE FUNCTION user_owns_canteen(canteen_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM canteens
        WHERE id = canteen_uuid AND owner_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- COLLEGES POLICIES
-- Everyone can view active colleges
CREATE POLICY "Anyone can view active colleges" ON colleges
    FOR SELECT USING (is_active = true);

-- Only admins can modify colleges
CREATE POLICY "Only admins can insert colleges" ON colleges
    FOR INSERT WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "Only admins can update colleges" ON colleges
    FOR UPDATE USING (get_user_role() = 'admin');

CREATE POLICY "Only admins can delete colleges" ON colleges
    FOR DELETE USING (get_user_role() = 'admin');

-- USERS POLICIES
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (id = auth.uid());

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (get_user_role() = 'admin');

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (id = auth.uid())
    WITH CHECK (id = auth.uid() AND role = (SELECT role FROM users WHERE id = auth.uid()));

-- Only admins can insert users with specific roles
CREATE POLICY "Admins can insert users" ON users
    FOR INSERT WITH CHECK (get_user_role() = 'admin');

-- Handle user creation from auth trigger
CREATE POLICY "Allow user creation from auth" ON users
    FOR INSERT WITH CHECK (id = auth.uid());

-- CANTEENS POLICIES
-- Users can view canteens in their college
CREATE POLICY "Users can view canteens in their college" ON canteens
    FOR SELECT USING (college_id = get_user_college_id());

-- Owners can view their own canteens
CREATE POLICY "Owners can view own canteens" ON canteens
    FOR SELECT USING (owner_id = auth.uid());

-- Admins can view all canteens
CREATE POLICY "Admins can view all canteens" ON canteens
    FOR SELECT USING (get_user_role() = 'admin');

-- Only admins can insert/delete canteens
CREATE POLICY "Only admins can insert canteens" ON canteens
    FOR INSERT WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "Only admins can delete canteens" ON canteens
    FOR DELETE USING (get_user_role() = 'admin');

-- Owners can update their own canteens (limited fields)
CREATE POLICY "Owners can update own canteens" ON canteens
    FOR UPDATE USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());

-- Admins can update any canteen
CREATE POLICY "Admins can update any canteen" ON canteens
    FOR UPDATE USING (get_user_role() = 'admin');

-- MENU_ITEMS POLICIES
-- Users can view menu items from canteens in their college
CREATE POLICY "Users can view menu items in their college" ON menu_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM canteens 
            WHERE canteens.id = menu_items.canteen_id 
            AND canteens.college_id = get_user_college_id()
        )
    );

-- Owners can manage menu items for their canteens
CREATE POLICY "Owners can manage own canteen menu items" ON menu_items
    FOR ALL USING (user_owns_canteen(canteen_id))
    WITH CHECK (user_owns_canteen(canteen_id));

-- Admins can manage all menu items
CREATE POLICY "Admins can manage all menu items" ON menu_items
    FOR ALL USING (get_user_role() = 'admin');

-- ORDERS POLICIES
-- Users can view their own orders
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (user_id = auth.uid());

-- Users can create orders for canteens in their college
CREATE POLICY "Users can create orders in their college" ON orders
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM canteens 
            WHERE canteens.id = orders.canteen_id 
            AND canteens.college_id = get_user_college_id()
        )
    );

-- Users can update their own pending orders
CREATE POLICY "Users can update own pending orders" ON orders
    FOR UPDATE USING (user_id = auth.uid() AND status = 'pending')
    WITH CHECK (user_id = auth.uid());

-- Owners can view orders for their canteens
CREATE POLICY "Owners can view canteen orders" ON orders
    FOR SELECT USING (user_owns_canteen(canteen_id));

-- Owners can update orders for their canteens
CREATE POLICY "Owners can update canteen orders" ON orders
    FOR UPDATE USING (user_owns_canteen(canteen_id))
    WITH CHECK (user_owns_canteen(canteen_id));

-- Admins can view and update all orders
CREATE POLICY "Admins can manage all orders" ON orders
    FOR ALL USING (get_user_role() = 'admin');

-- ORDER_ITEMS POLICIES
-- Users can view items from their own orders
CREATE POLICY "Users can view own order items" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- Users can insert items for their own orders
CREATE POLICY "Users can insert own order items" ON order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- Owners can view order items for their canteens
CREATE POLICY "Owners can view canteen order items" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND user_owns_canteen(orders.canteen_id)
        )
    );

-- Admins can view all order items
CREATE POLICY "Admins can view all order items" ON order_items
    FOR SELECT USING (get_user_role() = 'admin');

-- FEEDBACK POLICIES
-- Users can view feedback for canteens in their college
CREATE POLICY "Users can view feedback in their college" ON feedback
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM canteens 
            WHERE canteens.id = feedback.canteen_id 
            AND canteens.college_id = get_user_college_id()
        )
    );

-- Users can create feedback for their own orders
CREATE POLICY "Users can create feedback for own orders" ON feedback
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        (order_id IS NULL OR EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = feedback.order_id 
            AND orders.user_id = auth.uid()
        ))
    );

-- Users can update their own feedback
CREATE POLICY "Users can update own feedback" ON feedback
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Owners can view feedback for their canteens
CREATE POLICY "Owners can view canteen feedback" ON feedback
    FOR SELECT USING (user_owns_canteen(canteen_id));

-- Admins can manage all feedback
CREATE POLICY "Admins can manage all feedback" ON feedback
    FOR ALL USING (get_user_role() = 'admin');

-- OWNER_APPLICATIONS POLICIES
-- Users can create their own applications
CREATE POLICY "Users can create own applications" ON owner_applications
    FOR INSERT WITH CHECK (email = (SELECT email FROM users WHERE id = auth.uid()));

-- Users can view their own applications
CREATE POLICY "Users can view own applications" ON owner_applications
    FOR SELECT USING (email = (SELECT email FROM users WHERE id = auth.uid()));

-- Admins can manage all applications
CREATE POLICY "Admins can manage all applications" ON owner_applications
    FOR ALL USING (get_user_role() = 'admin');

-- NOTIFICATIONS POLICIES
-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- System can insert notifications
CREATE POLICY "System can insert notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- Admins can manage all notifications
CREATE POLICY "Admins can manage all notifications" ON notifications
    FOR ALL USING (get_user_role() = 'admin');
