/**
 * Feature Flags for QueueLess India
 * During the testing/beta phase, all features are free.
 * Set IS_TESTING_PHASE to false when launching paid plans.
 */

export const FEATURES = {
  // Master toggle: set to false when Razorpay is configured and you want to enable paid plans
  IS_TESTING_PHASE: true,

  // Will be enabled when Razorpay is properly configured
  PAYMENTS_ENABLED: process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === "true",

  // Plan-based feature gating (bypassed during testing)
  canUseFastPass: (plan: string) => {
    if (FEATURES.IS_TESTING_PHASE) return false; // FastPass needs payment infra
    return plan === "professional" || plan === "enterprise";
  },

  canUseAdvanceBooking: (plan: string) => {
    if (FEATURES.IS_TESTING_PHASE) return true; // FREE during testing
    return plan !== "free";
  },

  canUseAI: (_plan: string) => {
    if (FEATURES.IS_TESTING_PHASE) return true; // FREE during testing
    return true; // AI is available on all plans
  },

  canUseWhatsApp: (plan: string) => {
    if (FEATURES.IS_TESTING_PHASE) return true;
    return plan === "professional" || plan === "enterprise";
  },

  canUseSMS: (plan: string) => {
    if (FEATURES.IS_TESTING_PHASE) return true;
    return plan === "professional" || plan === "enterprise";
  },

  canUseAnalytics: (plan: string) => {
    if (FEATURES.IS_TESTING_PHASE) return true;
    return plan !== "free";
  },

  maxDailyTokens: (plan: string) => {
    if (FEATURES.IS_TESTING_PHASE) return Infinity; // Unlimited during testing
    return {
      free: 50,
      growth: Infinity,
      professional: Infinity,
      enterprise: Infinity,
    }[plan] || 50;
  },

  maxCounters: (plan: string) => {
    if (FEATURES.IS_TESTING_PHASE) return 10; // Generous during testing
    return {
      free: 1,
      growth: 5,
      professional: 10,
      enterprise: Infinity,
    }[plan] || 1;
  },
};
