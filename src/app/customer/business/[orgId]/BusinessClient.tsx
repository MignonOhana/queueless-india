"use client";

import { use, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, MapPin, Star, Phone, Globe, ChevronLeft, ArrowRight, Activity, CalendarClock, Zap, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { joinQueue } from "@/lib/queueService";
import { supabase } from "@/lib/supabaseClient";
import { useRazorpay, RazorpayOrderOptions } from "react-razorpay";

export default function BusinessProfile({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const orgId = resolvedParams.orgId;
  const { user, loginAsCustomer } = useAuth();
  const { error, isLoading, Razorpay } = useRazorpay();

  const [isJoining, setIsJoining] = useState(false);
  const [showFastPass, setShowFastPass] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Live Business Data
  const [business, setBusiness] = useState<any>(null);

  useEffect(() => {
    const fetchBiz = async () => {
      const { data, error } = await supabase.from("businesses").select("*").eq("id", orgId).maybeSingle();
      if (!error && data) {
        setBusiness({
          id: data.id,
          name: data.name,
          category: data.category,
          rating: 4.8,
          reviews: 1240,
          address: data.location,
          distance: "1.2 km", // Mock
          openUntil: data.opHours?.split("-")[1] || "10:00 PM",
          liveWait: data.serviceMins || 15,
          queueLength: Math.floor(Math.random() * 8) + 1, // Mock
          fastPassPrice: data.fastPassPrice || 50,
          services: [
            { id: "opd", prefix: data.category === "Hospital" ? "OPD" : "TKN", name: data.category === "Hospital" ? "General Consultation" : "Standard Queue" },
            { id: "specialist", prefix: "SPL", name: data.category === "Hospital" ? "Specialist Visit" : "Priority Queue" },
          ]
        });
      } else {
        // Fallback for mock records
        setBusiness({
          id: orgId,
          name: orgId === "city-hospital" ? "City Hospital" : orgId === "metro-bank" ? "Metro Bank Branch" : "QueueLess Partner",
          category: "hospitals",
          rating: 4.8,
          reviews: 1240,
          address: "Andheri East, Mumbai",
          distance: "1.2 km",
          openUntil: "10:00 PM",
          liveWait: 15,
          queueLength: 8,
          fastPassPrice: 50, // ₹50
          services: [
            { id: "opd", prefix: "OPD", name: "General Consultation" },
            { id: "specialist", prefix: "SPL", name: "Specialist Visit" },
          ]
        });
      }
    };
    fetchBiz();
  }, [orgId]);

  const handleJoinQueue = async (serviceId: string, prefix: string, isFastPass: boolean = false) => {
    // 1. INTEGRITY GUARD: Check for existing token
    const existingToken = localStorage.getItem("active_token");
    if (existingToken) {
       alert("You already hold an active token in a queue. Please finish or cancel it before joining a new one.");
       return;
    }

    // 2. GEO-FENCE CHECK (Mocked 5km limit via distance string parsing)
    if (isFastPass && business.distance.includes("km")) {
       const distValue = parseFloat(business.distance);
       if (distValue > 5) {
          const confirmJoin = window.confirm(`You are ${business.distance} away from this location. Are you sure you can arrive within the estimated wait window? Fast Pass fees are non-refundable for late arrivals.`);
          if (!confirmJoin) return;
       }
    }

    setIsJoining(true);
    if (!user) {
      await loginAsCustomer();
    }
    
    if (isFastPass) {
       // Call the checkout api (Razorpay / Mock)
       try {
         const res = await fetch('/api/checkout', {
           method: 'POST',
           body: JSON.stringify({
             orgId,
             serviceId,
             userId: user?.id || "mock-user-" + Date.now(),
             amount: business.fastPassPrice,
             type: 'fast-pass'
           })
         });
         const data = await res.json();
         
         if (data.success) {
           if (data.isMock) {
             // Fallback to demo mock payment success screen
             router.push(data.url);
           } else {
             // Genuine Razorpay Checkout
             setIsJoining(true); // Keep loading state true through modal
             
             const options: RazorpayOrderOptions = {
               key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
               amount: data.amount,
               currency: data.currency,
               name: business.name,
               description: "Fast Pass Priority Queue",
               order_id: data.orderId,
               handler: async function (response: any) {
                 // Payment succeeded, finalize Queue Join
                 const result = await joinQueue(
                   orgId as string, 
                   serviceId, 
                   prefix, 
                   user?.id || "mock-user-" + Date.now(), 
                   "Rahul Sharma (Guest)",
                   ""
                 );
                 
                 // Dispatch SMS
                 fetch('/api/notify', {
                   method: 'POST',
                   headers: { 'Content-Type': 'application/json' },
                   body: JSON.stringify({
                     tokenNumber: result.tokenNumber,
                     phoneNumber: "+919876543210", 
                     orgName: business.name,
                     event: 'JOINED',
                     estimatedWaitMins: result.estimatedWaitMins
                   })
                 }).catch(e => console.error(e));
                 
                 router.push(`/customer/queue/${orgId}/${result.tokenNumber}`);
               },
               prefill: {
                 name: "Rahul Sharma",
                 email: "rahul@example.com",
                 contact: "9876543210",
               },
               theme: {
                 color: "#4F46E5",
               },
             };
             
             const paymentObject = new Razorpay(options);
             
             paymentObject.on("payment.failed", function(response: any) {
               console.error(response.error.description);
               setIsJoining(false);
               alert("Payment failed: " + response.error.description);
             });
             
             paymentObject.open();
           }
         } else {
           setIsJoining(false);
           alert("Checkout failed. Please try again.");
         }
       } catch(e) {
         console.error(e);
         setIsJoining(false);
       }
       return; // Stop here, Razorpay handler manages token creation
    }

    // Standard Free Queue Join
    const result = await joinQueue(
      orgId, 
      serviceId, 
      prefix, 
      user?.id || "mock-user-" + Date.now(), 
      "Rahul Sharma (Guest)",
      ""
    );
    
    // Dispatch Twilio SMS Notification
    try {
      fetch('/api/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokenNumber: result.tokenNumber,
          phoneNumber: "+919876543210", // Mock recipient for Demo purposes
          orgName: business.name,
          event: 'JOINED',
          estimatedWaitMins: result.estimatedWaitMins
        })
      });
    } catch (e) {
      console.error("SMS notification dispatch failed during join:", e);
    }
    
    router.push(`/customer/queue/${orgId}/${result.tokenNumber}`);
  };

  if (!business) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-black font-sans flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black font-sans pb-24 relative">
      
      {/* Cover Image & Header */}
      <div className="relative h-64 bg-slate-200 dark:bg-slate-800">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center brightness-50 dark:brightness-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-black to-transparent" />
        
        <header className="absolute top-0 inset-x-0 p-4 pt-[calc(env(safe-area-inset-top)+1rem)] flex justify-between items-center z-10">
           <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition">
             <ChevronLeft size={24} />
           </button>
           <div className="flex gap-2">
              <button className="p-2 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition shadow-sm">
                 <Star size={18} />
              </button>
           </div>
        </header>

        {/* Business Title absolute pinned to bottom of cover */}
        <div className="absolute bottom-6 px-6 w-full">
           <div className="flex items-center gap-2 mb-2">
             <span className="bg-indigo-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md shadow-sm">Verified</span>
             <span className="flex items-center gap-1 text-sm font-bold text-amber-400 drop-shadow-md"><Star size={14} className="fill-amber-400"/> {business.rating} ({business.reviews})</span>
           </div>
           <h1 className="text-3xl font-black text-slate-900 dark:text-white drop-shadow-sm">{business.name}</h1>
           <p className="text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1.5 mt-1 text-sm drop-shadow-sm"><MapPin size={14}/> {business.address} <span className="text-slate-400">• {business.distance} away</span></p>
           
           {/* Trust Signals */}
           <div className="flex items-center gap-4 mt-3">
              <div className="bg-white/90 dark:bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 dark:border-white/10 flex items-center gap-2 shadow-sm">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Trusted Partner</span>
              </div>
              <div className="text-xs font-bold text-white drop-shadow-md">
                 <span className="text-amber-400">12,430+</span> Visitors Served
              </div>
           </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 space-y-6 pt-4">
        
        {/* Live Status Card */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-800 flex items-center justify-between">
           <div>
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold mb-1">
                 <Activity size={18} className="animate-pulse" /> Live Status
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{business.liveWait} <span className="text-sm font-semibold text-slate-500">mins wait</span></h3>
           </div>
           <div className="text-right">
              <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">In Queue</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{business.queueLength} <span className="text-sm font-semibold text-slate-500">ppl</span></div>
           </div>
        </div>

        {/* Action Buttons grid */}
        <div className="grid grid-cols-2 gap-3">
           <button 
             onClick={() => setShowBookingModal(true)}
             className="bg-white dark:bg-slate-900 rounded-[1.5rem] p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center gap-2 hover:border-indigo-400 active:scale-95 transition-all text-slate-700 dark:text-slate-300"
           >
              <CalendarClock size={24} className="text-indigo-500" />
              <span className="font-bold text-xs uppercase tracking-wide">Book Slot</span>
           </button>
           <button 
             onClick={() => setShowFastPass(true)}
             className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-[1.5rem] p-4 shadow-lg shadow-orange-500/20 flex flex-col items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all text-white relative overflow-hidden group"
           >
              <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300" />
              <Zap size={24} className="fill-white" />
              <span className="font-bold text-xs uppercase tracking-wide">Buy Fast Pass</span>
           </button>
        </div>

        {/* AI Best Time to Visit - Viral Feature */}
        <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-4 shadow-inner flex items-start gap-4 mb-2">
           <div className="p-2 bg-indigo-500 text-white rounded-xl shadow-md shrink-0">
              <Sparkles size={20} />
           </div>
           <div>
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                 Best Time to Visit <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded">AI Prediction</span>
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 font-medium leading-snug">
                Based on historical data for {business.name}, we predict the shortest wait will be at <strong className="text-indigo-600 dark:text-indigo-400 font-bold">4:00 PM</strong> with a <strong className="text-indigo-600 dark:text-indigo-400 font-bold">~6 minute</strong> wait time.
              </p>
           </div>
        </div>

        {/* Join Queue List */}
        <div>
           <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-lg">
             {business.queueLength === 0 ? "Walk in Immediately!" : "Join Queue Now"}
           </h3>
           
           {business.queueLength === 0 && (
             <div className="mb-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-4 rounded-2xl flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                 <Activity size={20} />
               </div>
               <div>
                 <p className="font-bold text-emerald-800 dark:text-emerald-400 text-sm">No Waiting Required</p>
                 <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-0.5">The queue is currently empty. Join now to secure immediate service upon arrival.</p>
               </div>
             </div>
           )}

           <div className="space-y-3">
             {business.services.map((svc: any) => (
               <button 
                 key={svc.id}
                 disabled={isJoining}
                 onClick={() => handleJoinQueue(svc.id, svc.prefix, false)}
                 className="w-full bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-sm active:scale-[0.98] transition-all group hover:border-indigo-400"
               >
                  <div className="text-left">
                     <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{svc.name}</h4>
                     <p className="text-xs font-medium text-slate-500 mt-0.5">Free • Est. {business.liveWait}m wait</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                     <ArrowRight size={18} />
                  </div>
               </button>
             ))}
           </div>
         </div>

         {/* Ratings & Testimonials */}
         <div className="pt-4">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-lg">Customer Reviews</h3>
            
            <div className="flex items-center gap-4 mb-6 relative z-0">
               <div className="text-center">
                  <span className="text-4xl font-black text-slate-900 dark:text-white block">{business.rating}</span>
                  <div className="flex items-center justify-center text-amber-400 my-1">
                     <Star size={14} className="fill-amber-400" />
                     <Star size={14} className="fill-amber-400" />
                     <Star size={14} className="fill-amber-400" />
                     <Star size={14} className="fill-amber-400" />
                     <Star size={14} className="fill-amber-400" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{business.reviews} Ratings</span>
               </div>
               
               <div className="flex-1 space-y-1.5 border-l border-slate-200 dark:border-slate-800 pl-4">
                  {[5, 4, 3, 2, 1].map((star, idx) => (
                    <div key={star} className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                       <span className="w-2">{star}</span>
                       <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-400 rounded-full" 
                            style={{ width: idx === 0 ? '80%' : idx === 1 ? '15%' : '0%' }}
                          />
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="space-y-4">
               {/* Review 1 */}
               <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 relative z-0">
                  <div className="flex justify-between items-start mb-2">
                     <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase">
                           AK
                        </div>
                        <div>
                           <p className="font-bold text-sm text-slate-900 dark:text-white leading-none">Amit Kumar</p>
                           <p className="text-[10px] text-slate-500 mt-1">2 days ago</p>
                        </div>
                     </div>
                     <div className="flex text-amber-400"><Star size={12} className="fill-amber-400" /><Star size={12} className="fill-amber-400" /><Star size={12} className="fill-amber-400" /><Star size={12} className="fill-amber-400" /><Star size={12} className="fill-amber-400" /></div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">QueueLess saved me 2 hours of waiting in the lobby. I just booked from home and arrived 5 mins before my turn!</p>
               </div>
               
               {/* Review 2 */}
               <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 relative z-0">
    router.push(`/customer/queue/${orgId}/${result.tokenNumber}`);
  };

  if (!business) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-black font-sans flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black font-sans pb-24 relative">
      
      {/* Cover Image & Header */}
      <div className="relative h-64 bg-slate-200 dark:bg-slate-800">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center brightness-50 dark:brightness-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-black to-transparent" />
        
        <header className="absolute top-0 inset-x-0 p-4 pt-[calc(env(safe-area-inset-top)+1rem)] flex justify-between items-center z-10">
           <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition">
             <ChevronLeft size={24} />
           </button>
           <div className="flex gap-2">
              <button className="p-2 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition shadow-sm">
                 <Star size={18} />
              </button>
           </div>
        </header>

        {/* Business Title absolute pinned to bottom of cover */}
        <div className="absolute bottom-6 px-6 w-full">
           <div className="flex items-center gap-2 mb-2">
             <span className="bg-indigo-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md shadow-sm">Verified</span>
             <span className="flex items-center gap-1 text-sm font-bold text-amber-400 drop-shadow-md"><Star size={14} className="fill-amber-400"/> {business.rating} ({business.reviews})</span>
           </div>
           <h1 className="text-3xl font-black text-slate-900 dark:text-white drop-shadow-sm">{business.name}</h1>
           <p className="text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1.5 mt-1 text-sm drop-shadow-sm"><MapPin size={14}/> {business.address} <span className="text-slate-400">• {business.distance} away</span></p>
           
           {/* Trust Signals */}
           <div className="flex items-center gap-4 mt-3">
              <div className="bg-white/90 dark:bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 dark:border-white/10 flex items-center gap-2 shadow-sm">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Trusted Partner</span>
              </div>
              <div className="text-xs font-bold text-white drop-shadow-md">
                 <span className="text-amber-400">12,430+</span> Visitors Served
              </div>
           </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 space-y-6 pt-4">
        
        {/* Live Status Card */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-800 flex items-center justify-between">
           <div>
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold mb-1">
                 <Activity size={18} className="animate-pulse" /> Live Status
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{business.liveWait} <span className="text-sm font-semibold text-slate-500">mins wait</span></h3>
           </div>
           <div className="text-right">
              <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">In Queue</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{business.queueLength} <span className="text-sm font-semibold text-slate-500">ppl</span></div>
           </div>
        </div>

        {/* Action Buttons grid */}
        <div className="grid grid-cols-2 gap-3">
           <button 
             onClick={() => setShowBookingModal(true)}
             className="bg-white dark:bg-slate-900 rounded-[1.5rem] p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center gap-2 hover:border-indigo-400 active:scale-95 transition-all text-slate-700 dark:text-slate-300"
           >
              <CalendarClock size={24} className="text-indigo-500" />
              <span className="font-bold text-xs uppercase tracking-wide">Book Slot</span>
           </button>
           <button 
             onClick={() => setShowFastPass(true)}
             className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-[1.5rem] p-4 shadow-lg shadow-orange-500/20 flex flex-col items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all text-white relative overflow-hidden group"
           >
              <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300" />
              <Zap size={24} className="fill-white" />
              <span className="font-bold text-xs uppercase tracking-wide">Buy Fast Pass</span>
           </button>
        </div>

        {/* AI Best Time to Visit - Viral Feature */}
        <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-4 shadow-inner flex items-start gap-4 mb-2">
           <div className="p-2 bg-indigo-500 text-white rounded-xl shadow-md shrink-0">
              <Sparkles size={20} />
           </div>
           <div>
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                 Best Time to Visit <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded">AI Prediction</span>
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 font-medium leading-snug">
                Based on historical data for {business.name}, we predict the shortest wait will be at <strong className="text-indigo-600 dark:text-indigo-400 font-bold">4:00 PM</strong> with a <strong className="text-indigo-600 dark:text-indigo-400 font-bold">~6 minute</strong> wait time.
              </p>
           </div>
        </div>

        {/* Join Queue List */}
        <div>
           <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-lg">
             {business.queueLength === 0 ? "Walk in Immediately!" : "Join Queue Now"}
           </h3>
           
           {business.queueLength === 0 && (
             <div className="mb-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-4 rounded-2xl flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                 <Activity size={20} />
               </div>
               <div>
                 <p className="font-bold text-emerald-800 dark:text-emerald-400 text-sm">No Waiting Required</p>
                 <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-0.5">The queue is currently empty. Join now to secure immediate service upon arrival.</p>
               </div>
             </div>
           )}

           <div className="space-y-3">
             {business.services.map((svc: any) => (
               <button 
                 key={svc.id}
                 disabled={isJoining}
                 onClick={() => handleJoinQueue(svc.id, svc.prefix, false)}
                 className="w-full bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-sm active:scale-[0.98] transition-all group hover:border-indigo-400"
               >
                  <div className="text-left">
                     <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{svc.name}</h4>
                     <p className="text-xs font-medium text-slate-500 mt-0.5">Free • Est. {business.liveWait}m wait</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                     <ArrowRight size={18} />
                  </div>
               </button>
             ))}
           </div>
         </div>

         {/* Ratings & Testimonials */}
         <div className="pt-4">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-lg">Customer Reviews</h3>
            
            <div className="flex items-center gap-4 mb-6 relative z-0">
               <div className="text-center">
                  <span className="text-4xl font-black text-slate-900 dark:text-white block">{business.rating}</span>
                  <div className="flex items-center justify-center text-amber-400 my-1">
                     <Star size={14} className="fill-amber-400" />
                     <Star size={14} className="fill-amber-400" />
                     <Star size={14} className="fill-amber-400" />
                     <Star size={14} className="fill-amber-400" />
                     <Star size={14} className="fill-amber-400" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{business.reviews} Ratings</span>
               </div>
               
               <div className="flex-1 space-y-1.5 border-l border-slate-200 dark:border-slate-800 pl-4">
                  {[5, 4, 3, 2, 1].map((star, idx) => (
                    <div key={star} className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                       <span className="w-2">{star}</span>
                       <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-400 rounded-full" 
                            style={{ width: idx === 0 ? '80%' : idx === 1 ? '15%' : '0%' }}
                          />
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="space-y-4">
               {/* Review 1 */}
               <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 relative z-0">
                  <div className="flex justify-between items-start mb-2">
                     <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase">
                           AK
                        </div>
                        <div>
                           <p className="font-bold text-sm text-slate-900 dark:text-white leading-none">Amit Kumar</p>
                           <p className="text-[10px] text-slate-500 mt-1">2 days ago</p>
                        </div>
                     </div>
                     <div className="flex text-amber-400"><Star size={12} className="fill-amber-400" /><Star size={12} className="fill-amber-400" /><Star size={12} className="fill-amber-400" /><Star size={12} className="fill-amber-400" /><Star size={12} className="fill-amber-400" /></div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">QueueLess saved me 2 hours of waiting in the lobby. I just booked from home and arrived 5 mins before my turn!</p>
               </div>
               
               {/* Review 2 */}
               <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 relative z-0">
                  <div className="flex justify-between items-start mb-2">
                     <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs uppercase">
                           PP
                        </div>
                        <div>
                           <p className="font-bold text-sm text-slate-900 dark:text-white leading-none">Priya Patel</p>
                           <p className="text-[10px] text-slate-500 mt-1">1 week ago</p>
                        </div>
                     </div>
                     <div className="flex text-amber-400"><Star size={12} className="fill-amber-400" /><Star size={12} className="fill-amber-400" /><Star size={12} className="fill-amber-400" /><Star size={12} className="fill-amber-400" /><Star size={12} className="fill-slate-300 dark:fill-slate-700 text-slate-300 dark:text-slate-700" /></div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Very easy to use, even my parents understand the live tracking. Fast pass is totally worth the price during rush hour.</p>
               </div>
            </div>
         </div>
      </div>
                     
      {/* Fast Pass Modal (Simulated logic placeholder) */}
      <AnimatePresence>
         {showFastPass && (
            <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
               <motion.div 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: 1 }} 
                 exit={{ opacity: 0 }} 
                 onClick={() => setShowFastPass(false)}
                 className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
               />
               <motion.div 
                 initial={{ y: "100%" }}
                 animate={{ y: 0 }}
                 exit={{ y: "100%" }}
                 transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                 className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-sm relative z-10 p-6 shadow-2xl overflow-hidden"
               >
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
                  <div className="w-16 h-16 rounded-full bg-orange-50 dark:bg-orange-500/20 text-orange-500 flex items-center justify-center mx-auto mb-6 shadow-inner">
                     <Zap size={32} className="fill-orange-500" />
                  </div>
                  <h3 className="text-2xl font-black text-center text-slate-900 dark:text-white mb-2">Priority Fast Pass</h3>
                  <p className="text-center text-slate-500 font-medium text-sm mb-6">Skip the regular line. Fast pass holders are called next as soon as the active token finishes.</p>
                  
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 mb-6 border border-slate-200 dark:border-slate-700 font-bold flex justify-between items-center text-lg">
                     <span className="text-slate-900 dark:text-white">Price</span>
                     <span className="text-emerald-600 dark:text-emerald-400">₹{business.fastPassPrice}</span>
                  </div>

                  <div className="space-y-3">
                     <button 
                       disabled={isJoining}
                       onClick={() => handleJoinQueue(business.services[0].id, business.services[0].prefix, true)}
                       className={`w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/30 transition-all flex justify-center items-center ${isJoining ? 'opacity-70 cursor-not-allowed' : 'hover:brightness-110 active:scale-95'}`}
                     >
                       {isJoining ? (
                         <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                       ) : (
                         "Pay & Join Priority Queue"
                       )}
                     </button>
                     <button 
                       onClick={() => setShowFastPass(false)}
                       className="w-full text-slate-500 font-bold py-4 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                     >
                       Cancel
                     </button>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      <AnimatePresence>
         {/* Advance Booking Modal */}
         {showBookingModal && (
            <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
               <motion.div 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: 1 }} 
                 exit={{ opacity: 0 }} 
                 onClick={() => setShowBookingModal(false)}
                 className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
               />
               <motion.div 
                 initial={{ y: "100%" }}
                 animate={{ y: 0 }}
                 exit={{ y: "100%" }}
                 transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                 className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-sm relative z-10 p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
               >
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
                  
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <CalendarClock size={24} className="text-indigo-500" />
                        Book Slot
                     </h3>
                     <button onClick={() => setShowBookingModal(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <ChevronLeft size={16} className="rotate-180" />
                     </button>
                  </div>

                  <div className="flex-1 overflow-y-auto hide-scrollbar space-y-6 pb-6">
                     {/* Select Department */}
                     <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">1. Select Service</label>
                        <div className="grid grid-cols-2 gap-2">
                           {business.services.map((svc: any) => (
                             <button key={svc.id} className="p-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left bg-slate-50 dark:bg-slate-800">
                                {svc.name}
                             </button>
                           ))}
                        </div>
                     </div>

                     {/* Select Date */}
                     <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">2. Select Date</label>
                        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
                           {Array.from({length: 7}).map((_, i) => {
                             const d = new Date();
                             d.setDate(d.getDate() + i);
                             const isToday = i === 0;
                             const dateStr = d.toISOString().split('T')[0];
                             const dayName = isToday ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' });
                             const dayNum = d.getDate();
                             
                             return (
                               <button key={i} className={`flex-shrink-0 w-16 p-2 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${isToday ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400'}`}>
                                 <span className="text-[10px] font-bold uppercase">{dayName}</span>
                                 <span className="text-lg font-black">{dayNum}</span>
                               </button>
                             );
                           })}
                        </div>
                     </div>

                     {/* Select Time */}
                     <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">3. Select Time</label>
                        <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
                           {/* Mocking generated time slots based on opHours */}
                           {['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'].map((time, i) => (
                             <button key={i} className="py-2.5 px-1 border-2 border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                               {time}
                             </button>
                           ))}
                        </div>
                     </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
                     <button 
                       disabled={isJoining}
                       onClick={async () => {
                          setIsJoining(true);
                          
                          if (!user) {
                            await loginAsCustomer();
                          }
                          
                          try {
                             // Mock Edge Function Call
                             const res = await supabase.functions.invoke('book-slot', {
                               body: {
                                 orgId,
                                 counterId: business.services[0].id, // Mocked selection
                                 userId: user?.id || "mock-user-" + Date.now(),
                                 customerName: "Rahul Sharma",
                                 customerPhone: "",
                                 bookingDate: new Date().toISOString().split('T')[0], // Mocked Selection
                                 timeSlot: "10:30:00" // Mocked Selection
                               }
                             });
                             
                             if (res.error) throw res.error;
                             
                             alert("Booking Confirmed for 10:30 AM!");
                             setShowBookingModal(false);
                          } catch (e: any) {
                             console.error("Booking error", e);
                             alert(e.message || "Failed to book slot.");
                          } finally {
                             setIsJoining(false);
                          }
                       }}
                       className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-xl hover:opacity-90 active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                     >
                       {isJoining ? <Activity size={20} className="animate-spin" /> : "Confirm Booking"}
                     </button>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

    </div>
  );
}
