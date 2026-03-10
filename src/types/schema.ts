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
  orgId: string;
  name: string;
  category: "hospitals" | "banks" | "salons" | "government" | "events";
  description?: string;
  location: {
    address: string;
    city: string;
    coordinates?: [number, number];
  };
  phone?: string;
  coverImageUrl?: string;
  isVerified: boolean;
  plan: "free" | "growth" | "enterprise";
  metrics: {
    rating: number;
    totalReviews: number;
  };
  settings: {
    isOpen: boolean;
    fastPassEnabled: boolean;
    fastPassPrice: number; // in INR
    advanceBookingEnabled: boolean;
    whatsappEnabled: boolean;
  };
  services: {
    id: string; // e.g. 'opd'
    prefix: string; // e.g. 'OPD'
    name: string;
    averageServiceTimeMins: number; // used by AI predictor
  }[];
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
  tokenId: string;
  orgId: string;
  sessionId: string;
  userId: string | null; // null if printed locally for walk-in
  customerName: string;
  customerPhone: string;
  serviceId: string;
  tokenNumber: string; // e.g. 'OPD-12'
  status: "WAITING" | "SERVING" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

  // Marketplace Additions
  isPriority: boolean; // True if Fast Pass was purchased
  bookedFor: Date | null; // Null if joined live, Date if pre-booked
  paymentId?: string; // Reference to Payment document

  metrics: {
    joinedAt: Date;
    servedAt: Date | null;
    completedAt: Date | null;
    predictedWaitMins: number;
  };
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
