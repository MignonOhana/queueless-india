'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, MapPin, Phone, FileText, Clock, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface BusinessCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (business: any) => void;
}

const CATEGORIES = [
  "Hospital", "Bank", "Temple", "Government", 
  "Railway Station", "Court", "Post Office"
];

export default function BusinessCreationModal({ isOpen, onClose, onSuccess }: BusinessCreationModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Hospital',
    location: '',
    phone: '',
    description: '',
    serviceMins: '15'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/business/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create business');

      toast.success('Business created successfully!');
      onSuccess(data);
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 bg-opacity-95"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg bg-surface border border-border rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
      >
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[60px] -mr-16 -mt-16" />
        
        <div className="flex justify-between items-center mb-8 relative z-10">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Create Listing</h2>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Step 1 of 3</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 ml-1">Business Name</label>
              <div className="relative">
                <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input 
                  type="text"
                  required
                  placeholder="e.g. City General Hospital"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary transition-all text-sm font-medium"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 ml-1">Category</label>
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white focus:outline-none focus:border-primary transition-all text-sm font-medium appearance-none"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat} className="bg-zinc-900">{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 ml-1">Location (City)</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Delhi"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary transition-all text-sm font-medium"
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 ml-1">Phone</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input 
                    type="tel"
                    required
                    placeholder="+91 98765..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary transition-all text-sm font-medium"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 ml-1">Service Mins/Person</label>
                <div className="relative">
                  <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input 
                    type="number"
                    required
                    min="1"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary transition-all text-sm font-medium"
                    value={formData.serviceMins}
                    onChange={e => setFormData({...formData, serviceMins: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 ml-1">Description</label>
              <div className="relative">
                <FileText size={16} className="absolute left-4 top-4 text-zinc-500" />
                <textarea 
                  placeholder="Tell customers about your services..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary transition-all text-sm font-medium min-h-[100px] resize-none"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-5 rounded-[1.2rem] mt-4 flex items-center justify-center gap-2 group shadow-xl shadow-primary/20"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                Create Business <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
