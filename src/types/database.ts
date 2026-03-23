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
  op_hours_json?: any      // For operating hours
  services?: any[]        // For prefixes
  settings?: any          // For business hours config
}

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

export type Database = {
  public: {
    Tables: {
      tokens: {
        Row: Token
        Insert: Partial<Token>
        Update: Partial<Token>
        Relationships: any[]
      }
      businesses: {
        Row: Business
        Insert: Partial<Business>
        Update: Partial<Business>
        Relationships: any[]
      }
      queues: {
        Row: Queue
        Insert: Partial<Queue>
        Update: Partial<Queue>
        Relationships: any[]
      }
      predictions: {
        Row: Prediction
        Insert: Partial<Prediction>
        Update: Partial<Prediction>
        Relationships: any[]
      }
      bookings: {
        Row: any
        Insert: any
        Update: any
        Relationships: any[]
      }
      advance_bookings: {
        Row: AdvanceBooking
        Insert: Partial<AdvanceBooking>
        Update: Partial<AdvanceBooking>
        Relationships: any[]
      }
      reviews: {
        Row: Review
        Insert: Partial<Review>
        Update: Partial<Review>
        Relationships: any[]
      }
      staff_members: {
        Row: StaffMember
        Insert: Partial<StaffMember>
        Update: Partial<StaffMember>
        Relationships: any[]
      }
      fastpass_logs: {
        Row: FastPassLog
        Insert: Partial<FastPassLog>
        Update: Partial<FastPassLog>
        Relationships: any[]
      }
      user_profiles: {
        Row: UserProfile
        Insert: Partial<UserProfile>
        Update: Partial<UserProfile>
        Relationships: any[]
      }
    }
    Views: Record<string, any>
    Functions: {
      get_my_profile: {
        Args: any
        Returns: any
      }
      activate_queue_for_today: {
        Args: any
        Returns: any
      }
      get_live_pulse_data: {
        Args: any
        Returns: any
      }
      get_queue_position: {
        Args: any
        Returns: any
      }
      get_hourly_distribution: {
        Args: any
        Returns: any
      }
      get_wait_time_trend: {
        Args: any
        Returns: any
      }
      create_queue_token: {
        Args: {
          p_org_id: string
          p_user_id: string | null
          p_customer_name: string
          p_customer_phone: string
          p_token_number: string
          p_estimated_wait_mins: number
        }
        Returns: Token[]
      }
    }
    Enums: Record<string, any>
    CompositeTypes: Record<string, any>
  }
}
