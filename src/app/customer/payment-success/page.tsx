"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { joinQueue } from '@/lib/queueService';
import { useAuth } from '@/context/AuthContext';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");

  const orgId = searchParams.get('org');
  const serviceId = searchParams.get('service');
  const type = searchParams.get('type') || 'fast-pass';
  const prefix = serviceId === 'opd' ? 'OPD' : 'SPL';

  useEffect(() => {
    async function processPriorityToken() {
      if (!orgId || !serviceId) {
        setStatus("error");
        return;
      }

      try {
         // Simulate verification of webhook/session
         await new Promise((resolve) => setTimeout(resolve, 2000));
         
         const userId = user?.uid || "mock-user-" + Date.now();
         
         // In production, the backend webhook handles this.
         // For MVP frontend mockup, we manually mint the token here.
         const result = await joinQueue(
            orgId,
            serviceId,
            prefix,
            userId,
            user?.displayName || "Rahul Sharma (Priority)",
            ""
         );
         
         // Set priority flag for local UI display
         localStorage.setItem("priority_token", result.tokenNumber);
         
         setStatus("success");
         
         // Auto-redirect to the queue page after showing success
         setTimeout(() => {
            router.push(`/customer/queue/${orgId}/${result.tokenNumber}`);
         }, 1500);

      } catch (e) {
         setStatus("error");
      }
    }

    processPriorityToken();
  }, [orgId, serviceId, user, prefix, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] p-8 shadow-xl max-w-sm w-full text-center">
         {status === "processing" && (
           <div className="flex flex-col items-center">
             <Loader2 size={48} className="text-orange-500 animate-spin mb-4" />
             <h2 className="text-xl font-black text-slate-900 mb-2">Verifying Payment...</h2>
             <p className="text-slate-500 font-medium">Generating your priority token</p>
           </div>
         )}
         
         {status === "success" && (
           <div className="flex flex-col items-center">
             <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
               <CheckCircle2 size={40} />
             </div>
             <h2 className="text-xl font-black text-slate-900 mb-2">Payment Successful!</h2>
             <p className="text-slate-500 font-medium mb-6">You are now in the Priority Fast Pass queue.</p>
           </div>
         )}
         
         {status === "error" && (
           <div className="flex flex-col items-center">
             <h2 className="text-xl font-black text-red-500 mb-2">Payment Verification Failed</h2>
             <button onClick={() => router.push('/customer')} className="mt-4 bg-slate-900 text-white px-6 py-2 rounded-xl">Return to Queue</button>
           </div>
         )}
      </div>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
       <PaymentSuccessContent />
    </Suspense>
  )
}
