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
  phone?: string           // For WhatsApp
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

export type Database = {
  public: {
    Tables: {
      tokens: {
        Row: Token
        Insert: Partial<Token>
        Update: Partial<Token>
      }
      businesses: {
        Row: any // permissive for now
        Insert: any
        Update: any
      }
      queues: {
        Row: any // permissive for now
        Insert: any
        Update: any
      }
      predictions: {
        Row: any
        Insert: any
        Update: any
      }
      bookings: {
        Row: any
        Insert: any
        Update: any
      }
      user_profiles: {
        Row: UserProfile
        Insert: Partial<UserProfile>
        Update: Partial<UserProfile>
      }
    }
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
    }
  }
}
