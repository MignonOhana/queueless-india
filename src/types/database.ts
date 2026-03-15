// This file documents the DB schema and provides strict typing for Supabase operations.

export type Token = {
  id: string              // uuid
  orgId: string           // TEXT (NOT uuid — business slug)
  userId: string | null   // TEXT (should be uuid — known tech debt)
  queue_id: string | null // uuid (snake_case unlike other columns)
  tokenNumber: string     // camelCase
  status: 'WAITING' | 'SERVING' | 'SERVED' | 'CANCELLED'
  isPriority: boolean
  createdAt: string
  servedAt: string | null
  estimatedWaitMins: number | null
  customerName: string | null
  customerPhone: string | null
  counterId: string | null
}

export type Business = {
  id: string             // TEXT slug (not uuid)
  name: string
  category: 'Hospital' | 'Bank' | 'Temple' | 'Government' | 'Railway Station' | 'Court' | 'Post Office'
  location: string
  address: string | null
  latitude: number | null
  longitude: number | null
  avg_rating: number | null  // snake_case
  total_reviews: number
  owner_id: string | null    // uuid, snake_case
  claim_status: 'unclaimed' | 'claimed' | 'active'
  serviceMins: number        // camelCase
  plan: 'free' | 'pro'
  is_verified: boolean
}

export type Queue = {
  id: string           // uuid
  org_id: string       // TEXT (snake_case)
  counter_id: string
  session_date: string
  last_issued_number: number
  currently_serving: string | null // uuid of token
  total_waiting: number
  is_active: boolean
  is_accepting_tokens: boolean
  max_capacity: number
}

export type UserProfile = {
  id: string           // uuid (matches auth.users.id)
  full_name: string | null
  phone: string | null
  email: string | null
  role: 'customer' | 'business_owner'
  avatar_url: string | null
  visit_count: number
  onboarding_completed_at: string | null
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
        Row: Business
        Insert: Partial<Business>
        Update: Partial<Business>
      }
      queues: {
        Row: Queue
        Insert: Partial<Queue>
        Update: Partial<Queue>
      }
      user_profiles: {
        Row: UserProfile
        Insert: Partial<UserProfile>
        Update: Partial<UserProfile>
      }
    }
  }
}
