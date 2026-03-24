"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Check, ArrowRight, MapPin, Phone, User, Globe } from "lucide-react";

const supabase = createClient();

const CITIES = [
  "Delhi", "Mumbai", "Bengaluru", "Chennai", "Hyderabad", 
  "Pune", "Kolkata", "Chandigarh", "Ludhiana", "Phagwara", "Other"
];

const LANGUAGES = [
  { label: "English", value: "English" },
  { label: "हिंदी", value: "Hindi" },
  { label: "ਪੰਜਾਬੀ", value: "Punjabi" },
  { label: "தமிழ்", value: "Tamil" },
  { label: "తెలుగు", value: "Telugu" },
  { label: "मराठी", value: "Marathi" },
  { label: "বাংলা", value: "Bengali" }
];

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    fullName: "",
    phone: "",
    city: "Delhi",
    language: "English"
  });

  const [step, setStep] = useState(1);

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const { data: profile } = await (supabase.from('user_profiles') as any).select('*').eq('id', user.id).maybeSingle();
      if (profile?.profile_completed) {
        router.push("/home");
      }
    }
    checkUser();
  }, [router]);

  const handleUpdate = async (isSkipping = false) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");

      const updates: any = isSkipping ? {
        profile_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } : {
        full_name: userData.fullName,
        phone: userData.phone || null,
        city: userData.city,
        preferred_language: userData.language,
        profile_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await (supabase.from('user_profiles') as any).update(updates).eq('id', user.id);
      
      toast.success("Profile updated successfully!");
      router.push("/home");
    } catch (err) {
      toast.error("Error updating profile");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-6 font-sans">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-surface/80 bg-opacity-95 rounded-[2.5rem] border border-white/5 p-8 sm:p-12 shadow-2xl relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/20 text-primary">
            <span className="text-3xl">👋</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2 italic">Almost there!</h1>
          <p className="text-slate-400 font-medium">Help us personalize your QueueLess experience</p>
        </div>

        <div className="space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <label htmlFor="fullName" className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
              <User size={12} className="text-primary" /> Full Name <span className="text-primary">*</span>
            </label>
            <input 
              id="fullName"
              type="text"
              value={userData.fullName}
              onChange={(e) => setUserData({ ...userData, fullName: e.target.value })}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-6 py-4 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-zinc-700 focus:outline-none focus:border-primary transition-all font-bold"
              required
            />
            <p className="text-[10px] text-slate-500 ml-1 italic">(Required — for your token)</p>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <label htmlFor="phoneInput" className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
              <Phone size={12} className="text-primary" /> Phone Number
            </label>
            <input 
              id="phoneInput"
              type="tel"
              value={userData.phone}
              onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
              placeholder="+91 98765 43210"
              className="w-full px-6 py-4 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-zinc-700 focus:outline-none focus:border-primary transition-all font-bold"
            />
            <p className="text-[10px] text-slate-500 ml-1 italic">(For queue alerts)</p>
          </div>

          {/* City */}
          <div className="space-y-2">
            <label htmlFor="citySelect" className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
              <MapPin size={12} className="text-primary" /> Your City
            </label>
            <select id="citySelect" 
              value={userData.city}
              onChange={(e) => setUserData({ ...userData, city: e.target.value })}
              className="w-full px-6 py-4 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-primary transition-all font-bold appearance-none cursor-pointer"
            >
              {CITIES.map(city => (
                <option key={city} value={city} className="bg-slate-900">{city}</option>
              ))}
            </select>
          </div>

          {/* Preferred Language */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
              <Globe size={12} className="text-primary" /> Preferred Language
            </label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.value}
                  onClick={() => setUserData({ ...userData, language: lang.value })}
                  className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${userData.language === lang.value ? 'bg-primary border-primary text-black' : 'bg-white/5 border-white/10 text-white hover:border-white/20'}`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-6 space-y-4">
            <button 
              onClick={() => handleUpdate(false)}
              disabled={loading || !userData.fullName}
              className="w-full py-5 rounded-2xl bg-gradient-to-r from-primary to-blue-400 text-black font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-primary/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? "Completing..." : "Continue to QueueLess"} <ArrowRight size={18} />
            </button>
            <button 
              onClick={() => handleUpdate(true)}
              disabled={loading}
              className="w-full text-center text-slate-500 font-bold text-xs hover:text-white transition-colors"
            >
              Skip for now
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
