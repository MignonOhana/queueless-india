"use client";

import { useState, useEffect, useCallback } from "react";

const SESSION_KEY = "queueless_guest_sessions";
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface GuestVisit {
  businessId: string;
  name: string;
  phone: string;
  activeTokenId: string | null;
  activeTokenNumber: string | null;
  timestamp: number;
}

interface GuestSessionStore {
  [businessId: string]: GuestVisit;
}

function readStore(): GuestSessionStore {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeStore(store: GuestSessionStore) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(store));
}

function pruneExpired(store: GuestSessionStore): GuestSessionStore {
  const now = Date.now();
  return Object.fromEntries(
    Object.entries(store).filter(([, v]) => now - v.timestamp < SESSION_TTL_MS)
  );
}

export function getAllGuestSessions(): GuestVisit[] {
  const store = pruneExpired(readStore());
  return Object.values(store);
}

export function useGuestSession(businessId: string) {
  const [guestVisit, setGuestVisit] = useState<GuestVisit | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Only runs client-side
    const store = pruneExpired(readStore());
    writeStore(store); // persist pruned
    const visit = store[businessId] || null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGuestVisit(visit);
    setIsLoaded(true);
  }, [businessId]);

  const saveGuestSession = useCallback((data: {
    name: string;
    phone: string;
    activeTokenId?: string;
    activeTokenNumber?: string;
  }) => {
    const store = pruneExpired(readStore());
    store[businessId] = {
      businessId,
      name: data.name,
      phone: data.phone,
      activeTokenId: data.activeTokenId || null,
      activeTokenNumber: data.activeTokenNumber || null,
      timestamp: Date.now(),
    };
    writeStore(store);
    setGuestVisit(store[businessId]);
  }, [businessId]);

  const updateToken = useCallback((tokenId: string, tokenNumber: string) => {
    const store = pruneExpired(readStore());
    if (store[businessId]) {
      store[businessId].activeTokenId = tokenId;
      store[businessId].activeTokenNumber = tokenNumber;
      store[businessId].timestamp = Date.now(); // refresh TTL
      writeStore(store);
      setGuestVisit({ ...store[businessId] });
    }
  }, [businessId]);

  const clearSession = useCallback(() => {
    const store = readStore();
    delete store[businessId];
    writeStore(store);
    setGuestVisit(null);
  }, [businessId]);

  // Global helper: get any guest token from any recent visit
  const getAllSessions = useCallback((): GuestVisit[] => {
    const store = pruneExpired(readStore());
    return Object.values(store);
  }, []);

  return {
    guestVisit,
    isLoaded,
    guestName: guestVisit?.name || "",
    guestPhone: guestVisit?.phone || "",
    activeTokenId: guestVisit?.activeTokenId || null,
    activeTokenNumber: guestVisit?.activeTokenNumber || null,
    isReturningGuest: !!guestVisit,
    saveGuestSession,
    updateToken,
    clearSession,
    getAllSessions,
  };
}
