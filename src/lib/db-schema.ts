export type Role = "CUSTOMER" | "ADMIN" | "STAFF";

export type QueueStatus = "WAITING" | "SERVING" | "SERVED" | "CANCELLED";

export interface Organization {
  id: string; // Document ID (e.g. 'city-hospital')
  name: string;
  address: string;
  counters: CounterInfo[]; // e.g. [{id: 'opd', name: 'OPD', prefix: 'OPD'}, {id: 'billing', name: 'Billing', prefix: 'BIL'}]
  settings: {
    language: string;
    allowSMS: boolean;
  };
  createdAt: any;
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
  estimatedWaitMins: number; // calculated at creation/update
  createdAt: any; // Firestore Timestamp
  servedAt?: any; // Firestore Timestamp
}
