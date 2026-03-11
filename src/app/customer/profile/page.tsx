"use client";

import PageTransition from "@/components/PageTransition";
import CustomerNav from "@/components/Navigation/CustomerNav";
import Tooltip from "@/components/ToolTip";
import { useProfile } from "@/lib/useProfile";
import { useLanguage, Language } from "@/context/LanguageContext";
import { useTheme } from "next-themes";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { 
  User, Settings, Shield, LogOut, Camera, 
  Smartphone, Mail, MessageSquare, Bell, Moon, Sun, Monitor,
  History, MapPin, Clock
} from "lucide-react";
import { useState, useEffect } from "react";

export default function ProfilePage() {
  const { profile, updateProfile, updateNotifications, isLoading } = useProfile();
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: profile.name,
    phone: profile.phone,
    email: profile.email
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setFormData({
      name: profile.name,
      phone: profile.phone,
      email: profile.email
    });
  }, [profile]);

  const handleSaveProfile = async () => {
    const normalizePhone = (p: string) => {
      let cleaned = p.replace(/\D/g, "");
      if (cleaned.startsWith("91") && cleaned.length === 12) {
        cleaned = cleaned.substring(2);
      } else if (cleaned.startsWith("0") && cleaned.length === 11) {
        cleaned = cleaned.substring(1);
      }
      return cleaned;
    };

    const digits = normalizePhone(formData.phone);
    if (!/^[6-9]\d{9}$/.test(digits)) {
      alert("Please enter a valid 10-digit Indian mobile number");
      return;
    }

    await updateProfile({ ...formData, phone: "+91" + digits });
    setIsEditing(false);
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <PageTransition className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pb-32 pt-12 md:pt-24 transition-colors duration-300">
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Profile Header Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/40 dark:border-slate-800/60 p-6 md:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] mb-8 overflow-hidden group"
        >
          {/* Abstract background decorative elements */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-gradient-to-br from-orange-400/20 to-rose-400/20 dark:from-orange-500/10 dark:to-rose-500/10 blur-3xl rounded-full"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-48 h-48 bg-gradient-to-tr from-blue-400/20 to-emerald-400/20 dark:from-blue-500/10 dark:to-emerald-500/10 blur-3xl rounded-full"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-10">
            
            {/* Avatar */}
            <div className="relative group/avatar cursor-pointer">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-[2rem] bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 p-1 shadow-xl transition-transform duration-300 group-hover/avatar:scale-105">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`} 
                  alt={profile.name} 
                  className="w-full h-full rounded-[1.8rem] object-cover bg-white dark:bg-slate-900" 
                />
              </div>
              
              {/* Fake hovering avatar upload context menu */}
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm rounded-[2rem] opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                <Camera size={24} className="text-white mb-1" />
                <span className="text-white text-xs font-bold uppercase tracking-wider">Change Photo</span>
              </div>
            </div>

            {/* Info */}
            <div className="text-center md:text-left flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-widest mb-3">
                <Shield size={12} />
                Member since {profile.memberSince}
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                {profile.name}
              </h1>
              <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-slate-500 dark:text-slate-400 font-medium">
                <Tooltip content="Edit verified phone number" position="bottom">
                  <span className="flex items-center gap-2 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"><Smartphone size={16} /> {profile.phone}</span>
                </Tooltip>
                <Tooltip content="Edit verified email address" position="bottom">
                  <span className="flex items-center gap-2 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"><Mail size={16} /> {profile.email}</span>
                </Tooltip>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Dynamic Settings Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {/* Section 1: Personal Info */}
          <motion.div variants={itemVariants} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] cursor-default lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                  <User size={20} />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Personal Information</h2>
              </div>
              {isEditing ? (
                <button onClick={handleSaveProfile} disabled={isLoading} className="text-xs font-bold text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors shadow-sm">
                  {isLoading ? "Saving..." : "Save"}
                </button>
              ) : (
                <button onClick={() => setIsEditing(true)} className="text-xs font-bold text-blue-500 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 px-4 py-2 rounded-lg transition-colors">
                  Edit
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="group">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={isEditing ? formData.name : profile.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  disabled={!isEditing}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Phone</label>
                  <input 
                    type="text" 
                    value={isEditing ? formData.phone : profile.phone} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    disabled={!isEditing}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="group">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Email</label>
                  <input 
                    type="email" 
                    value={isEditing ? formData.email : profile.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    disabled={!isEditing}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Section 2: Notifications */}
          <motion.div variants={itemVariants} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                <Bell size={20} />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Alerts</h2>
            </div>
            
            <div className="space-y-4">
              <Tooltip content="Receive critical queue updates via Text Message" position="left">
                <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <MessageSquare size={18} className="text-slate-400" />
                    <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">SMS Alerts</span>
                  </div>
                  <button 
                    onClick={() => updateNotifications("sms", !profile.notifications.sms)}
                    className={`w-12 h-6 rounded-full transition-colors relative shadow-inner ${profile.notifications.sms ? 'bg-orange-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                  >
                    <motion.div 
                      layout
                      className="w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm"
                      animate={{ left: profile.notifications.sms ? "28px" : "4px" }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
              </Tooltip>

              <Tooltip content="Receive rich media notifications on WhatsApp" position="left">
                <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Smartphone size={18} className="text-slate-400" />
                    <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">WhatsApp</span>
                  </div>
                  <button 
                    onClick={() => updateNotifications("whatsapp", !profile.notifications.whatsapp)}
                    className={`w-12 h-6 rounded-full transition-colors relative shadow-inner ${profile.notifications.whatsapp ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                  >
                    <motion.div 
                      layout
                      className="w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm"
                      animate={{ left: profile.notifications.whatsapp ? "28px" : "4px" }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
              </Tooltip>

              <Tooltip content="Receive browser push notifications when app is minimized" position="left">
                <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Bell size={18} className="text-slate-400" />
                    <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">Push Notifications</span>
                  </div>
                  <button 
                    onClick={() => updateNotifications("push", !profile.notifications.push)}
                    className={`w-12 h-6 rounded-full transition-colors relative shadow-inner ${profile.notifications.push ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                  >
                    <motion.div 
                      layout
                      className="w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm"
                      animate={{ left: profile.notifications.push ? "28px" : "4px" }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
              </Tooltip>
            </div>
          </motion.div>

          {/* Section 3: App Preferences & Language */}
          <motion.div variants={itemVariants} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                <Settings size={20} />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Preferences</h2>
            </div>
            
            {/* Theme Toggle */}
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Display Theme</label>
              {mounted && (
                <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl">
                  <button 
                    onClick={() => setTheme("light")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-xl transition-all ${theme === "light" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    <Sun size={14} /> Light
                  </button>
                  <button 
                    onClick={() => setTheme("dark")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-xl transition-all ${theme === "dark" ? "bg-slate-900 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
                  >
                    <Moon size={14} /> Dark
                  </button>
                  <button 
                    onClick={() => setTheme("system")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-xl transition-all ${theme === "system" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-300"}`}
                  >
                    <Monitor size={14} /> Auto
                  </button>
                </div>
              )}
            </div>

            {/* Language Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Interface Language</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "en", label: "English" },
                  { id: "hi", label: "Hindi" },
                  { id: "pa", label: "Punjabi" },
                  { id: "ta", label: "Tamil" },
                  { id: "bn", label: "Bengali" }
                ].map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setLanguage(lang.id as Language)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      language === lang.id 
                        ? "bg-orange-50 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/30" 
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Section 4: Queue History */}
          <motion.div variants={itemVariants} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <History size={20} />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Queue History</h2>
              </div>
              <Tooltip content="View all past tickets and wait analytics" position="left">
                <button className="text-orange-500 hover:text-orange-600 font-bold text-sm transition-colors">View All</button>
              </Tooltip>
            </div>
            
            <div className="space-y-3">
              {profile.queueHistory.map((visit) => (
                <div key={visit.id} className="group/item flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xs font-black ${visit.status === 'SERVED' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                      {visit.status === 'SERVED' ? <Clock size={16} /> : 'X'}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{visit.orgName}</h4>
                      <div className="flex items-center gap-2 mt-0.5 text-xs font-medium text-slate-500">
                        <MapPin size={10} /> {visit.serviceName}
                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                        {visit.date}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="text-sm font-black text-slate-600 dark:text-slate-300">{visit.waitTimeMins} min wait</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider mt-1 px-2 py-0.5 rounded-full ${visit.status === 'SERVED' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 text-emerald-400' : 'bg-slate-200 text-slate-500 dark:bg-slate-800'}`}>
                      {visit.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Section 5: Security */}
          <motion.div variants={itemVariants} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                <Shield size={20} />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Security</h2>
            </div>
            
            <div className="space-y-3">
              <button className="w-full py-3.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm text-left flex items-center justify-between group/btn">
                Change Password
                <span className="text-slate-400 group-hover/btn:text-slate-600 dark:group-hover/btn:text-white transition-colors">→</span>
              </button>
              
              <button className="w-full py-3.5 px-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-sm hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors shadow-sm flex items-center justify-center gap-2 group/logout">
                <LogOut size={16} className="group-hover/logout:-translate-x-1 transition-transform" /> Sign Out
              </button>
            </div>
          </motion.div>

        </motion.div>
      </div>

    </PageTransition>
  );
}
