/**
 * Feature Gating Logic for QueueLess India
 * Respects FEATURES.IS_TESTING_PHASE — when true, all features are unlocked.
 */

import { FEATURES } from "./features";

export const PLAN_LIMITS = {
  free: {
    dailyTokens: 50,
    counters: 1,
    smsEnabled: false,
    analyticsEnabled: false,
    aiPredictions: false,
  },
  growth: {
    dailyTokens: Infinity,
    counters: 5,
    smsEnabled: true,
    analyticsEnabled: true,
    aiPredictions: true,
  },
  enterprise: {
    dailyTokens: Infinity,
    counters: Infinity,
    smsEnabled: true,
    analyticsEnabled: true,
    aiPredictions: true,
  },
};

export type PlanType = keyof typeof PLAN_LIMITS;

export function checkLimit(
  plan: PlanType,
  feature: keyof typeof PLAN_LIMITS["free"],
): boolean {
  // During testing phase, ALL features are unlocked
  if (FEATURES.IS_TESTING_PHASE) return true;

  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
  const value = limits[feature];

  if (typeof value === "boolean") {
    return value;
  }

  return !!value;
}

export function isFeatureLocked(
  plan: PlanType,
  feature: keyof typeof PLAN_LIMITS["free"],
): boolean {
  return !checkLimit(plan, feature);
}
