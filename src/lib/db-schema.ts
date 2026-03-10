export type Role = "CUSTOMER" | "ADMIN" | "STAFF";

export type QueueStatus = "WAITING" | "SERVING" | "SERVED" | "CANCELLED";

export interface Organization {
  id: string; // Document ID (e.g. 'city-hospital')
  name: string;
  description?: string;
  address: string;
  phone?: string;
  cover_image_url?: string;
  is_verified?: boolean;
  plan: 'free' | 'growth' | 'enterprise';
  whatsapp_enabled: boolean;
  avg_rating: number;
  total_reviews: number;
  counters: CounterInfo[]; // e.g. [{id: 'opd', name: 'OPD', prefix: 'OPD'}, {id: 'billing', name: 'Billing', prefix: 'BIL'}]
  settings: {
    language: string;
    allowSMS: boolean;
    fastPassEnabled?: boolean;
    fastPassPrice?: number;
  };
  createdAt: any;
  updatedAt?: any;
}

export interface CounterInfo {
  id: string; // 'opd', 'lab'
  name: string; // 'OPD Consultation'
  prefix: string; // 'OPD-'
  estimatedWaitMins?: number;
}

export interface UserContext {
  uid: string;
  name: string;
  phoneNumber?: string;
  role: Role;
  preferences: {
    language: "en" | "hi" | "pa" | "ta" | "bn";
  };
}

export interface TokenItem {
  id?: string;
  orgId: string;
  counterId: string; // e.g. 'opd'
  queue_id?: string; // Reference to queues table
  userId: string;
  customerName: string;
  customerPhone?: string;
  tokenNumber: string; // e.g. 'OPD-021'
  status: QueueStatus;
  isPriority?: boolean;
  estimatedWaitMins: number; // calculated at creation/update
  createdAt: any; // Firestore Timestamp
  servedAt?: any; // Firestore Timestamp
}

export interface Review {
  id: string;
  token_id: string;
  business_id: string;
  user_id?: string;
  rating: number;
  comment?: string;
  created_at: any;
}

export interface Subscription {
  id: string;
  business_id: string;
  plan: string;
  razorpay_subscription_id?: string;
  status: string;
  current_period_end: any;
  created_at: any;
}

export interface FastPassTransaction {
  id: string;
  token_id: string;
  business_id: string;
  amount: number;
  platform_fee: number;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  status: string;
  created_at: any;
}

export interface StaffMember {
  id: string;
  business_id: string;
  user_id: string;
  role: 'owner' | 'operator' | 'viewer';
  name?: string;
  phone?: string;
  is_active: boolean;
  created_at: any;
}
