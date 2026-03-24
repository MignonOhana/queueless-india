"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Phone, Edit2, Camera,
  Ticket, Building2, Clock, History,
  LogOut, ChevronRight, ArrowLeft,
  Shield, ShieldCheck, ShieldAlert, ShieldX, X,
  Calendar, MapPin, Fingerprint
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { type Profile } from "@/types/database";

const supabase = createClient();

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu & Kashmir", "Ladakh", "Chandigarh",
  "Puducherry", "Andaman & Nicobar Islands"
];

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" }
];

interface ProfileForm {
  full_name: string;
  date_of_birth: string;
  gender: string;
  city: string;
  state: string;
  pincode: string;
  bio: string;
}

// ==== KYC MODAL ============================================================
function KYCModal({ isOpen, onClose, onSubmit, isSubmitting }: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (aadhaar: string, pan: string) => void;
  isSubmitting: boolean;
}) {
  const [aadhaar, setAadhaar] = useState("");
  const [pan, setPan] = useState("");

  if (!isOpen) return null;

  const canSubmit = aadhaar.length === 4 && /^\d{4}$/.test(aadhaar) && pan.length === 4;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="bg-[#111118] border border-white/10 rounded-[2rem] p-8 w-full max-w-md shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Fingerprint size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white tracking-tight">Add ID Proof</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">KYC Verification</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
              aria-label="Close"
              title="Close"
            >
              <X size={16} className="text-zinc-400" />
            </button>
          </div>

          <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
            We only store the <span className="text-white font-bold">last 4 digits</span> of your documents. Your full numbers are never stored or transmitted.
          </p>

          <div className="space-y-4 mb-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block px-1">
                Aadhaar — Last 4 Digits
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={aadhaar}
                onChange={e => setAadhaar(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="1234"
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white font-mono text-xl tracking-[0.5em] text-center focus:border-primary outline-none transition-all placeholder:tracking-[0.5em] placeholder:text-zinc-700"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block px-1">
                PAN — Last 4 Characters
              </label>
              <input
                type="text"
                maxLength={4}
                value={pan}
                onChange={e => setPan(e.target.value.toUpperCase().slice(0, 4))}
                placeholder="1A2B"
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white font-mono text-xl tracking-[0.5em] text-center focus:border-primary outline-none transition-all placeholder:tracking-[0.5em] placeholder:text-zinc-700"
              />
            </div>
          </div>

          <button
            onClick={() => canSubmit && onSubmit(aadhaar, pan)}
            disabled={!canSubmit || isSubmitting}
            className="w-full py-4 bg-primary text-black rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
          >
            {isSubmitting ? "Submitting..." : "Submit for Verification"}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ==== KYC STATUS BADGE =====================================================
function KYCBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; icon: React.ComponentType<{ size: number }>; color: string; bg: string }> = {
    none: { label: "Not Verified", icon: Shield, color: "text-zinc-400", bg: "bg-zinc-500/10" },
    pending: { label: "Under Review", icon: ShieldAlert, color: "text-amber-400", bg: "bg-amber-500/10" },
    verified: { label: "KYC Verified", icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    rejected: { label: "Rejected", icon: ShieldX, color: "text-rose-400", bg: "bg-rose-500/10" },
  };

  const c = config[status] || config.none;
  const Icon = c.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${c.bg} ${c.color} font-black text-xs uppercase tracking-widest`}>
      <Icon size={14} />
      {c.label}
    </div>
  );
}

// ==== SKELETON =============================================================
function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <header className="sticky top-0 z-40 bg-[#0A0A0F]/80 px-4 py-6 border-b border-white/10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="w-20 h-5 bg-white/5 rounded-lg animate-pulse" />
          <div className="w-24 h-4 bg-white/5 rounded-lg animate-pulse" />
          <div className="w-10" />
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-6 py-10 space-y-8">
        <div className="bg-[#111118] rounded-[2.5rem] p-8 border border-white/10">
          <div className="flex flex-col items-center">
            <div className="w-28 h-28 rounded-full bg-white/5 animate-pulse mb-6" />
            <div className="w-48 h-6 bg-white/5 rounded-lg animate-pulse mb-2" />
            <div className="w-32 h-4 bg-white/5 rounded-lg animate-pulse" />
          </div>
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-[#111118] rounded-[2rem] p-6 border border-white/10">
            <div className="w-24 h-3 bg-white/5 rounded animate-pulse mb-4" />
            <div className="space-y-3">
              <div className="w-full h-12 bg-white/5 rounded-xl animate-pulse" />
              <div className="w-3/4 h-12 bg-white/5 rounded-xl animate-pulse" />
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

// ==== MAIN PAGE ============================================================
export default function CustomerProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<ProfileForm>({
    full_name: "", date_of_birth: "", gender: "",
    city: "", state: "", pincode: "", bio: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // KYC state
  const [showKYC, setShowKYC] = useState(false);
  const [isKYCSaving, setIsKYCSaving] = useState(false);

  // Stats
  const [stats, setStats] = useState({ tokensCount: 0, businessesCount: 0, timeSavedMins: 0 });
  const [activeTokens, setActiveTokens] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      if (!isLoading) router.push("/login");
      return;
    }
    fetchProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchProfileData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profileData, error: profileErr } = await supabase
        .rpc('get_my_profile')
        .maybeSingle() as { data: any; error: any };

      if (profileErr) throw profileErr;
      if (profileData) {
        setProfile(profileData as Profile);
        setForm({
          full_name: profileData.full_name || "",
          date_of_birth: profileData.date_of_birth || "",
          gender: profileData.gender || "",
          city: profileData.city || "",
          state: profileData.state || "",
          pincode: profileData.pincode || "",
          bio: profileData.bio || ""
        });
      }

      // Fetch stats
      const { data: tokens } = await (supabase
        .from("tokens") as any)
        .select(`*, businesses:orgId (name, category)`)
        .eq("userId", session.user.id)
        .order("createdAt", { ascending: false });

      if (tokens) {
        const uniqueBusinesses = new Set(tokens.map((t: any) => t.orgId)).size;
        setStats({
          tokensCount: tokens.length,
          businessesCount: uniqueBusinesses,
          timeSavedMins: tokens.length * 25
        });
        setActiveTokens(tokens.filter((t: any) => ["WAITING", "SERVING"].includes(t.status)));
        setRecentActivity(tokens.filter((t: any) => ["SERVED", "CANCELLED"].includes(t.status)).slice(0, 5));
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      toast.error("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  // ==== Avatar Upload ====
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }

    setIsUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });

      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(path);

      // Add cache-bust param
      const url = `${publicUrl}?t=${Date.now()}`;

      await (supabase.from("user_profiles") as any)
        .update({ avatar_url: url, updated_at: new Date().toISOString() })
        .eq("id", user.id);

      setProfile(prev => prev ? { ...prev, avatar_url: url } : prev);
      toast.success("Avatar updated!");
    } catch (err) {
      console.error("Avatar upload error:", err);
      toast.error("Failed to upload avatar");
    } finally {
      setIsUploading(false);
    }
  };

  // ==== Save Profile ====
  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const { error } = await (supabase.from("user_profiles") as any)
        .update({
          full_name: form.full_name || null,
          date_of_birth: form.date_of_birth || null,
          gender: form.gender || null,
          city: form.city || null,
          state: form.state || null,
          pincode: form.pincode || null,
          bio: form.bio || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);

      if (error) throw error;
      setProfile(prev => prev ? { ...prev, ...form } : prev);
      setIsEditing(false);
      toast.success("Profile updated!");
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  // ==== KYC Submit ====
  const handleKYCSubmit = async (aadhaar: string, pan: string) => {
    if (!user) return;
    setIsKYCSaving(true);
    try {
      const { error } = await (supabase.from("user_profiles") as any)
        .update({
          aadhaar_last4: aadhaar,
          pan_last4: pan,
          kyc_status: "pending",
          kyc_submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);

      if (error) throw error;
      setProfile(prev => prev ? {
        ...prev,
        aadhaar_last4: aadhaar,
        pan_last4: pan,
        kyc_status: "pending",
        kyc_submitted_at: new Date().toISOString()
      } : prev);
      setShowKYC(false);
      toast.success("KYC submitted for verification!");
    } catch (err) {
      console.error("KYC submit error:", err);
      toast.error("Failed to submit KYC details");
    } finally {
      setIsKYCSaving(false);
    }
  };

  const { signOut } = useAuth();
  const handleSignOut = async () => {
    await signOut();
  };

  const getInitials = (name?: string | null) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  const maskPhone = (phone?: string | null) => {
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

  if (isLoading) return <ProfileSkeleton />;

  const kycStatus = profile?.kyc_status || "none";

  return (
    <div className="min-h-screen bg-[#0A0A0F] pb-24 text-white font-sans selection:bg-primary/30 selection:text-primary">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0A0A0F]/80 backdrop-blur-xl px-4 py-6 border-b border-white/10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/customer/dashboard" className="flex items-center gap-2 group text-zinc-400 hover:text-primary transition-colors">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold text-sm uppercase tracking-widest">Back</span>
          </Link>
          <h1 className="text-sm font-black uppercase tracking-[0.3em] text-zinc-500">My Profile</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-8">

        {/* ==== PROFILE CARD ==== */}
        <section className="bg-[#111118] rounded-[2.5rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-[60px] pointer-events-none" />

          <div className="flex flex-col items-center text-center relative z-10">
            {/* Avatar */}
            <div className="relative mb-6">
              {profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.full_name || "Avatar"}
                  width={112}
                  height={112}
                  className="w-28 h-28 rounded-full border-4 border-white/5 shadow-2xl object-cover"
                  unoptimized
                />
              ) : (
                <div
                  className="w-28 h-28 rounded-full border-4 border-white/5 shadow-2xl flex items-center justify-center text-4xl font-black bg-gradient-to-br from-primary to-[#0B6EFE] text-black"
                >
                  {getInitials(profile?.full_name || user?.email)}
                </div>
              )}

              {/* Upload Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute bottom-0 right-0 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
                aria-label="Upload avatar"
                title="Upload avatar"
              >
                {isUploading ? (
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  <Camera size={16} />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                title="Select Profile Photo"
              />
            </div>

            {/* Name + Contact (read only) */}
            <h2 className="text-3xl font-black tracking-tighter mb-2">
              {profile?.full_name || "QueueLess User"}
            </h2>
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium">
                <Mail size={14} className="text-[#0B6EFE]" />
                {profile?.email || user?.email || "No email set"}
              </div>
              <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium">
                <Phone size={14} className="text-primary" />
                {maskPhone(user?.phone || profile?.phone)}
              </div>
            </div>
          </div>
        </section>

        {/* ==== STATS ROW ==== */}
        <section className="grid grid-cols-3 gap-3">
          {[
            { icon: Ticket, value: stats.tokensCount, label: "Tokens", color: "var(--brand-primary)" },
            { icon: Building2, value: stats.businessesCount, label: "Visited", color: "#7000FF" },
          ].map(({ icon: Icon, value, label, color }) => (
            <div key={label} className="bg-[#111118] border border-white/5 p-5 rounded-[2rem] text-center shadow-lg group hover:border-primary/30 transition-all">
              <div 
                className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform bg-white/[0.05] ${
                  label === 'Tokens' ? 'text-primary' : 'text-[#7000FF]'
                }`}
              >
                <Icon size={20} />
              </div>
              <p className="text-2xl font-black text-white">{value}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mt-1">{label}</p>
            </div>
          ))}
          <div className="bg-[#111118] border border-primary/20 p-5 rounded-[2rem] text-center shadow-primary/5 shadow-xl group hover:border-primary/50 transition-all">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Clock size={20} />
            </div>
            <p className="text-xs font-black text-primary leading-tight mt-1">{formatTimeSaved(stats.timeSavedMins)}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mt-1">Time Saved</p>
          </div>
        </section>

        {/* ==== PERSONAL INFO CARD ==== */}
        <section className="bg-[#111118] rounded-[2rem] p-6 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <User size={16} />
              </div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Personal Details</h3>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white"
              >
                <Edit2 size={12} /> Edit
              </button>
            )}
          </div>

          {isEditing ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {/* Full Name */}
              <Field label="Full Name" id="full_name">
                <input id="full_name" type="text" value={form.full_name}
                  onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                  className="form-input" placeholder="Your Name" title="Your Full Name" />
              </Field>

              {/* DOB + Gender */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Date of Birth" id="dob">
                  <input id="dob" type="date" value={form.date_of_birth}
                    onChange={e => setForm(f => ({ ...f, date_of_birth: e.target.value }))}
                    className="form-input" title="Date of Birth" />
                </Field>
                <Field label="Gender" id="gender">
                  <select id="gender" value={form.gender}
                    onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                    className="form-input" title="Select Gender">
                    <option value="">Select</option>
                    {GENDER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </Field>
              </div>

              {/* City + State */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="City" id="city">
                  <input id="city" type="text" value={form.city}
                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                    className="form-input" placeholder="Mumbai" title="City" />
                </Field>
                <Field label="State" id="state">
                  <select id="state" value={form.state}
                    onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                    className="form-input" title="Select State">
                    <option value="">Select</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
              </div>

              {/* Pincode */}
              <Field label="Pincode" id="pincode">
                <input id="pincode" type="text" inputMode="numeric" maxLength={6} value={form.pincode}
                  onChange={e => setForm(f => ({ ...f, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
                  className="form-input" placeholder="400001" title="Pincode" />
              </Field>

              {/* Bio */}
              <Field label={`Bio (${form.bio.length}/160)`}>
                <textarea value={form.bio} maxLength={160} rows={3}
                  onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  className="form-input resize-none" placeholder="Tell us about yourself..." />
              </Field>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-4 bg-white/5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 py-4 bg-primary text-black rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-60"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <ReadonlyField icon={<User size={14} />} label="Name" value={profile?.full_name || "—"} />
              <ReadonlyField icon={<Calendar size={14} />} label="Date of Birth" value={profile?.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"} />
              <ReadonlyField icon={<User size={14} />} label="Gender" value={profile?.gender ? GENDER_OPTIONS.find(g => g.value === profile.gender)?.label || profile.gender : "—"} />
              <ReadonlyField icon={<MapPin size={14} />} label="City" value={profile?.city || "—"} />
              <ReadonlyField icon={<MapPin size={14} />} label="State" value={profile?.state || "—"} />
              <ReadonlyField icon={<MapPin size={14} />} label="Pincode" value={profile?.pincode || "—"} />
              {profile?.bio && (
                <div className="col-span-2 bg-white/[0.03] rounded-xl px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-1">Bio</p>
                  <p className="text-sm text-zinc-300 leading-relaxed">{profile.bio}</p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* ==== KYC SECTION ==== */}
        <section className="bg-[#111118] rounded-[2rem] p-6 border border-white/10 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Fingerprint size={16} />
            </div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Identity Verification</h3>
          </div>

          <div className="flex items-center justify-between mb-4">
            <KYCBadge status={kycStatus} />
          </div>

          {kycStatus === "none" && (
            <div className="bg-white/[0.02] rounded-2xl p-5 border border-dashed border-white/10">
              <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
                Verify your identity to unlock priority queue access and faster check-ins.
              </p>
              <button
                onClick={() => setShowKYC(true)}
                className="w-full py-4 bg-primary text-black rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Fingerprint size={16} /> Add ID Proof
              </button>
            </div>
          )}

          {kycStatus === "pending" && (
            <div className="bg-amber-500/5 rounded-2xl p-5 border border-amber-500/20">
              <p className="text-sm text-amber-200/80 mb-2">Your documents are being reviewed. This usually takes 24-48 hours.</p>
              <div className="flex gap-6 mt-3">
                <div><span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Aadhaar</span><p className="text-sm font-mono text-zinc-300">XXXX-XXXX-{profile?.aadhaar_last4}</p></div>
                <div><span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">PAN</span><p className="text-sm font-mono text-zinc-300">XXXXXXXX{profile?.pan_last4}</p></div>
              </div>
            </div>
          )}

          {kycStatus === "verified" && (
            <div className="bg-emerald-500/5 rounded-2xl p-5 border border-emerald-500/20">
              <p className="text-sm text-emerald-200/80 mb-3 flex items-center gap-2">✅ Your identity has been verified</p>
              <div className="flex gap-6">
                <div><span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Aadhaar</span><p className="text-sm font-mono text-zinc-300">XXXX-XXXX-{profile?.aadhaar_last4}</p></div>
                <div><span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">PAN</span><p className="text-sm font-mono text-zinc-300">XXXXXXXX{profile?.pan_last4}</p></div>
              </div>
              {profile?.kyc_verified_at && (
                <p className="text-[10px] text-zinc-600 mt-3 font-bold">Verified on {new Date(profile.kyc_verified_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
              )}
            </div>
          )}

          {kycStatus === "rejected" && (
            <div className="bg-rose-500/5 rounded-2xl p-5 border border-rose-500/20">
              <p className="text-sm text-rose-200/80 mb-4">Your verification was rejected. Please re-submit with correct details.</p>
              <button
                onClick={() => setShowKYC(true)}
                className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:brightness-110 active:scale-95 transition-all"
              >
                Re-submit Documents
              </button>
            </div>
          )}
        </section>

        {/* ==== ACTIVE TOKENS ==== */}
        {activeTokens.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary">Active Tokens</h3>
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_var(--color-primary)]" />
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
                        {token.businesses?.category === "Hospital" ? "🏥" :
                         token.businesses?.category === "Bank" ? "🏦" : "🏢"}
                      </div>
                      <div>
                        <h4 className="font-bold text-white group-hover:text-[#0B6EFE] transition-colors">{token.businesses?.name || "Business"}</h4>
                        <p className="text-2xl font-black text-white mt-1">{token.tokenNumber}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1 bg-[#0B6EFE] text-white rounded-full text-[10px] font-black uppercase tracking-widest">{token.status}</span>
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

        {/* ==== RECENT ACTIVITY ==== */}
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
                      {token.businesses?.category === "Hospital" ? "🏥" :
                       token.businesses?.category === "Bank" ? "🏦" : "🏢"}
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-300 text-sm">{token.businesses?.name || "Business"}</h4>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight mt-0.5">
                        Token {token.tokenNumber} • {token.createdAt ? new Date(token.createdAt).toLocaleDateString() : ""}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                    token.status === "SERVED" ? "bg-emerald-500/10 text-emerald-500" : "bg-white/10 text-zinc-500"
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

        {/* ==== SIGN OUT ==== */}
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

      {/* KYC Modal */}
      <KYCModal
        isOpen={showKYC}
        onClose={() => setShowKYC(false)}
        onSubmit={handleKYCSubmit}
        isSubmitting={isKYCSaving}
      />
    </div>
  );
}

// ==== HELPER COMPONENTS ====================================================
function Field({ label, id, children }: { label: string; id?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block px-1">{label}</label>
      {children}
    </div>
  );
}

function ReadonlyField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white/[0.03] rounded-xl px-4 py-3">
      <div className="flex items-center gap-1.5 mb-1 text-zinc-600">
        {icon}
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-sm font-bold text-zinc-300">{value}</p>
    </div>
  );
}
