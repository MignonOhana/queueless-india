"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Mail, Phone, Edit2, Check, X, 
  Ticket, Building2, Clock, History, 
  LogOut, ChevronRight, Star, ArrowLeft
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function CustomerProfilePage() {
  const router = useRouter();
  const { user, userRole } = useAuth();
  
  // Profile State
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: "", email: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Stats State
  const [stats, setStats] = useState({
    tokensCount: 0,
    businessesCount: 0,
    timeSavedMins: 0
  });

  // Tokens State
  const [activeTokens, setActiveTokens] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      if (!isLoading) router.push("/login");
      return;
    }

    const fetchProfileData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // 1. Fetch User Profile via RPC (Safer than direct read)
        const { data: profileData, error: profileErr } = await supabase.rpc('get_my_profile').maybeSingle() as { data: any; error: any };

        if (profileErr) throw profileErr;
        if (profileData) {
          setProfile(profileData);
          setEditForm({ 
            full_name: profileData.full_name || "", 
            email: profileData.email || user.email || "" 
          });
        }

        // 2. Fetch Stats & Activity
        // Get all tokens for this user
        const { data: tokens, error: tokensErr } = await supabase
          .from("tokens")
          .select(`
            *,
            businesses:orgId (name, category)
          `)
          .eq("userId", user.id)
          .order("createdAt", { ascending: false });

        if (tokensErr) throw tokensErr;

        if (tokens) {
          // Calculate Stats
          const servedTokens = tokens.filter(t => t.status === "SERVED");
          const uniqueBusinesses = new Set(tokens.map(t => t.orgId)).size;
          
          setStats({
            tokensCount: tokens.length,
            businessesCount: uniqueBusinesses,
            timeSavedMins: tokens.length * 25 // 25 mins saved per token reference
          });

          // Split Tokens
          setActiveTokens(tokens.filter(t => ["WAITING", "SERVING"].includes(t.status)));
          setRecentActivity(
            tokens
              .filter(t => ["SERVED", "CANCELLED"].includes(t.status))
              .slice(0, 5)
          );
        }

      } catch (err) {
        console.error("Error fetching profile:", err);
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [user, router, isLoading]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("ql_user_role");
    localStorage.removeItem("ql_intended_role");
    router.push("/");
    toast.success("Signed out successfully");
  };

  const handleUpdateProfile = async () => {
    setIsSaving(true);
    try {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("user_profiles")
        .update({ 
          full_name: editForm.full_name,
          email: editForm.email,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);

      if (error) throw error;

      setProfile({ ...profile, ...editForm });
      setIsEditing(false);
      toast.success("Profile updated!");
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  const maskPhone = (phone?: string) => {
    if (!phone) return "N/A";
    const cleaned = phone.replace("+91", "").trim();
    if (cleaned.length < 5) return phone;
    return `+91 ${cleaned.substring(0, 5)} ****`;
  };

  const formatTimeSaved = (mins: number) => {
    const hrs = Math.floor(mins / 60);
    const m = mins % 60;
    if (hrs === 0) return `${m} mins saved`;
    return `${hrs} hrs ${m} mins saved`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#00F5A0]/20 border-t-[#00F5A0] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] pb-24 text-white font-sans selection:bg-[#00F5A0]/30 selection:text-[#00F5A0]">
      
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-[#0A0A0F]/80 backdrop-blur-xl px-4 py-6 border-b border-white/10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/home" className="flex items-center gap-2 group text-zinc-400 hover:text-[#00F5A0] transition-colors">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold text-sm uppercase tracking-widest">Back</span>
          </Link>
          <h1 className="text-sm font-black uppercase tracking-[0.3em] text-zinc-500">My Profile</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-10">
        
        {/* PROFILE HEADER */}
        <section className="bg-[#111118] rounded-[2.5rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#00F5A0]/10 rounded-full blur-[60px] pointer-events-none" />
          
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative mb-6">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.full_name} 
                  className="w-28 h-28 rounded-full border-4 border-white/5 shadow-2xl object-cover"
                />
              ) : (
                <div 
                  className="w-28 h-28 rounded-full border-4 border-white/5 shadow-2xl flex items-center justify-center text-4xl font-black"
                  style={{ 
                    background: `linear-gradient(135deg, #00F5A0 0%, #0B6EFE 100%)`,
                    color: '#0A0A0F'
                  }}
                >
                  {getInitials(profile?.full_name || user?.email)}
                </div>
              )}
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all"
                >
                  <Edit2 size={16} />
                </button>
              )}
            </div>

            {/* User Info */}
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div 
                  key="edit-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full space-y-4"
                >
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block text-left px-4">Full Name</label>
                    <input 
                      type="text"
                      value={editForm.full_name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:border-[#00F5A0] outline-none transition-all"
                      placeholder="Your Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block text-left px-4">Email Address</label>
                    <input 
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:border-[#00F5A0] outline-none transition-all"
                      placeholder="Email Address"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="flex-1 py-4 bg-white/5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleUpdateProfile}
                      disabled={isSaving}
                      className="flex-1 py-4 bg-[#00F5A0] text-black rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-[#00F5A0]/20 hover:brightness-110 active:scale-95 transition-all"
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="display-info"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <h2 className="text-3xl font-black tracking-tighter mb-2">{profile?.full_name || "QueueLess User"}</h2>
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium">
                      <Mail size={14} className="text-[#0B6EFE]" />
                      {profile?.email || user?.email || "No email set"}
                    </div>
                    <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium">
                      <Phone size={14} className="text-[#00F5A0]" />
                      {maskPhone(user?.phone || profile?.phone)}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* STATS ROW */}
        <section className="grid grid-cols-3 gap-4">
          <div className="bg-[#111118] border border-white/5 p-6 rounded-[2rem] text-center shadow-lg group hover:border-[#00F5A0]/30 transition-all">
            <div className="w-10 h-10 bg-[#0B6EFE]/10 rounded-xl flex items-center justify-center text-[#0B6EFE] mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Ticket size={20} />
            </div>
            <p className="text-2xl font-black text-white">{stats.tokensCount}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mt-1">Tokens</p>
          </div>
          <div className="bg-[#111118] border border-white/5 p-6 rounded-[2rem] text-center shadow-lg group hover:border-[#00F5A0]/30 transition-all">
            <div className="w-10 h-10 bg-[#7000FF]/10 rounded-xl flex items-center justify-center text-[#7000FF] mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Building2 size={20} />
            </div>
            <p className="text-2xl font-black text-white">{stats.businessesCount}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mt-1">Visited</p>
          </div>
          <div className="bg-[#111118] border border-[#00F5A0]/20 p-6 rounded-[2rem] text-center shadow-[#00F5A0]/5 shadow-xl group hover:border-[#00F5A0]/50 transition-all col-span-1">
            <div className="w-10 h-10 bg-[#00F5A0]/10 rounded-xl flex items-center justify-center text-[#00F5A0] mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Clock size={20} />
            </div>
            <p className="text-xs font-black text-[#00F5A0] leading-tight mt-1">{formatTimeSaved(stats.timeSavedMins)}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mt-1">Time Saved</p>
          </div>
        </section>

        {/* ACTIVE TOKENS */}
        {activeTokens.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#00F5A0]">Active Tokens</h3>
              <span className="w-2 h-2 rounded-full bg-[#00F5A0] animate-pulse shadow-[0_0_10px_#00F5A0]" />
            </div>
            <div className="space-y-4">
              {activeTokens.map((token) => (
                <Link 
                  key={token.id}
                  href={`/customer/queue/${token.orgId}/${token.id}`}
                  className="block bg-gradient-to-r from-[#0B6EFE]/20 to-[#0A0A0F] border border-[#0B6EFE]/30 rounded-3xl p-5 group hover:border-[#0B6EFE] transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-xl">
                        {token.businesses?.category === 'Hospital' ? '🏥' : 
                         token.businesses?.category === 'Bank' ? '🏦' : '🏢'}
                      </div>
                      <div>
                        <h4 className="font-bold text-white group-hover:text-[#0B6EFE] transition-colors">{token.businesses?.name || "Business"}</h4>
                        <p className="text-2xl font-black text-white mt-1">{token.tokenNumber}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1 bg-[#0B6EFE] text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                        {token.status}
                      </span>
                      <p className="text-xs text-zinc-500 mt-2 flex items-center justify-end gap-1">
                        Track Live <ChevronRight size={14} />
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* RECENT ACTIVITY */}
        <section>
          <div className="flex items-center justify-between mb-6 px-2">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Recent Activity</h3>
            <History size={16} className="text-zinc-500" />
          </div>
          
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((token) => (
                <div 
                  key={token.id}
                  className="bg-[#111118]/50 border border-white/5 rounded-3xl p-5 flex items-center justify-between group hover:bg-[#111118] transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center grayscale group-hover:grayscale-0 transition-all">
                      {token.businesses?.category === 'Hospital' ? '🏥' : 
                       token.businesses?.category === 'Bank' ? '🏦' : '🏢'}
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-300 text-sm">{token.businesses?.name || "Business"}</h4>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight mt-0.5">
                        Token {token.tokenNumber} • {new Date(token.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                    token.status === 'SERVED' ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-white/10 text-zinc-500'
                  }`}>
                    {token.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-[#111118]/20 border border-dashed border-white/10 rounded-[2.5rem]">
                <p className="text-sm font-bold text-zinc-600 uppercase tracking-widest">No previous visits found</p>
              </div>
            )}
          </div>
        </section>

        {/* DANGER ZONE */}
        <section className="pt-6 border-t border-white/5">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-3 py-6 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-500 font-extrabold uppercase tracking-widest text-xs hover:bg-rose-500 hover:text-white transition-all group"
          >
            <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
            Sign Out Account
          </button>
        </section>

      </main>
    </div>
  );
}
