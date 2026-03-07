"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { Role } from "@/lib/db-schema";

interface AuthContextType {
  user: User | null;
  userRole: Role | null;
  loading: boolean;
  loginAsCustomer: () => Promise<void>;
  loginAsAdmin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: null,
  loading: true,
  loginAsCustomer: async () => {},
  loginAsAdmin: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // Mock role determination based on metadata or ID for MVP
        setUserRole(session.user.user_metadata?.role || "CUSTOMER");
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setUserRole(session.user.user_metadata?.role || "CUSTOMER");
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loginAsCustomer = async () => {
    setLoading(true);
    // Supabase Anonymous Sign-in (or mock for now if anon is disabled)
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.warn("Falling back to mock customer login:", error.message);
      // Fallback if anonymous sign-in is not enabled on the Supabase project yet
      setUser({ id: "mock-customer-123", email: "guest@queueless.in", app_metadata: {}, user_metadata: { role: "CUSTOMER" }, aud: "authenticated", created_at: new Date().toISOString() } as User);
    } else {
      setUser(data.user);
    }
    setUserRole("CUSTOMER");
    setLoading(false);
  };

  const loginAsAdmin = async () => {
    setLoading(true);
    // In production, this would verify Supabase JWT Claims or a `public.users` role column.
    // For MVP, if anon auth fails, mock it.
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      setUser({ id: "mock-admin-456", email: "admin@queueless.in", app_metadata: {}, user_metadata: { role: "ADMIN" }, aud: "authenticated", created_at: new Date().toISOString() } as User);
    } else {
       await supabase.auth.updateUser({ data: { role: "ADMIN" } });
    }
    setUserRole("ADMIN");
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, userRole, loading, loginAsCustomer, loginAsAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}
