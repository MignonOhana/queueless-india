'use client';

import { useState, useMemo } from 'react';
import { Calendar, Clock, AlertCircle, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const INDIAN_HOLIDAYS_2026 = [
  '2026-01-26', // Republic Day
  '2026-03-17', // Holi
  '2026-04-14', // Ambedkar Jayanti
  '2026-08-15', // Independence Day
  '2026-10-02', // Gandhi Jayanti
  '2026-10-23', // Diwali
  '2026-11-15', // Guru Nanak Jayanti
  '2026-12-25', // Christmas
];

interface Props {
  businessId: string;
  businessName: string;
  opHours?: string;    // e.g., "09:00-17:00"
  serviceMins?: number;
  closedDays?: number[]; // 0=Sun, 6=Sat
}

export default function AdvanceBookingForm({
  businessId,
  businessName,
  opHours = '09:00-17:00',
  serviceMins = 15,
  closedDays = [0], // Sunday closed by default
}: Props) {
  const supabase = createClient();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState(false);

  // Parse operating hours into slot list
  const slots = useMemo(() => {
    const [startStr, endStr] = opHours.split('-');
    const [startH, startM] = startStr.split(':').map(Number);
    const [endH, endM] = endStr.split(':').map(Number);

    const result: string[] = [];
    let current = startH * 60 + startM;
    const end = endH * 60 + endM;

    while (current + serviceMins <= end) {
      const h = Math.floor(current / 60);
      const m = current % 60;
      result.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      current += serviceMins;
    }
    return result;
  }, [opHours, serviceMins]);

  const isDateBlocked = (dateStr: string): boolean => {
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();
    if (closedDays.includes(dayOfWeek)) return true;
    if (INDIAN_HOLIDAYS_2026.includes(dateStr)) return true;
    return false;
  };

  const isHoliday = (dateStr: string): string | null => {
    const holidays: Record<string, string> = {
      '2026-01-26': 'Republic Day',
      '2026-03-17': 'Holi',
      '2026-04-14': 'Ambedkar Jayanti',
      '2026-08-15': 'Independence Day',
      '2026-10-02': 'Gandhi Jayanti',
      '2026-10-23': 'Diwali',
      '2026-11-15': 'Guru Nanak Jayanti',
      '2026-12-25': 'Christmas',
    };
    return holidays[dateStr] || null;
  };

  const handleBook = async () => {
    if (!selectedDate || !selectedSlot || !customerName) {
      toast.error('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from('advance_bookings').insert({
        business_id: businessId,
        user_id: user?.id || null,
        customer_name: customerName,
        customer_phone: customerPhone,
        booking_date: selectedDate,
        booking_time: selectedSlot,
        status: 'confirmed',
      });

      if (error) throw error;

      setBooked(true);
      toast.success('Booking confirmed!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  if (booked) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
          <Check size={32} className="text-emerald-500" />
        </div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Booking Confirmed!</h3>
        <p className="text-slate-500 text-sm mb-1">{businessName}</p>
        <p className="text-slate-400 text-sm">{selectedDate} at {selectedSlot}</p>
        <p className="text-slate-400 text-xs mt-4">You'll receive a confirmation at your registered contact.</p>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const holidayName = selectedDate ? isHoliday(selectedDate) : null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-2 mb-6">
        <Calendar size={20} className="text-indigo-500" />
        <h3 className="text-lg font-black text-slate-900 dark:text-white">Advance Booking</h3>
      </div>

      <div className="space-y-4">
        {/* Customer Name */}
        <input
          type="text"
          placeholder="Your Name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 text-sm"
        />

        {/* Phone */}
        <input
          type="tel"
          placeholder="WhatsApp Number (optional)"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 text-sm"
        />

        {/* Date Picker */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Select Date</label>
          <input
            type="date"
            min={today}
            max={maxDate}
            value={selectedDate}
            onChange={(e) => {
              const val = e.target.value;
              if (isDateBlocked(val)) {
                toast.error(isHoliday(val) ? `Closed: ${isHoliday(val)}` : 'Closed on this day');
                return;
              }
              setSelectedDate(val);
              setSelectedSlot('');
            }}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 text-sm"
          />
          {holidayName && (
            <p className="text-amber-500 text-xs font-bold mt-1 flex items-center gap-1">
              <AlertCircle size={12} /> {holidayName} — Closed
            </p>
          )}
        </div>

        {/* Time Slots */}
        {selectedDate && !isDateBlocked(selectedDate) && (
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">
              <Clock size={12} className="inline mr-1" /> Available Slots
            </label>
            <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
              {slots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${
                    selectedSlot === slot
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-indigo-500/10'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Book Button */}
        <button
          onClick={handleBook}
          disabled={loading || !selectedDate || !selectedSlot || !customerName}
          className="w-full py-3 rounded-xl bg-indigo-600 text-white font-black text-sm hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Booking...' : 'Confirm Booking'}
        </button>
      </div>
    </div>
  );
}
