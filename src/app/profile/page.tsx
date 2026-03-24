"use client";

import { useState, useEffect, useRef } from "react";
import { 
  User, Mail, Phone, Calendar, 
  MapPin, Camera, Shield,
  Check, X, Loader2, ArrowLeft,
  Settings, LogOut, Verified, Clock
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import GlassCard from "@/components/ui/GlassCard";
import { motion, AnimatePresence } from "framer-motion";

const supabase = createClient();

export default function ProfilePage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [isKYCModalOpen, setIsKYCModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // KYC Form State
  const [kycForm, setKycForm] = useState({
    aadhaar: "",
    pan: ""
  });

  useEffect(() => {
    async function fetchProfile() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await (supabase
          .from("user_profiles") as any)
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (_err) {
        console.error("Profile fetch error:", _err);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [user]);

  const handleUpdate = async (fields: any) => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await (supabase
        .from("user_profiles") as any)
        .update(fields)
        .eq("id", user.id);

      if (error) throw error;
      setProfile({ ...profile, ...fields });
      toast.success("Profile updated");
    } catch (_err) {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(path);

      await handleUpdate({ avatar_url: publicUrl });
    } catch (_err) {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const submitKYC = async () => {
    if (kycForm.aadhaar.length !== 4 || kycForm.pan.length !== 4) {
      toast.error("Please enter last 4 characters");
      return;
    }
    try {
      await handleUpdate({
        aadhaar_last4: kycForm.aadhaar,
        pan_last4: kycForm.pan.toUpperCase(),
        kyc_status: 'pending',
        kyc_submitted_at: new Date().toISOString()
      });
      setIsKYCModalOpen(false);
      toast.success("KYC Submitted for verification");
    } catch (_err) {
      toast.error("KYC Submission failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  const kycStatusColors: any = {
    none: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
    pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    verified: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    rejected: "bg-rose-500/10 text-rose-500 border-rose-500/20"
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white selection:bg-primary/30 selection:text-primary font-sans">
      {/* Header */}
      <nav className="sticky top-0 z-40 bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
          </button>
          <div className="flex items-center gap-4">
            <button className="p-2 bg-white/5 rounded-xl text-zinc-400 hover:text-white transition-all" title="Settings"><Settings size={18} /></button>
            <button onClick={() => signOut()} className="p-2 bg-rose-500/10 rounded-xl text-rose-400 hover:bg-rose-500/20 transition-all" title="Sign Out"><LogOut size={18} /></button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Left Column: Avatar & Quick Info */}
          <div className="space-y-8">
            <div className="relative group mx-auto md:mx-0 w-48 h-48">
              <div className="relative w-full h-full rounded-[3rem] overflow-hidden border-2 border-white/10 shadow-2xl glass-effect">
                {profile?.avatar_url ? (
                  <Image src={profile.avatar_url} alt="Profile" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary">
                    <User size={64} />
                  </div>
                )}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity cursor-pointer text-white"
                >
                  <Camera size={24} className="mb-2" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Update Photo</span>
                </button>
                {uploading && (
                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                    <Loader2 className="animate-spin text-primary" size={24} />
                  </div>
                )}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} title="Select Avatar Image" />
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-black tracking-tight">{profile?.full_name || "Queueless User"}</h2>
              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${kycStatusColors[profile?.kyc_status || 'none']}`}>
                {profile?.kyc_status === 'verified' && <Verified size={14} />}
                KYC {profile?.kyc_status || 'NOT SUBMITTED'}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex items-center gap-3 text-zinc-500">
                <Mail size={16} /> <span className="text-sm">{profile?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-500">
                <Phone size={16} /> <span className="text-sm">{profile?.phone}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Forms */}
          <div className="md:col-span-2 space-y-12">
            {/* Personal Details Card */}
            <GlassCard className="p-10 rounded-[3rem] border border-white/10">
              <h3 className="text-lg font-black mb-10 flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center text-primary"><User size={16} /></div>
                Personal Details
              </h3>

              <div className="grid sm:grid-cols-2 gap-8">
                <EditableField 
                  label="Full Name" 
                  value={profile?.full_name} 
                  onSave={(v) => handleUpdate({ full_name: v })} 
                  icon={<User size={14} />}
                  isLoading={saving}
                />
                <EditableField 
                  label="Date of Birth" 
                  type="date"
                  value={profile?.date_of_birth} 
                  onSave={(v) => handleUpdate({ date_of_birth: v })} 
                  icon={<Calendar size={14} />}
                  isLoading={saving}
                />
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">Gender</label>
                  <select 
                    value={profile?.gender || ""}
                    onChange={(e) => handleUpdate({ gender: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-primary transition-all appearance-none"
                    title="Select Gender"
                  >
                    <option value="" disabled>Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer Not to Say</option>
                  </select>
                </div>
                <EditableField 
                  label="Pincode" 
                  value={profile?.pincode} 
                  onSave={(v) => handleUpdate({ pincode: v })} 
                  icon={<MapPin size={14} />}
                />
                <EditableField 
                   label="City" 
                   value={profile?.city} 
                   onSave={(v) => handleUpdate({ city: v })} 
                   icon={<MapPin size={14} />}
                />
                 <EditableField 
                   label="State" 
                   value={profile?.state} 
                   onSave={(v) => handleUpdate({ state: v })} 
                   icon={<MapPin size={14} />}
                />
              </div>

              <div className="mt-8 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">Short Bio</label>
                <textarea 
                  value={profile?.bio || ""}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  onBlur={() => handleUpdate({ bio: profile.bio })}
                  maxLength={160}
                  className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-6 text-sm font-bold text-zinc-300 outline-none focus:border-primary transition-all h-32 resize-none"
                  placeholder="Tell us a bit about yourself (max 160 chars)"
                  title="Short Bio"
                />
              </div>
            </GlassCard>

            {/* KYC Card */}
            <GlassCard className="p-10 rounded-[3rem] border border-white/10 bg-white/[0.02]">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500"><Shield size={16} /></div>
                  KYC Verification
                </h3>
                {profile?.kyc_status === 'verified' && (
                  <Verified className="text-emerald-400" size={24} />
                )}
              </div>

              {profile?.kyc_status === 'verified' ? (
                <div className="p-8 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl">
                  <p className="text-emerald-400 font-bold mb-4 uppercase tracking-widest text-xs flex items-center gap-2">
                    <Check size={16} /> Identity Verified
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Aadhaar (Last 4)</p>
                      <p className="font-mono text-white tracking-widest">XXXX-XXXX-{profile.aadhaar_last4}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">PAN (Last 4)</p>
                      <p className="font-mono text-white tracking-widest">XXXXX-{profile.pan_last4}</p>
                    </div>
                  </div>
                </div>
              ) : profile?.kyc_status === 'pending' ? (
                <div className="p-8 bg-amber-500/10 border border-amber-500/20 rounded-3xl text-center">
                  <Clock size={32} className="text-amber-500 mx-auto mb-4" />
                  <p className="text-amber-500 font-bold uppercase tracking-widest text-xs">Verification in Progress</p>
                  <p className="text-zinc-500 text-sm mt-2">We are reviewing your ID details. This usually takes 24 hours.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-zinc-500 text-sm leading-relaxed">Verification is required to use FastPass and Premium queues. Simply provide the last 4 digits of your IDs to start.</p>
                  <button 
                    onClick={() => setIsKYCModalOpen(true)}
                    className="w-full py-4 bg-white/5 border border-white/10 hover:border-primary/50 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
                  >
                    Add ID Proof Details
                  </button>
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </main>

      {/* KYC Modal */}
      <AnimatePresence>
        {isKYCModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsKYCModalOpen(false)} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#111118] border border-white/10 rounded-[3rem] w-full max-w-sm relative z-10 p-10 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black">Identity Details</h2>
                <button onClick={() => setIsKYCModalOpen(false)} title="Close Modal"><X size={20} className="text-zinc-500 hover:text-white" /></button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">Aadhaar Last 4 Digits</label>
                  <input 
                    type="number" 
                    maxLength={4} 
                    value={kycForm.aadhaar}
                    onChange={(e) => setKycForm({...kycForm, aadhaar: e.target.value.substring(0, 4)})}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-2xl font-mono text-center tracking-[0.5em] focus:border-primary outline-none"
                    placeholder="0000"
                    title="Aadhaar Last 4 Digits"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">PAN Last 4 Characters</label>
                  <input 
                    type="text" 
                    maxLength={4} 
                    value={kycForm.pan}
                    onChange={(e) => setKycForm({...kycForm, pan: e.target.value.toUpperCase().substring(0, 4)})}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-2xl font-mono text-center tracking-[0.5em] focus:border-primary outline-none"
                    placeholder="ABCD"
                    title="PAN Last 4 Characters"
                  />
                </div>

                <div className="p-4 bg-primary/5 rounded-2xl text-[10px] text-zinc-500 leading-relaxed italic">
                  Note: We do not store your full ID numbers. We only use these for initial verification and security.
                </div>

                <button 
                  onClick={submitKYC}
                  className="w-full py-5 bg-primary text-black rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
                >
                  Confirm & Submit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EditableField({ label, value, onSave, icon, isLoading, type = "text" }: { label: string; value: string; onSave: (v: string) => void; icon: React.ReactNode, isLoading?: boolean, type?: string }) {
  const [val, setVal] = useState(value || "");
  const [isEditing, setIsEditing] = useState(false);

  // Using a key on the component is better than this useEffect, 
  // but for a quick fix that doesn't trigger "setState in effect" warning:
  if (value !== undefined && val === "" && value !== "") {
    setVal(value);
  }

  return (
    <div className="space-y-2 group">
      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1 flex items-center justify-between">
        {label}
        {isEditing && <span className="text-primary text-[8px] animate-pulse">Press Enter to save</span>}
      </label>
      <div className="relative">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-hover:text-primary transition-colors">
          {icon}
        </div>
        <input 
          type={type}
          value={val}
          onFocus={() => setIsEditing(true)}
          onBlur={() => {
            setIsEditing(false);
            if (val !== value) onSave(val);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.currentTarget.blur();
            }
          }}
          onChange={(e) => setVal(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white outline-none focus:border-primary transition-all disabled:opacity-50"
          placeholder={`Enter ${label}...`}
          title={label}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
