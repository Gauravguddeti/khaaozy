import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          college_id: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          college_id: string
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          college_id?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      colleges: {
        Row: {
          id: string
          name: string
          location: string
          contact_email: string
          contact_phone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          location: string
          contact_email: string
          contact_phone: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          location?: string
          contact_email?: string
          contact_phone?: string
          created_at?: string
          updated_at?: string
        }
      }
      canteens: {
        Row: {
          id: string
          name: string
          location: string
          college_id: string
          owner_id: string
          contact_phone: string
          opening_time: string
          closing_time: string
          is_open: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          location: string
          college_id: string
          owner_id: string
          contact_phone: string
          opening_time: string
          closing_time: string
          is_open?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          location?: string
          college_id?: string
          owner_id?: string
          contact_phone?: string
          opening_time?: string
          closing_time?: string
          is_open?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          canteen_id: string
          total_amount: number
          status: string
          order_type: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          canteen_id: string
          total_amount: number
          status?: string
          order_type: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          canteen_id?: string
          total_amount?: number
          status?: string
          order_type?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
