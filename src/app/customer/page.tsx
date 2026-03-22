"use client";

import { useState, Suspense, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import FastAuth from "@/components/FastAuth";
import { useRouter } from "next/navigation";

function CustomerAppContent() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const savedOrg = localStorage.getItem("active_org");
    const savedToken = localStorage.getItem("active_token");
    if (savedOrg && savedToken) {
      router.push(`/customer/queue/${savedOrg}/${savedToken}`);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsChecking(false); // Stop checking and show Auth UI
    }
  }, [router]);

  const handleAuthSuccess = (_userId: string) => {
     // After fast auth, route to their personalized dashboard
     router.push(`/customer/dashboard`);
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-black font-sans flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="font-bold tracking-widest uppercase text-slate-500 text-sm">Verifying Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black font-sans flex flex-col items-center justify-center p-6 relative">
      <div className="absolute top-8 left-8">
        <button onClick={() => router.push('/')} className="w-10 h-10 bg-white dark:bg-slate-900 shadow-md border border-slate-200 dark:border-slate-800 rounded-full flex items-center justify-center text-slate-900 dark:text-white hover:scale-105 transition-transform">
          <ArrowLeft size={20} />
        </button>
      </div>
      <div className="w-full max-w-md">
         <FastAuth onSuccess={handleAuthSuccess} />
      </div>
    </div>
  );
}

export default function CustomerApp() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">Loading queue info...</div>}>
      <CustomerAppContent />
    </Suspense>
  );
}
