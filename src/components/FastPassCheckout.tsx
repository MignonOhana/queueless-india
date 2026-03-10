'use client';

import { useState, useEffect } from 'react';
import { Zap, Loader2, AlertCircle } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface FastPassCheckoutProps {
  businessId: string;
  businessName: string;
  amount: number;
  tokenData: any;
  onSuccess: (data: { tokenId: string; tokenNumber: string }) => void;
  onError: (error: string) => void;
  isLoading?: boolean;
}

export default function FastPassCheckout({
  businessId,
  businessName,
  amount,
  tokenData,
  onSuccess,
  onError,
  isLoading: externalLoading = false
}: FastPassCheckoutProps) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load Razorpay Script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // 1. Create Order
      const orderResp = await fetch('/api/create-fastpass-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, businessId, businessName }),
      });
      
      const orderData = await orderResp.json();
      if (orderData.error) throw new Error(orderData.error);

      // 2. Open Razorpay Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Public key
        amount: orderData.amount,
        currency: orderData.currency,
        name: "QueueLess India",
        description: `Fast Pass for ${businessName}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            // 3. Verify Payment
            setLoading(true);
            const verifyResp = await fetch('/api/verify-fastpass-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                tokenData: { ...tokenData, amount }
              }),
            });
            
            const verifyData = await verifyResp.json();
            if (verifyData.error) throw new Error(verifyData.error);
            
            onSuccess(verifyData);
          } catch (err: any) {
            onError(err.message || 'Payment verification failed');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: tokenData.customerName,
          contact: tokenData.customerPhone,
        },
        theme: {
          color: "#00F5A0",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        onError(response.error.description || 'Payment failed');
      });
      rzp.open();

    } catch (err: any) {
      onError(err.message || 'Failed to initialize payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading || externalLoading}
      className="flex-1 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-black py-4 rounded-[1.5rem] shadow-xl hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-center gap-1 group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
      <div className="flex items-center gap-2 relative z-10">
        <Zap size={18} className="fill-current animate-pulse" />
        <span className="text-lg">Fast Pass ₹{amount}</span>
      </div>
      <span className="text-[10px] uppercase tracking-tighter opacity-80 relative z-10">Jump to Front of Queue</span>
      {(loading || externalLoading) && (
        <div className="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm flex items-center justify-center z-20">
          <Loader2 size={24} className="animate-spin text-white" />
        </div>
      )}
    </button>
  );
}
