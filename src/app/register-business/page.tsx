"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, MapPin, Phone, FileText, 
  Clock, Camera, Check, ChevronRight, 
  ChevronLeft, Copy, Store, User, 
  ShieldCheck, ArrowRight, Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import GlassCard from "@/components/ui/GlassCard";

const supabase = createClient();

const BUSINESS_CATEGORIES = [
  "Hospital", "Clinic", "Bank", "Government", "Temple", 
  "Retail", "Restaurant", "Salon", "Other"
];

interface FormData {
  name: string;
  category: string;
  location: string;
  address: string;
  phone: string;
  description: string;
  openHours: string;
  closeHours: string;
  cover_image_url: string;
  ownerName: string;
  ownerPhone: string;
  agreedToTerms: boolean;
}

const INITIAL_DATA: FormData = {
  name: "",
  category: "",
  location: "",
  address: "",
  phone: "",
  description: "",
  openHours: "09:00",
  closeHours: "18:00",
  cover_image_url: "",
  ownerName: "",
  ownerPhone: "",
  agreedToTerms: false,
};

export default function RegisterBusinessPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [generatedId, setGeneratedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateFields = (fields: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name || !formData.category || !formData.location) {
        toast.error("Please fill in all required fields (Name, Category, Location)");
        return;
      }
    } else if (step === 2) {
      if (!formData.ownerName || !formData.ownerPhone || !formData.agreedToTerms) {
        toast.error("Please provide owner details and agree to terms");
        return;
      }
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => s - 1);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("business-covers")
        .upload(path, file, { upsert: true });

      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage
        .from("business-covers")
        .getPublicUrl(path);

      updateFields({ cover_image_url: publicUrl });
      toast.success("Cover image uploaded!");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const resp = await fetch("/api/business/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error);

      setGeneratedId(result.businessId);
      toast.success("Business registered successfully!");
    } catch (err: any) {
      console.error("Submission error:", err);
      toast.error(err.message || "Failed to register business");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (generatedId) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] text-white flex items-center justify-center p-6">
        <GlassCard className="max-w-md w-full text-center p-10">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-6">
            <Check size={40} />
          </div>
          <h2 className="text-3xl font-black mb-2">Registration Success!</h2>
          <p className="text-zinc-400 mb-8">Your business is now live on QueueLess India.</p>
          
          <div className="bg-black/40 border border-white/10 rounded-2xl p-6 mb-8 relative group">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Your Business ID</p>
            <p className="text-2xl font-mono font-black text-white">{generatedId}</p>
            <button 
              onClick={() => copyToClipboard(generatedId)}
              className="absolute top-4 right-4 p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              title="Copy ID"
            >
              <Copy size={16} className="text-zinc-400" />
            </button>
          </div>

          <button
            onClick={() => router.push("/dashboard/departments")}
            className="w-full py-4 bg-primary text-black rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            Create Departments <ArrowRight size={16} />
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white selection:bg-primary/30 selection:text-primary">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0A0A0F]/80 backdrop-blur-xl px-4 py-6 border-b border-white/10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => step === 1 ? router.back() : handleBack()}
            className="flex items-center gap-2 group text-zinc-400 hover:text-primary transition-colors"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold text-sm uppercase tracking-widest">
              {step === 1 ? "Exit" : "Back"}
            </span>
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-sm font-black uppercase tracking-[0.3em] text-zinc-500">Register Business</h1>
            <div className="flex gap-1.5 mt-2">
              {[1, 2, 3].map((s) => (
                <div 
                  key={s} 
                  className={`h-1 rounded-full transition-all duration-500 ${
                    s === step ? "w-8 bg-primary" : s < step ? "w-4 bg-primary/40" : "w-4 bg-white/10"
                  }`} 
                />
              ))}
            </div>
          </div>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tight">Tell us about your business</h2>
                <p className="text-zinc-500 text-sm">Basic details to help customers find you.</p>
              </div>

              {/* Cover Image Upload */}
              <div 
                className="relative h-48 rounded-[2rem] overflow-hidden bg-white/5 border border-dashed border-white/20 group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {formData.cover_image_url ? (
                  <>
                    <Image 
                      src={formData.cover_image_url} 
                      alt="Cover" 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera size={24} className="text-white" />
                    </div>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:text-primary transition-colors">
                      <Camera size={24} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Upload Cover Image</p>
                  </div>
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-[#0A0A0F]/80 flex items-center justify-center z-10">
                    <Loader2 className="animate-spin text-primary" size={32} />
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                />
              </div>

              <div className="grid gap-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Business Name" icon={<Store size={14} />}>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => updateFields({ name: e.target.value })}
                      className="form-input" 
                      placeholder="E.g. Apollo Apollo Clinic"
                    />
                  </Field>
                  <Field label="Category" icon={<Building2 size={14} />}>
                    <select 
                      value={formData.category}
                      onChange={(e) => updateFields({ category: e.target.value })}
                      className="form-input appearance-none"
                    >
                      <option value="">Select Category</option>
                      {BUSINESS_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="City / Location" icon={<MapPin size={14} />}>
                    <input 
                      type="text" 
                      value={formData.location}
                      onChange={(e) => updateFields({ location: e.target.value })}
                      className="form-input" 
                      placeholder="E.g. Delhi NCR"
                    />
                  </Field>
                  <Field label="Phone Number" icon={<Phone size={14} />}>
                    <input 
                      type="text" 
                      value={formData.phone}
                      onChange={(e) => updateFields({ phone: e.target.value })}
                      className="form-input" 
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </Field>
                </div>

                <Field label="Complete Address" icon={<MapPin size={14} />}>
                  <textarea 
                    value={formData.address}
                    onChange={(e) => updateFields({ address: e.target.value })}
                    className="form-input resize-none h-24" 
                    placeholder="Enter full address..."
                  />
                </Field>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Opening Time" icon={<Clock size={14} />}>
                    <input 
                      type="time" 
                      value={formData.openHours}
                      onChange={(e) => updateFields({ openHours: e.target.value })}
                      className="form-input" 
                    />
                  </Field>
                  <Field label="Closing Time" icon={<Clock size={14} />}>
                    <input 
                      type="time" 
                      value={formData.closeHours}
                      onChange={(e) => updateFields({ closeHours: e.target.value })}
                      className="form-input" 
                    />
                  </Field>
                </div>

                <Field label="Description" icon={<FileText size={14} />}>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => updateFields({ description: e.target.value })}
                    className="form-input resize-none h-32" 
                    placeholder="Briefly describe your services..."
                  />
                </Field>
              </div>

              <button
                onClick={handleNext}
                className="w-full py-5 bg-primary text-black rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 mt-8"
              >
                Continue to Owner Details <ChevronRight size={18} />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tight">Owner Information</h2>
                <p className="text-zinc-500 text-sm">We need this to verify your account.</p>
              </div>

              <div className="grid gap-6">
                <Field label="Owner Full Name" icon={<User size={14} />}>
                  <input 
                    type="text" 
                    value={formData.ownerName}
                    onChange={(e) => updateFields({ ownerName: e.target.value })}
                    className="form-input" 
                    placeholder="John Doe"
                  />
                </Field>

                <Field label="Owner Phone Number" icon={<Phone size={14} />}>
                  <input 
                    type="text" 
                    value={formData.ownerPhone}
                    onChange={(e) => updateFields({ ownerPhone: e.target.value })}
                    className="form-input" 
                    placeholder="+91 XXXXX XXXXX"
                  />
                </Field>

                <div className="p-6 bg-[#111118] border border-white/10 rounded-[2rem] flex items-start gap-4">
                  <div className="pt-1">
                    <input 
                      type="checkbox" 
                      id="terms"
                      checked={formData.agreedToTerms}
                      onChange={(e) => updateFields({ agreedToTerms: e.target.checked })}
                      className="w-5 h-5 rounded border-white/20 bg-black/40 text-primary focus:ring-primary outline-none"
                    />
                  </div>
                  <label htmlFor="terms" className="text-sm text-zinc-400 leading-relaxed cursor-pointer">
                    I agree to the <span className="text-white font-bold">Terms of Service</span> and <span className="text-white font-bold">Privacy Policy</span>. I confirm that I am the authorized owner of this business.
                  </label>
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full py-5 bg-primary text-black rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 mt-8"
              >
                Review & Register <ChevronRight size={18} />
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tight">Review details</h2>
                <p className="text-zinc-500 text-sm">Make sure everything is correct.</p>
              </div>

              <div className="space-y-4">
                <ReviewItem label="Business Name" value={formData.name} />
                <ReviewItem label="Category" value={formData.category} />
                <ReviewItem label="Location" value={formData.location} />
                <ReviewItem label="Operating Hours" value={`${formData.openHours} - ${formData.closeHours}`} />
                <ReviewItem label="Owner" value={formData.ownerName} />
                <ReviewItem label="Contact" value={formData.ownerPhone} />
              </div>

              <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
                <ShieldCheck size={20} />
                <p className="text-xs font-bold uppercase tracking-widest">Ready to launch!</p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full py-5 bg-primary text-black rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 mt-8 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    Complete Registration <Check size={18} />
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <span className="text-zinc-500">{icon}</span>
        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{label}</label>
      </div>
      {children}
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{label}</span>
      <span className="text-sm font-bold text-white">{value || "—"}</span>
    </div>
  );
}
