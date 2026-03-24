// This file documents the DB schema and provides strict typing for Supabase operations.

export type Token = {
  id: string              // uuid
  orgId: string           // TEXT (matches code usage)
  userId: string | null
  queue_id: string | null
  tokenNumber: string
  status: 'WAITING' | 'SERVING' | 'SERVED' | 'CANCELLED'
  isPriority: boolean
  createdAt: string
  updatedAt?: string
  servedAt: string | null
  estimatedWaitMins: number | null
  customerName: string | null
  customerPhone: string | null
  counterId: string | null
}

export type Business = {
  id: string
  name: string
  category: string
  location: string
  address?: string | null
  latitude: number | null
  longitude: number | null
  avg_rating: number | null
  total_reviews: number
  owner_id: string | null
  claim_status: 'unclaimed' | 'claimed' | 'active'
  serviceMins: number
  plan: 'free' | 'pro'
  is_verified: boolean
  updated_at?: string
  image?: string
  fastPassEnabled?: boolean
  fastPassPrice?: number
  phone?: string           // For WhatsApp
  whatsapp_enabled?: boolean
  is_open?: boolean
  is_accepting_tokens?: boolean
  onboarding_step?: number
  op_hours_json?: BusinessHours | null      // For operating hours
  services?: { name: string; prefix: string; mins: number }[] | null        // For prefixes
  settings?: Record<string, unknown> | null          // For business hours config
}

export type BusinessHours = Record<string, { open: string; close: string }[] | null>;

export type Queue = {
  id: string            // uuid
  org_id: string        // TEXT
  counter_id?: string
  session_date?: string
  last_issued_number: number
  currently_serving?: string | null
  currently_serving_token_id?: string | null // Added for dashboard compatibility
  total_waiting: number
  is_active: boolean
  is_accepting_tokens: boolean
  max_capacity: number
}

export type Prediction = {
  id: string
  bestTimeToVisit: string
}

export type UserProfile = {
  id: string
  full_name: string | null
  phone: string | null
  email: string | null
  role: 'customer' | 'business_owner'
  avatar_url: string | null
  visit_count: number
  onboarding_completed_at: string | null
  profile_completed?: boolean
  city?: string
  preferred_language?: string
}

export type Review = {
  id: string
  business_id: string
  user_id: string | null
  rating: number
  comment: string | null
  token_id: string | null
  created_at?: string
}

export type AdvanceBooking = {
  id: string
  business_id: string
  user_id: string | null
  customer_name: string
  customer_phone: string
  customer_email: string | null
  booking_date: string
  booking_time: string
  service_type: string | null
  notes: string | null
  status: 'confirmed' | 'cancelled' | 'completed' | 'no_show'
  token_id: string | null
  created_at?: string
  updated_at?: string
}

export type StaffMember = {
  id: string
  business_id: string
  user_id: string | null
  role: 'owner' | 'operator' | 'viewer'
  name: string | null
  phone: string | null
  is_active: boolean
  counter_id: string | null
  created_at?: string
}

export type FastPassLog = {
  id: string
  business_id: string
  amount: number
  created_at?: string
}

export interface Database {
  public: {
    Tables: {
      tokens: {
        Row: Token
        Insert: Partial<Token>
        Update: Partial<Token>
        Relationships: unknown[]
      }
      businesses: {
        Row: Business
        Insert: Partial<Business>
        Update: Partial<Business>
        Relationships: unknown[]
      }
      queues: {
        Row: Queue
        Insert: Partial<Queue>
        Update: Partial<Queue>
        Relationships: unknown[]
      }
      predictions: {
        Row: Prediction
        Insert: Partial<Prediction>
        Update: Partial<Prediction>
        Relationships: unknown[]
      }
      bookings: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: unknown[]
      }
      advance_bookings: {
        Row: AdvanceBooking
        Insert: Partial<AdvanceBooking>
        Update: Partial<AdvanceBooking>
        Relationships: unknown[]
      }
      reviews: {
        Row: Review
        Insert: Partial<Review>
        Update: Partial<Review>
        Relationships: unknown[]
      }
      staff_members: {
        Row: StaffMember
        Insert: Partial<StaffMember>
        Update: Partial<StaffMember>
        Relationships: unknown[]
      }
      fastpass_logs: {
        Row: FastPassLog
        Insert: Partial<FastPassLog>
        Update: Partial<FastPassLog>
        Relationships: unknown[]
      }
      user_profiles: {
        Row: UserProfile
        Insert: Partial<UserProfile>
        Update: Partial<UserProfile>
        Relationships: unknown[]
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}
