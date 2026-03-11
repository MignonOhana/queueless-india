/**
 * UPI Payment Integration Utility
 *
 * India-first: 80%+ of digital payments are UPI.
 * This utility generates UPI deep links and handles Razorpay UPI flows.
 *
 * Usage:
 *   const upiUrl = generateUPILink({ payeeVpa: 'business@upi', amount: 50, note: 'FastPass' });
 *   window.location.href = upiUrl; // Opens UPI app on mobile
 */

import { FEATURES } from "@/lib/features";

export interface UPIPaymentParams {
  payeeVpa: string; // e.g., "queueless@ybl"
  payeeName: string; // e.g., "QueueLess India"
  amount: number; // in INR
  transactionNote: string; // e.g., "FastPass - Clinic ABC"
  transactionRef?: string; // unique ref ID
  currency?: string; // default "INR"
}

/**
 * Generate a UPI deep link (works with all Indian UPI apps)
 * Google Pay, PhonePe, Paytm, BHIM, etc.
 */
export function generateUPILink(params: UPIPaymentParams): string {
  const {
    payeeVpa,
    payeeName,
    amount,
    transactionNote,
    transactionRef = `QL${Date.now()}`,
    currency = "INR",
  } = params;

  const upiParams = new URLSearchParams({
    pa: payeeVpa,
    pn: payeeName,
    am: amount.toFixed(2),
    tn: transactionNote,
    tr: transactionRef,
    cu: currency,
  });

  return `upi://pay?${upiParams.toString()}`;
}

/**
 * Check if UPI payment is available (mobile device + payments enabled)
 */
export function isUPIAvailable(): boolean {
  if (!FEATURES.PAYMENTS_ENABLED) return false;
  // UPI deep links only work on mobile devices
  if (typeof window === "undefined") return false;
  return /Android|iPhone|iPad/i.test(navigator.userAgent);
}

/**
 * Initiate UPI payment via deep link
 * Falls back to Razorpay checkout if deep link fails
 */
export function initiateUPIPayment(params: UPIPaymentParams): void {
  const upiUrl = generateUPILink(params);

  if (isUPIAvailable()) {
    // Try UPI deep link first (native UPI app)
    window.location.href = upiUrl;
  } else {
    // Fallback: show Razorpay with UPI preferred
    console.log(
      "UPI deep link not available, use Razorpay checkout with UPI method preferred",
    );
  }
}

/**
 * Razorpay options with UPI as preferred method (India-first)
 */
export function getRazorpayOptions(params: {
  orderId: string;
  amount: number; // in paise (INR × 100)
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  description: string;
  onSuccess: (paymentId: string) => void;
  onError: (error: any) => void;
}) {
  return {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    amount: params.amount,
    currency: "INR",
    name: "QueueLess India",
    description: params.description,
    order_id: params.orderId,
    prefill: {
      name: params.customerName,
      email: params.customerEmail || "",
      contact: params.customerPhone || "",
      // Prioritize UPI method
      method: "upi",
    },
    config: {
      display: {
        // Show UPI first, then other methods
        sequence: ["block.upi", "block.other"],
        preferences: {
          show_default_blocks: true,
        },
        blocks: {
          upi: {
            name: "UPI (Recommended)",
            instruments: [
              { method: "upi", flows: ["qr", "collect", "intent"] },
            ],
          },
          other: {
            name: "Other Methods",
            instruments: [
              { method: "card" },
              { method: "netbanking" },
              { method: "wallet" },
            ],
          },
        },
      },
    },
    theme: {
      color: "#00F5A0",
      backdrop_color: "#0A0A0F",
    },
    handler: (response: any) => {
      params.onSuccess(response.razorpay_payment_id);
    },
    modal: {
      ondismiss: () => {
        params.onError(new Error("Payment cancelled"));
      },
    },
  };
}
