export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      advance_bookings: {
        Row: {
          booking_date: string
          booking_time: string
          business_id: string | null
          created_at: string | null
          customer_email: string | null
          customer_name: string
          customer_phone: string
          id: string
          notes: string | null
          service_type: string | null
          status: string | null
          token_id: string | null
          updated_at: string | null
        }
        Insert: {
          booking_date: string
          booking_time: string
          business_id?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          id?: string
          notes?: string | null
          service_type?: string | null
          status?: string | null
          token_id?: string | null
          updated_at?: string | null
        }
        Update: {
          booking_date?: string
          booking_time?: string
          business_id?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          id?: string
          notes?: string | null
          service_type?: string | null
          status?: string | null
          token_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "advance_bookings_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advance_bookings_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses_home_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advance_bookings_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          address: string | null
          advanceBookingEnabled: boolean | null
          aiEnabled: boolean | null
          avg_rating: number | null
          category: string
          claim_status: string
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          fastPassEnabled: boolean | null
          fastPassPrice: number | null
          id: string
          is_verified: boolean | null
          latitude: number | null
          location: string
          longitude: number | null
          name: string
          notification_language: string | null
          onboarding_step: number | null
          opHours: string | null
          owner_id: string | null
          phone: string | null
          plan: string
          search_vector: unknown
          serviceMins: number | null
          smsEnabled: boolean | null
          total_reviews: number | null
          updated_at: string | null
          whatsapp_enabled: boolean | null
        }
        Insert: {
          address?: string | null
          advanceBookingEnabled?: boolean | null
          aiEnabled?: boolean | null
          avg_rating?: number | null
          category: string
          claim_status?: string
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          fastPassEnabled?: boolean | null
          fastPassPrice?: number | null
          id: string
          is_verified?: boolean | null
          latitude?: number | null
          location: string
          longitude?: number | null
          name: string
          notification_language?: string | null
          onboarding_step?: number | null
          opHours?: string | null
          owner_id?: string | null
          phone?: string | null
          plan?: string
          search_vector?: unknown
          serviceMins?: number | null
          smsEnabled?: boolean | null
          total_reviews?: number | null
          updated_at?: string | null
          whatsapp_enabled?: boolean | null
        }
        Update: {
          address?: string | null
          advanceBookingEnabled?: boolean | null
          aiEnabled?: boolean | null
          avg_rating?: number | null
          category?: string
          claim_status?: string
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          fastPassEnabled?: boolean | null
          fastPassPrice?: number | null
          id?: string
          is_verified?: boolean | null
          latitude?: number | null
          location?: string
          longitude?: number | null
          name?: string
          notification_language?: string | null
          onboarding_step?: number | null
          opHours?: string | null
          owner_id?: string | null
          phone?: string | null
          plan?: string
          search_vector?: unknown
          serviceMins?: number | null
          smsEnabled?: boolean | null
          total_reviews?: number | null
          updated_at?: string | null
          whatsapp_enabled?: boolean | null
        }
        Relationships: []
      }
      counters: {
        Row: {
          created_at: string | null
          id: string
          lastNumber: number | null
          orgId: string
        }
        Insert: {
          created_at?: string | null
          id: string
          lastNumber?: number | null
          orgId: string
        }
        Update: {
          created_at?: string | null
          id?: string
          lastNumber?: number | null
          orgId?: string
        }
        Relationships: []
      }
      daily_stats: {
        Row: {
          avg_service_mins: number | null
          avg_wait_mins: number | null
          business_id: string | null
          created_at: string | null
          customer_satisfaction: number | null
          id: string
          peak_hour: number | null
          stat_date: string
          total_no_shows: number | null
          total_served: number | null
          total_tokens_issued: number | null
          updated_at: string | null
        }
        Insert: {
          avg_service_mins?: number | null
          avg_wait_mins?: number | null
          business_id?: string | null
          created_at?: string | null
          customer_satisfaction?: number | null
          id?: string
          peak_hour?: number | null
          stat_date?: string
          total_no_shows?: number | null
          total_served?: number | null
          total_tokens_issued?: number | null
          updated_at?: string | null
        }
        Update: {
          avg_service_mins?: number | null
          avg_wait_mins?: number | null
          business_id?: string | null
          created_at?: string | null
          customer_satisfaction?: number | null
          id?: string
          peak_hour?: number | null
          stat_date?: string
          total_no_shows?: number | null
          total_served?: number | null
          total_tokens_issued?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_stats_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_stats_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses_home_view"
            referencedColumns: ["id"]
          },
        ]
      }
      fastpass_logs: {
        Row: {
          amount: number
          business_id: string | null
          created_at: string | null
          customer_phone: string | null
          id: string
          token_id: string | null
          transaction_type: string | null
        }
        Insert: {
          amount?: number
          business_id?: string | null
          created_at?: string | null
          customer_phone?: string | null
          id?: string
          token_id?: string | null
          transaction_type?: string | null
        }
        Update: {
          amount?: number
          business_id?: string | null
          created_at?: string | null
          customer_phone?: string | null
          id?: string
          token_id?: string | null
          transaction_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fastpass_logs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fastpass_logs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses_home_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fastpass_logs_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      fastpass_transactions: {
        Row: {
          amount: number
          business_id: string | null
          business_payout: number
          created_at: string | null
          customer_phone: string | null
          id: string
          paid_at: string | null
          platform_fee: number
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          refund_reason: string | null
          status: string
          token_id: string | null
        }
        Insert: {
          amount: number
          business_id?: string | null
          business_payout: number
          created_at?: string | null
          customer_phone?: string | null
          id?: string
          paid_at?: string | null
          platform_fee: number
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          refund_reason?: string | null
          status?: string
          token_id?: string | null
        }
        Update: {
          amount?: number
          business_id?: string | null
          business_payout?: number
          created_at?: string | null
          customer_phone?: string | null
          id?: string
          paid_at?: string | null
          platform_fee?: number
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          refund_reason?: string | null
          status?: string
          token_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fastpass_transactions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fastpass_transactions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses_home_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fastpass_transactions_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          business_id: string | null
          created_at: string | null
          customer_phone: string | null
          id: string
          message: string
          sent_at: string | null
          status: string
          token_id: string | null
          type: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string | null
          customer_phone?: string | null
          id?: string
          message: string
          sent_at?: string | null
          status?: string
          token_id?: string | null
          type?: string
        }
        Update: {
          business_id?: string | null
          created_at?: string | null
          customer_phone?: string | null
          id?: string
          message?: string
          sent_at?: string | null
          status?: string
          token_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses_home_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      otp_attempts: {
        Row: {
          attempted_at: string
          id: string
          identifier: string
          ip_address: string | null
          success: boolean
        }
        Insert: {
          attempted_at?: string
          id?: string
          identifier: string
          ip_address?: string | null
          success?: boolean
        }
        Update: {
          attempted_at?: string
          id?: string
          identifier?: string
          ip_address?: string | null
          success?: boolean
        }
        Relationships: []
      }
      predictions: {
        Row: {
          bestTimeToVisit: string
          confidence: string
          created_at: string | null
          currentWaitTime: number
          id: string
          predictedPeakHours: string
          predictedWaitNextHour: number
        }
        Insert: {
          bestTimeToVisit: string
          confidence: string
          created_at?: string | null
          currentWaitTime: number
          id: string
          predictedPeakHours: string
          predictedWaitNextHour: number
        }
        Update: {
          bestTimeToVisit?: string
          confidence?: string
          created_at?: string | null
          currentWaitTime?: number
          id?: string
          predictedPeakHours?: string
          predictedWaitNextHour?: number
        }
        Relationships: []
      }
      queues: {
        Row: {
          counter_id: string
          created_at: string | null
          currently_serving: string | null
          id: string
          is_accepting_tokens: boolean | null
          is_active: boolean | null
          last_issued_number: number | null
          max_capacity: number | null
          org_id: string
          session_date: string
          total_waiting: number | null
          updated_at: string | null
        }
        Insert: {
          counter_id: string
          created_at?: string | null
          currently_serving?: string | null
          id?: string
          is_accepting_tokens?: boolean | null
          is_active?: boolean | null
          last_issued_number?: number | null
          max_capacity?: number | null
          org_id: string
          session_date?: string
          total_waiting?: number | null
          updated_at?: string | null
        }
        Update: {
          counter_id?: string
          created_at?: string | null
          currently_serving?: string | null
          id?: string
          is_accepting_tokens?: boolean | null
          is_active?: boolean | null
          last_issued_number?: number | null
          max_capacity?: number | null
          org_id?: string
          session_date?: string
          total_waiting?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "queues_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "queues_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "businesses_home_view"
            referencedColumns: ["id"]
          },
        ]
      }
      razorpay_webhook_events: {
        Row: {
          business_id: string | null
          created_at: string | null
          entity_id: string | null
          error: string | null
          event_type: string
          id: string
          payload: Json | null
          processed: boolean | null
          processed_at: string | null
          razorpay_event_id: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          error?: string | null
          event_type: string
          id?: string
          payload?: Json | null
          processed?: boolean | null
          processed_at?: string | null
          razorpay_event_id: string
        }
        Update: {
          business_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          error?: string | null
          event_type?: string
          id?: string
          payload?: Json | null
          processed?: boolean | null
          processed_at?: string | null
          razorpay_event_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "razorpay_webhook_events_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "razorpay_webhook_events_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses_home_view"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          business_id: string | null
          comment: string | null
          created_at: string | null
          id: string
          rating: number
          token_id: string | null
          user_id: string | null
        }
        Insert: {
          business_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          rating: number
          token_id?: string | null
          user_id?: string | null
        }
        Update: {
          business_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number
          token_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses_home_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: true
            referencedRelation: "tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_members: {
        Row: {
          accepted_at: string | null
          business_id: string | null
          created_at: string | null
          id: string
          invited_at: string | null
          is_active: boolean | null
          name: string
          phone: string | null
          role: string
          user_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          business_id?: string | null
          created_at?: string | null
          id?: string
          invited_at?: string | null
          is_active?: boolean | null
          name: string
          phone?: string | null
          role?: string
          user_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          business_id?: string | null
          created_at?: string | null
          id?: string
          invited_at?: string | null
          is_active?: boolean | null
          name?: string
          phone?: string | null
          role?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_members_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_members_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses_home_view"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          business_id: string | null
          cancelled_at: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan: string
          razorpay_customer_id: string | null
          razorpay_subscription_id: string | null
          status: string
          trial_ends_at: string | null
          updated_at: string | null
        }
        Insert: {
          business_id?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string
          razorpay_customer_id?: string | null
          razorpay_subscription_id?: string | null
          status?: string
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Update: {
          business_id?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string
          razorpay_customer_id?: string | null
          razorpay_subscription_id?: string | null
          status?: string
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "businesses_home_view"
            referencedColumns: ["id"]
          },
        ]
      }
      tokens: {
        Row: {
          counterId: string
          createdAt: string | null
          customerName: string
          customerPhone: string | null
          estimatedWaitMins: number | null
          id: string
          isPriority: boolean | null
          orgId: string
          queue_id: string | null
          servedAt: string | null
          status: string
          tokenNumber: string
          userId: string | null
        }
        Insert: {
          counterId: string
          createdAt?: string | null
          customerName: string
          customerPhone?: string | null
          estimatedWaitMins?: number | null
          id?: string
          isPriority?: boolean | null
          orgId: string
          queue_id?: string | null
          servedAt?: string | null
          status: string
          tokenNumber: string
          userId?: string | null
        }
        Update: {
          counterId?: string
          createdAt?: string | null
          customerName?: string
          customerPhone?: string | null
          estimatedWaitMins?: number | null
          id?: string
          isPriority?: boolean | null
          orgId?: string
          queue_id?: string | null
          servedAt?: string | null
          status?: string
          tokenNumber?: string
          userId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tokens_orgid_fkey"
            columns: ["orgId"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tokens_orgid_fkey"
            columns: ["orgId"]
            isOneToOne: false
            referencedRelation: "businesses_home_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tokens_queue_id_fkey"
            columns: ["queue_id"]
            isOneToOne: false
            referencedRelation: "queues"
            referencedColumns: ["id"]
          },
        ]
      }
      tokens_archive: {
        Row: {
          counterId: string
          createdAt: string | null
          customerName: string
          customerPhone: string | null
          estimatedWaitMins: number | null
          id: string
          isPriority: boolean | null
          orgId: string
          queue_id: string | null
          servedAt: string | null
          status: string
          tokenNumber: string
          userId: string | null
        }
        Insert: {
          counterId: string
          createdAt?: string | null
          customerName: string
          customerPhone?: string | null
          estimatedWaitMins?: number | null
          id?: string
          isPriority?: boolean | null
          orgId: string
          queue_id?: string | null
          servedAt?: string | null
          status: string
          tokenNumber: string
          userId?: string | null
        }
        Update: {
          counterId?: string
          createdAt?: string | null
          customerName?: string
          customerPhone?: string | null
          estimatedWaitMins?: number | null
          id?: string
          isPriority?: boolean | null
          orgId?: string
          queue_id?: string | null
          servedAt?: string | null
          status?: string
          tokenNumber?: string
          userId?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          notification_preference: string | null
          onboarding_completed_at: string | null
          phone: string | null
          preferred_language: string | null
          profile_completed: boolean | null
          role: string | null
          updated_at: string | null
          visit_count: number | null
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          notification_preference?: string | null
          onboarding_completed_at?: string | null
          phone?: string | null
          preferred_language?: string | null
          profile_completed?: boolean | null
          role?: string | null
          updated_at?: string | null
          visit_count?: number | null
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          notification_preference?: string | null
          onboarding_completed_at?: string | null
          phone?: string | null
          preferred_language?: string | null
          profile_completed?: boolean | null
          role?: string | null
          updated_at?: string | null
          visit_count?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      businesses_home_view: {
        Row: {
          address: string | null
          avg_rating: number | null
          category: string | null
          claim_status: string | null
          id: string | null
          is_accepting_tokens: boolean | null
          is_active: boolean | null
          is_verified: boolean | null
          last_issued_number: number | null
          latitude: number | null
          location: string | null
          longitude: number | null
          max_capacity: number | null
          name: string | null
          phone: string | null
          serviceMins: number | null
          total_reviews: number | null
          total_waiting: number | null
          whatsapp_enabled: boolean | null
        }
        Relationships: []
      }
    }
    Functions: {
      activate_queue_for_today: {
        Args: { p_counter_id?: string; p_org_id: string }
        Returns: string
      }
      activate_subscription: {
        Args: {
          p_business_id: string
          p_period_end?: string
          p_plan?: string
          p_razorpay_customer_id: string
          p_razorpay_subscription_id: string
        }
        Returns: undefined
      }
      archive_old_tokens: { Args: never; Returns: number }
      cancel_subscription: {
        Args: { p_business_id: string }
        Returns: undefined
      }
      check_otp_rate_limit: {
        Args: {
          p_identifier: string
          p_ip_address?: string
          p_max_attempts?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      cleanup_otp_attempts: { Args: never; Returns: undefined }
      create_queue_token: {
        Args: {
          p_counter_id: string
          p_customer_name: string
          p_customer_phone: string
          p_estimated_wait_mins: number
          p_is_priority?: boolean
          p_org_id: string
          p_queue_id?: string
          p_token_number: string
          p_user_id: string
        }
        Returns: {
          counterId: string
          createdAt: string | null
          customerName: string
          customerPhone: string | null
          estimatedWaitMins: number | null
          id: string
          isPriority: boolean | null
          orgId: string
          queue_id: string | null
          servedAt: string | null
          status: string
          tokenNumber: string
          userId: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "tokens"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      decrement_queue_waiting: {
        Args: { p_queue_id: string }
        Returns: undefined
      }
      get_daily_stats: {
        Args: { p_days?: number; p_org_id: string }
        Returns: {
          avg_wait_mins: number
          stat_date: string
          total_noshow: number
          total_served: number
        }[]
      }
      get_fastpass_revenue: {
        Args: { p_business_id: string; p_days?: number }
        Returns: {
          gross_revenue: number
          net_payout: number
          platform_fees: number
          stat_date: string
          total_transactions: number
        }[]
      }
      get_hourly_distribution: {
        Args: { p_date?: string; p_org_id: string }
        Returns: {
          hour: number
          token_count: number
        }[]
      }
      get_live_pulse_data: { Args: never; Returns: Json }
      get_my_profile: {
        Args: never
        Returns: {
          avatar_url: string | null
          city: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          notification_preference: string | null
          onboarding_completed_at: string | null
          phone: string | null
          preferred_language: string | null
          profile_completed: boolean | null
          role: string | null
          updated_at: string | null
          visit_count: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "user_profiles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_nearby_businesses: {
        Args: {
          p_category?: string
          p_lat: number
          p_limit?: number
          p_lng: number
          p_radius_km?: number
        }
        Returns: {
          avg_rating: number
          category: string
          claim_status: string
          cover_image_url: string
          distance_km: number
          id: string
          is_verified: boolean
          location: string
          name: string
          total_reviews: number
        }[]
      }
      get_or_create_todays_queue: {
        Args: { p_counter_id: string; p_org_id: string }
        Returns: {
          counter_id: string
          created_at: string | null
          currently_serving: string | null
          id: string
          is_accepting_tokens: boolean | null
          is_active: boolean | null
          last_issued_number: number | null
          max_capacity: number | null
          org_id: string
          session_date: string
          total_waiting: number | null
          updated_at: string | null
        }
        SetofOptions: {
          from: "*"
          to: "queues"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_queue_display_status: {
        Args: { p_org_id: string }
        Returns: {
          display_label: string
          display_state: string
          estimated_wait_mins: number
          is_accepting: boolean
          queue_id: string
          total_waiting: number
        }[]
      }
      get_queue_position: {
        Args: { p_token_id: string }
        Returns: {
          currently_serving_token: string
          estimated_wait_mins: number
          is_next: boolean
          queue_position: number
          total_waiting: number
        }[]
      }
      get_user_role: { Args: { p_user_id: string }; Returns: string }
      increment_queue_counter: { Args: { p_queue_id: string }; Returns: number }
      keepalive_ping: { Args: never; Returns: undefined }
      mark_otp_success: { Args: { p_identifier: string }; Returns: undefined }
      search_businesses_fuzzy: {
        Args: { p_category?: string; p_limit?: number; p_query: string }
        Returns: {
          avg_rating: number
          category: string
          cover_image_url: string
          id: string
          location: string
          name: string
          similarity_score: number
        }[]
      }
      serve_next_queue_token: {
        Args: { p_queue_id: string; p_token_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

export type Business = Database['public']['Tables']['businesses']['Row'];
export type Queue = Database['public']['Tables']['queues']['Row'];
export type Token = Database['public']['Tables']['tokens']['Row'];

export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
