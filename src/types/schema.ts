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
    notifications: 'sms' | 'whatsapp' | 'push';
    language: 'en' | 'hi' | 'pa';
  };
}

export interface Business {
  orgId: string;
  name: string;
  category: 'hospitals' | 'banks' | 'salons' | 'government' | 'events';
  location: {
    address: string;
    city: string;
    coordinates: [number, number]; // [lat, lng] for Supabase PostGIS or simple float columns
  };
  metrics: {
    rating: number;
    totalReviews: number;
  };
  settings: {
    isOpen: boolean;
    fastPassEnabled: boolean;
    fastPassPrice: number; // in INR
    advanceBookingEnabled: boolean;
  };
  services: {
    id: string; // e.g. 'opd'
    prefix: string; // e.g. 'OPD'
    name: string;
    averageServiceTimeMins: number; // used by AI predictor
  }[];
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
  status: 'WAITING' | 'SERVING' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  
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
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  createdAt: Date;
}

export interface Notification {
  notificationId: string;
  userId: string;
  channel: 'sms' | 'whatsapp' | 'push';
  type: 'QUEUE_JOINED' | 'TURN_APPROACHING' | 'NOW_SERVING' | 'EVENT_PROMO';
  payload: string; // Message content
  status: 'SENT' | 'FAILED' | 'DELIVERED';
  createdAt: Date;
}
