export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      advance_bookings: {
        Row: {
          id: string
          business_id: string | null
          customer_name: string
          customer_phone: string
          customer_email: string | null
          booking_date: string
          booking_time: string
          service_type: string | null
          notes: string | null
          status: string | null
          token_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          business_id?: string | null
          customer_name: string
          customer_phone: string
          customer_email?: string | null
          booking_date: string
          booking_time: string
          service_type?: string | null
          notes?: string | null
          status?: string | null
          token_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          business_id?: string | null
          customer_name?: string
          customer_phone?: string
          customer_email?: string | null
          booking_date?: string
          booking_time?: string
          service_type?: string | null
          notes?: string | null
          status?: string | null
          token_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      businesses: {
        Row: {
          id: string
          name: string
          category: string
          location: string
          serviceMins: number | null
          opHours: string | null
          aiEnabled: boolean | null
          smsEnabled: boolean | null
          fastPassEnabled: boolean | null
          fastPassPrice: number | null
          advanceBookingEnabled: boolean | null
          created_at: string | null
          owner_id: string | null
          latitude: number | null
          longitude: number | null
          plan: string
          phone: string | null
          whatsapp_enabled: boolean | null
          notification_language: string | null
          avg_rating: number | null
          total_reviews: number | null
          description: string | null
          address: string | null
          cover_image_url: string | null
          is_verified: boolean | null
          updated_at: string | null
          search_vector: unknown | null
          claim_status: string
          onboarding_step: number | null
          is_accepting_tokens: boolean | null
          op_hours_json: any | null
          settings: any | null
          avg_service_time: number | null
        }
        Insert: {
          id: string
          name: string
          category: string
          location: string
          serviceMins?: number | null
          opHours?: string | null
          aiEnabled?: boolean | null
          smsEnabled?: boolean | null
          fastPassEnabled?: boolean | null
          fastPassPrice?: number | null
          advanceBookingEnabled?: boolean | null
          created_at?: string | null
          owner_id?: string | null
          latitude?: number | null
          longitude?: number | null
          plan?: string
          phone?: string | null
          whatsapp_enabled?: boolean | null
          notification_language?: string | null
          avg_rating?: number | null
          total_reviews?: number | null
          description?: string | null
          address?: string | null
          cover_image_url?: string | null
          is_verified?: boolean | null
          updated_at?: string | null
          claim_status?: string
          onboarding_step?: number | null
          is_accepting_tokens?: boolean | null
          op_hours_json?: any | null
          settings?: any | null
          avg_service_time?: number | null
        }
        Update: {
          id?: string
          name?: string
          category?: string
          location?: string
          serviceMins?: number | null
          opHours?: string | null
          aiEnabled?: boolean | null
          smsEnabled?: boolean | null
          fastPassEnabled?: boolean | null
          fastPassPrice?: number | null
          advanceBookingEnabled?: boolean | null
          created_at?: string | null
          owner_id?: string | null
          latitude?: number | null
          longitude?: number | null
          plan?: string
          phone?: string | null
          whatsapp_enabled?: boolean | null
          notification_language?: string | null
          avg_rating?: number | null
          total_reviews?: number | null
          description?: string | null
          address?: string | null
          cover_image_url?: string | null
          is_verified?: boolean | null
          updated_at?: string | null
          claim_status?: string
          onboarding_step?: number | null
          is_accepting_tokens?: boolean | null
          op_hours_json?: any | null
          settings?: any | null
          avg_service_time?: number | null
        }
        Relationships: []
      }
      counters: {
        Row: {
          id: string
          orgId: string
          lastNumber: number | null
          created_at: string | null
        }
        Insert: {
          id: string
          orgId: string
          lastNumber?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          orgId?: string
          lastNumber?: number | null
          created_at?: string | null
        }
        Relationships: []
      }
      daily_stats: {
        Row: {
          id: string
          business_id: string | null
          stat_date: string
          total_tokens_issued: number | null
          total_served: number | null
          total_no_shows: number | null
          avg_wait_mins: number | null
          avg_service_mins: number | null
          peak_hour: number | null
          customer_satisfaction: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          business_id?: string | null
          stat_date?: string
          total_tokens_issued?: number | null
          total_served?: number | null
          total_no_shows?: number | null
          avg_wait_mins?: number | null
          avg_service_mins?: number | null
          peak_hour?: number | null
          customer_satisfaction?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          business_id?: string | null
          stat_date?: string
          total_tokens_issued?: number | null
          total_served?: number | null
          total_no_shows?: number | null
          avg_wait_mins?: number | null
          avg_service_mins?: number | null
          peak_hour?: number | null
          customer_satisfaction?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      fastpass_logs: {
        Row: {
          id: string
          business_id: string | null
          token_id: string | null
          amount: number
          customer_phone: string | null
          transaction_type: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          business_id?: string | null
          token_id?: string | null
          amount?: number
          customer_phone?: string | null
          transaction_type?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          business_id?: string | null
          token_id?: string | null
          amount?: number
          customer_phone?: string | null
          transaction_type?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      fastpass_transactions: {
        Row: {
          id: string
          token_id: string | null
          business_id: string | null
          customer_phone: string | null
          amount: number
          platform_fee: number
          business_payout: number
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          status: string
          refund_reason: string | null
          created_at: string | null
          paid_at: string | null
        }
        Insert: {
          id?: string
          token_id?: string | null
          business_id?: string | null
          customer_phone?: string | null
          amount: number
          platform_fee: number
          business_payout: number
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          status?: string
          refund_reason?: string | null
          created_at?: string | null
          paid_at?: string | null
        }
        Update: {
          id?: string
          token_id?: string | null
          business_id?: string | null
          customer_phone?: string | null
          amount?: number
          platform_fee?: number
          business_payout?: number
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          status?: string
          refund_reason?: string | null
          created_at?: string | null
          paid_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          token_id: string | null
          business_id: string | null
          customer_phone: string | null
          message: string
          type: string
          status: string
          sent_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          token_id?: string | null
          business_id?: string | null
          customer_phone?: string | null
          message: string
          type?: string
          status?: string
          sent_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          token_id?: string | null
          business_id?: string | null
          customer_phone?: string | null
          message?: string
          type?: string
          status?: string
          sent_at?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      otp_attempts: {
        Row: {
          id: string
          identifier: string
          ip_address: string | null
          attempted_at: string
          success: boolean
        }
        Insert: {
          id?: string
          identifier: string
          ip_address?: string | null
          attempted_at?: string
          success?: boolean
        }
        Update: {
          id?: string
          identifier?: string
          ip_address?: string | null
          attempted_at?: string
          success?: boolean
        }
        Relationships: []
      }
      predictions: {
        Row: {
          id: string
          bestTimeToVisit: string
          currentWaitTime: number
          predictedWaitNextHour: number
          predictedPeakHours: string
          confidence: string
          created_at: string | null
        }
        Insert: {
          id: string
          bestTimeToVisit: string
          currentWaitTime: number
          predictedWaitNextHour: number
          predictedPeakHours: string
          confidence: string
          created_at?: string | null
        }
        Update: {
          id?: string
          bestTimeToVisit?: string
          currentWaitTime?: number
          predictedWaitNextHour?: number
          predictedPeakHours?: string
          confidence?: string
          created_at?: string | null
        }
        Relationships: []
      }
      departments: {
        Row: {
          id: string
          business_id: string
          name: string
          description: string | null
          icon: string | null
          is_active: boolean | null
          serviceMins: number | null
          opHours: string | null
          max_capacity: number | null
          sort_order: number | null
          created_at: string | null
          updated_at: string | null
          prefix: string | null
          waiting_count: number | null
        }
        Insert: {
          id?: string
          business_id: string
          name: string
          description?: string | null
          icon?: string | null
          is_active?: boolean | null
          serviceMins?: number | null
          opHours?: string | null
          max_capacity?: number | null
          sort_order?: number | null
          created_at?: string | null
          updated_at?: string | null
          prefix?: string | null
          waiting_count?: number | null
        }
        Update: {
          id?: string
          business_id?: string
          name?: string
          description?: string | null
          icon?: string | null
          is_active?: boolean | null
          serviceMins?: number | null
          opHours?: string | null
          max_capacity?: number | null
          sort_order?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      queues: {
        Row: {
          id: string
          org_id: string
          counter_id: string
          session_date: string
          last_issued_number: number | null
          currently_serving: string | null
          total_waiting: number | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
          max_capacity: number | null
          is_accepting_tokens: boolean | null
          department_id: string | null
        }
        Insert: {
          id?: string
          org_id: string
          counter_id: string
          session_date?: string
          last_issued_number?: number | null
          currently_serving?: string | null
          total_waiting?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          max_capacity?: number | null
          is_accepting_tokens?: boolean | null
          department_id?: string | null
        }
        Update: {
          id?: string
          org_id?: string
          counter_id?: string
          session_date?: string
          last_issued_number?: number | null
          currently_serving?: string | null
          total_waiting?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          max_capacity?: number | null
          is_accepting_tokens?: boolean | null
          department_id?: string | null
        }
        Relationships: []
      }
      razorpay_webhook_events: {
        Row: {
          id: string
          razorpay_event_id: string
          event_type: string
          entity_id: string | null
          business_id: string | null
          payload: Json | null
          processed: boolean | null
          processed_at: string | null
          error: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          razorpay_event_id: string
          event_type: string
          entity_id?: string | null
          business_id?: string | null
          payload?: Json | null
          processed?: boolean | null
          processed_at?: string | null
          error?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          razorpay_event_id?: string
          event_type?: string
          entity_id?: string | null
          business_id?: string | null
          payload?: Json | null
          processed?: boolean | null
          processed_at?: string | null
          error?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          id: string
          token_id: string | null
          business_id: string | null
          user_id: string | null
          rating: number
          comment: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          token_id?: string | null
          business_id?: string | null
          user_id?: string | null
          rating: number
          comment?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          token_id?: string | null
          business_id?: string | null
          user_id?: string | null
          rating?: number
          comment?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      staff_members: {
        Row: {
          id: string
          business_id: string | null
          user_id: string | null
          role: string
          name: string
          phone: string | null
          is_active: boolean | null
          invited_at: string | null
          accepted_at: string | null
          created_at: string | null
          department_id: string | null
          access_code: string | null
          pin: string | null
          last_login_at: string | null
        }
        Insert: {
          id?: string
          business_id?: string | null
          user_id?: string | null
          role?: string
          name: string
          phone?: string | null
          is_active?: boolean | null
          invited_at?: string | null
          accepted_at?: string | null
          created_at?: string | null
          department_id?: string | null
          access_code?: string | null
          pin?: string | null
          last_login_at?: string | null
        }
        Update: {
          id?: string
          business_id?: string | null
          user_id?: string | null
          role?: string
          name?: string
          phone?: string | null
          is_active?: boolean | null
          invited_at?: string | null
          accepted_at?: string | null
          created_at?: string | null
          department_id?: string | null
          access_code?: string | null
          pin?: string | null
          last_login_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: string
          business_id: string | null
          plan: string
          razorpay_subscription_id: string | null
          razorpay_customer_id: string | null
          status: string
          trial_ends_at: string | null
          current_period_start: string | null
          current_period_end: string | null
          cancelled_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          business_id?: string | null
          plan?: string
          razorpay_subscription_id?: string | null
          razorpay_customer_id?: string | null
          status?: string
          trial_ends_at?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          business_id?: string | null
          plan?: string
          razorpay_subscription_id?: string | null
          razorpay_customer_id?: string | null
          status?: string
          trial_ends_at?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tokens: {
        Row: {
          id: string
          tokenNumber: string
          orgId: string
          counterId: string
          userId: string | null
          customerName: string
          customerPhone: string | null
          status: string
          estimatedWaitMins: number | null
          isPriority: boolean | null
          servedAt: string | null
          createdAt: string | null
          queue_id: string | null
          department_id: string | null
          paymentId: string | null
        }
        Insert: {
          id?: string
          tokenNumber: string
          orgId: string
          counterId: string
          userId?: string | null
          customerName: string
          customerPhone?: string | null
          status: string
          estimatedWaitMins?: number | null
          isPriority?: boolean | null
          servedAt?: string | null
          createdAt?: string | null
          queue_id?: string | null
          department_id?: string | null
          paymentId?: string | null
        }
        Update: {
          id?: string
          tokenNumber?: string
          orgId?: string
          counterId?: string
          userId?: string | null
          customerName?: string
          customerPhone?: string | null
          status?: string
          estimatedWaitMins?: number | null
          isPriority?: boolean | null
          servedAt?: string | null
          createdAt?: string | null
          queue_id?: string | null
          department_id?: string | null
          paymentId?: string | null
        }
        Relationships: []
      }
      tokens_archive: {
        Row: {
          id: string
          tokenNumber: string
          orgId: string
          counterId: string
          userId: string | null
          customerName: string
          customerPhone: string | null
          status: string
          estimatedWaitMins: number | null
          isPriority: boolean | null
          servedAt: string | null
          createdAt: string | null
          queue_id: string | null
        }
        Insert: {
          id?: string
          tokenNumber: string
          orgId: string
          counterId: string
          userId?: string | null
          customerName: string
          customerPhone?: string | null
          status: string
          estimatedWaitMins?: number | null
          isPriority?: boolean | null
          servedAt?: string | null
          createdAt?: string | null
          queue_id?: string | null
        }
        Update: {
          id?: string
          tokenNumber?: string
          orgId?: string
          counterId?: string
          userId?: string | null
          customerName?: string
          customerPhone?: string | null
          status?: string
          estimatedWaitMins?: number | null
          isPriority?: boolean | null
          servedAt?: string | null
          createdAt?: string | null
          queue_id?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          email: string | null
          role: string | null
          avatar_url: string | null
          created_at: string | null
          updated_at: string | null
          onboarding_completed_at: string | null
          visit_count: number | null
          city: string | null
          preferred_language: string | null
          profile_completed: boolean | null
          notification_preference: string | null
          date_of_birth: string | null
          gender: string | null
          pincode: string | null
          state: string | null
          bio: string | null
          aadhaar_last4: string | null
          pan_last4: string | null
          kyc_status: string
          kyc_submitted_at: string | null
          kyc_verified_at: string | null
          is_business_owner: boolean | null
          primary_business_id: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          phone?: string | null
          email?: string | null
          role?: string | null
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
          onboarding_completed_at?: string | null
          visit_count?: number | null
          city?: string | null
          preferred_language?: string | null
          profile_completed?: boolean | null
          notification_preference?: string | null
          date_of_birth?: string | null
          gender?: string | null
          pincode?: string | null
          state?: string | null
          bio?: string | null
          aadhaar_last4?: string | null
          pan_last4?: string | null
          kyc_status?: string
          kyc_submitted_at?: string | null
          kyc_verified_at?: string | null
          is_business_owner?: boolean | null
          primary_business_id?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          phone?: string | null
          email?: string | null
          role?: string | null
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
          onboarding_completed_at?: string | null
          visit_count?: number | null
          city?: string | null
          preferred_language?: string | null
          profile_completed?: boolean | null
          notification_preference?: string | null
          date_of_birth?: string | null
          gender?: string | null
          pincode?: string | null
          state?: string | null
          bio?: string | null
          aadhaar_last4?: string | null
          pan_last4?: string | null
          kyc_status?: string
          kyc_submitted_at?: string | null
          kyc_verified_at?: string | null
          is_business_owner?: boolean | null
          primary_business_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      businesses_home_view: {
        Row: {
          id: string | null
          name: string | null
          category: string | null
          location: string | null
          address: string | null
          latitude: number | null
          longitude: number | null
          avg_rating: number | null
          total_reviews: number | null
          is_verified: boolean | null
          claim_status: string | null
          serviceMins: number | null
          phone: string | null
          whatsapp_enabled: boolean | null
          total_waiting: number | null
          is_active: boolean | null
          is_accepting_tokens: boolean | null
          last_issued_number: number | null
          max_capacity: number | null
        }
      }
    }
    Functions: {
      get_hourly_distribution: {
        Args: {
          p_org_id: string
          p_date: string
        }
        Returns: {
          hour_val: number
          token_count: number
        }[]
      }
      get_wait_time_trend: {
        Args: {
          p_org_id: string
          p_days: number
        }
        Returns: {
          date_val: string
          avg_wait: number
        }[]
      }
      increment_queue_counter: {
        Args: {
          p_queue_id: string
        }
        Returns: number
      }
      create_queue_token: {
        Args: {
          p_org_id: string
          p_user_id: string | null
          p_customer_name: string
          p_customer_phone: string
          p_token_number: string
          p_estimated_wait_mins: number
          p_department_id?: string | null
          p_is_priority?: boolean
          p_payment_id?: string | null
        }
        Returns: { id: string, orgId: string }[]
      }
      activate_queue_for_today: {
        Args: {
          p_org_id: string
        }
        Returns: boolean
      }
      decrement_queue_waiting: {
        Args: {
          p_queue_id: string
        }
        Returns: void
      }
      serve_next_queue_token: {
        Args: {
          p_queue_id: string
          p_token_id: string
        }
        Returns: void
      }
      check_otp_rate_limit: {
        Args: {
          p_email: string
        }
        Returns: boolean
      }
      archive_old_tokens: {
        Args: {
          [_ in never]: never
        }
        Returns: number
      }
      generate_business_id: {
        Args: {
          p_location: string
        }
        Returns: string
      }
      generate_department_id: {
        Args: {
          p_business_id: string
          p_name: string
        }
        Returns: string
      }
      generate_staff_access_code: {
        Args: {
          [_ in never]: never
        }
        Returns: string
      }
      create_department: {
        Args: {
          p_business_id: string
          p_name: string
          p_description?: string
          p_icon?: string
          p_service_mins?: number
          p_op_hours?: string
          p_max_capacity?: number
        }
        Returns: {
          id: string
          name: string
          queue_id: string
        }[]
      }
      add_staff_member: {
        Args: {
          p_business_id: string
          p_department_id: string
          p_name: string
          p_phone?: string
          p_role?: string
        }
        Returns: {
          id: string
          access_code: string
        }[]
      }
      staff_login_by_code: {
        Args: {
          p_code: string
        }
        Returns: {
          staff_id: string
          staff_name: string
          staff_role: string
          business_id: string
          business_name: string
          department_id: string
          dept_name: string
          dept_icon: string
          queue_id: string
        }[]
      }
      get_business_with_departments: {
        Args: {
          p_business_id: string
        }
        Returns: Json
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

export type Business = Database['public']['Tables']['businesses']['Row'];
export type Profile = Database['public']['Tables']['user_profiles']['Row'];
export type Token = Database['public']['Tables']['tokens']['Row'];
export type Queue = Database['public']['Tables']['queues']['Row'];
export type StaffMember = Database['public']['Tables']['staff_members']['Row'];
export type DailyStats = Database['public']['Tables']['daily_stats']['Row'];
export type AdvanceBooking = Database['public']['Tables']['advance_bookings']['Row'];
export type Department = Database['public']['Tables']['departments']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];
