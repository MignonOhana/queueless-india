"use client";

import { useState, useCallback } from "react";
import { Language } from "@/context/LanguageContext";

export interface UserProfileData {
  uid: string;
  name: string;
  phone: string;
  email: string;
  language: Language;
  memberSince: string;
  notifications: {
    sms: boolean;
    whatsapp: boolean;
    push: boolean;
  };
  queueHistory: {
    id: string;
    orgName: string;
    serviceName: string;
    date: string;
    waitTimeMins: number;
    status: "SERVED" | "CANCELLED";
  }[];
}

// Mock User Data for Demo Purposes
const MOCK_USER: UserProfileData = {
  uid: "usr_mock_123",
  name: "Rahul Sharma",
  phone: "+91 98765 43210",
  email: "rahul@email.com",
  language: "en",
  memberSince: "2026",
  notifications: {
    sms: true,
    whatsapp: false,
    push: true,
  },
  queueHistory: [
    {
      id: "qh_1",
      orgName: "City Hospital",
      serviceName: "OPD Consultation",
      date: "Oct 12, 2026",
      waitTimeMins: 15,
      status: "SERVED",
    },
    {
      id: "qh_2",
      orgName: "State Bank of India",
      serviceName: "Cash Deposit",
      date: "Oct 05, 2026",
      waitTimeMins: 45,
      status: "SERVED",
    },
    {
      id: "qh_3",
      orgName: "Looks Salon",
      serviceName: "Haircut",
      date: "Sep 28, 2026",
      waitTimeMins: 10,
      status: "CANCELLED",
    }
  ]
};

export function useProfile() {
  const [profile, setProfile] = useState<UserProfileData>(MOCK_USER);
  const [isLoading, setIsLoading] = useState(false);

  // In production, sync with Firestore `users/{uid}`
  const updateProfile = useCallback(async (updates: Partial<UserProfileData>) => {
    setIsLoading(true);
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 800));
    setProfile(prev => ({ ...prev, ...updates }));
    setIsLoading(false);
  }, []);

  const updateNotifications = useCallback(async (key: keyof UserProfileData["notifications"], value: boolean) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 400));
    setProfile(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
    setIsLoading(false);
  }, []);

  return {
    profile,
    isLoading,
    updateProfile,
    updateNotifications
  };
}
