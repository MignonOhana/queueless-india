/**
 * Database Schema Definitions (Supabase PostgreSQL)
 * Queue Discovery Marketplace MVP
 */

export interface User {
  uid: string;
  name: string;
  phone: string;
  email?: string;
  createdAt: Date;
  preferences: {
    notifications: "sms" | "whatsapp" | "push";
    language: "en" | "hi" | "pa";
  };
}

export interface Business {
  id: string; // id is a human-readable slug e.g. 'aiims-delhi'
  name: string;
  category: "hospitals" | "banks" | "salons" | "government" | "events";
  description?: string;
  location?: string; // Address text
  latitude?: number;
  longitude?: number;
  phone?: string;
  coverImageUrl?: string;
  isVerified: boolean;
  owner_id: string; // UUID of the owner
  plan: "free" | "growth" | "enterprise";
  avg_rating: number;
  total_reviews: number;
  is_open?: boolean; // actually used in dashboard updates
  whatsapp_enabled: boolean;
  fastPassEnabled: boolean;
  fastPassPrice: number;
  serviceMins: number;
  opHours: string;
  op_hours_json?: Record<string, { open: string; close: string }[] | null>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  tokenId: string;
  businessId: string;
  userId?: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export interface Subscription {
  id: string;
  businessId: string;
  plan: string;
  razorpaySubscriptionId?: string;
  status: string;
  currentPeriodEnd: Date;
  createdAt: Date;
}

export interface StaffMember {
  id: string;
  businessId: string;
  userId: string;
  role: "owner" | "operator" | "viewer";
  name?: string;
  phone?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface FastPassTransaction {
  id: string;
  tokenId: string;
  businessId: string;
  amount: number;
  platformFee: number;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  status: string;
  createdAt: Date;
}

export interface Queue {
  id: string; // UUID
  org_id: string; // Business slug (e.g. 'aiims-delhi')
  counter_id: string;
  session_date: string;
  last_issued_number: number;
  currently_serving_token_id: string | null;
  total_waiting: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface QueueSession {
  sessionId: string; // typically {orgId}_{YYYYMMDD}
  orgId: string;
  date: string;
  isActive: boolean;
  stats: {
    currentlyServingToken: string | null;
    totalTokensIssued: number;
    totalPriorityTokens: number;
    averageWaitTimeMins: number;
  };
  updatedAt: Date;
}

export interface Token {
  id: string; // UUID
  orgId: string; // Business slug (e.g. 'aiims-delhi')
  queue_id: string; // UUID reference to queues.id
  userId: string | null; // null if printed locally for walk-in
  customerName: string;
  customerPhone: string;
  counterId: string; // e.g. 'opd'
  tokenNumber: string; // e.g. 'OPD-012'
  status: "WAITING" | "SERVING" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  estimatedWaitMins: number;
  isPriority: boolean;
  createdAt: Date;
  servedAt: Date | null;
  completedAt: Date | null;
}

export interface Payment {
  paymentId: string;
  gatewaySessionId: string; // Stripe/Razorpay session
  orgId: string;
  userId: string;
  tokenId: string; // The token that was upgraded
  amount: number; // in INR
  currency: string;
  status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
  createdAt: Date;
}

export interface Notification {
  id: string;
  token_id: string | null;
  business_id: string | null;
  customer_phone: string | null;
  message: string;
  type: "sms" | "whatsapp" | "push" | "email";
  status: "pending" | "sent" | "failed" | "delivered";
  sent_at: string | null;
  created_at: string;
}

export interface DailyStat {
  id: string;
  business_id: string;
  stat_date: string;
  total_tokens_issued: number;
  total_served: number;
  total_no_shows: number;
  avg_wait_mins: number;
  avg_service_mins: number;
  peak_hour: number | null;
  customer_satisfaction: number;
  created_at: string;
  updated_at: string;
}

export interface AdvanceBooking {
  id: string;
  business_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  booking_date: string;
  booking_time: string;
  service_type: string | null;
  notes: string | null;
  status: "confirmed" | "cancelled" | "completed" | "no_show";
  token_id: string | null;
  created_at: string;
  updated_at: string;
}
