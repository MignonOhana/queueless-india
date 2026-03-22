'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Mail, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type Step = 'email' | 'otp' | 'done'

export function EmailOTPModal({ onSuccess, onClose, defaultEmail = '' }: {
  onSuccess: (user: any) => void
  onClose: () => void
  defaultEmail?: string
}) {
  const supabase = createClient()
  const [step, setStep] = useState<Step>(defaultEmail ? 'otp' : 'email')
  const [email, setEmail] = useState(defaultEmail)
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(0)

  // Auto-send OTP if defaultEmail is provided
  useEffect(() => {
    if (defaultEmail && step === 'otp') {
      sendOTP()
    }
  }, [defaultEmail])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [countdown])

  const sendOTP = async () => {
    if (!email || !email.includes('@')) {
      setError('Enter a valid email address')
      return
    }
    setLoading(true)
    setError('')
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      })
      
      if (error) {
        setError(error.message)
      } else {
        setStep('otp')
        setCountdown(60)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const verifyOTP = async () => {
    if (otp.length !== 6) {
      setError('Enter the 6-digit code from your email')
      return
    }
    setLoading(true)
    setError('')
    
    try {
      // Add a timeout to prevent infinite loading on network/Supabase errors
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out. Please try again.')), 10000)
      })

      const response = await Promise.race([
        supabase.auth.verifyOtp({
          email,
          token: otp,
          type: 'email',
        }),
        timeoutPromise
      ]) as any
      
      const { data, error } = response
      
      if (error) {
        setError('Invalid or expired code. Try again.')
      } else {
        onSuccess(data.user)
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 bg-opacity-95 flex items-center justify-center z-[1000] p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#111118] border border-white/10 rounded-[2rem] p-8 w-full max-w-md relative overflow-hidden shadow-2xl"
      >
        {/* Background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#00F5A0]/10 rounded-full blur-3xl pointer-events-none" />
        
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-full transition-all"
        >
          <X size={20} />
        </button>
        
        <AnimatePresence mode="wait">
          {step === 'email' && (
            <motion.div
              key="email"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="w-14 h-14 bg-[#00F5A0]/10 rounded-2xl flex items-center justify-center mb-6 border border-[#00F5A0]/20 text-[#00F5A0]">
                <Mail size={28} />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Sign in to QueueLess</h2>
              <p className="text-slate-400 text-sm mb-8">Enter your email for a secure 6-digit code</p>
              
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => {
                      setEmail(e.target.value)
                      if (error) setError('')
                    }}
                    onKeyDown={e => e.key === 'Enter' && sendOTP()}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00F5A0] focus:ring-1 focus:ring-[#00F5A0] transition-all font-medium"
                    autoFocus
                  />
                </div>
                
                {error && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-rose-500 text-xs font-bold ml-1"
                  >
                    {error}
                  </motion.p>
                )}
                
                <button
                  onClick={sendOTP}
                  disabled={loading}
                  className="w-full group relative bg-[#00F5A0] text-[#0A0A0F] font-black py-4 rounded-2xl hover:shadow-[0_0_30px_rgba(0,245,160,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 overflow-hidden"
                >
                  {loading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>Send Code <ArrowRight size={18} /></>
                  )}
                </button>
                
                <p className="text-center text-[10px] uppercase font-black tracking-widest text-slate-600 mt-6">
                  No password required • Secure & Free
                </p>
              </div>
            </motion.div>
          )}

          {step === 'otp' && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="w-14 h-14 bg-[#00F5A0]/10 rounded-2xl flex items-center justify-center mb-6 border border-[#00F5A0]/20 text-[#00F5A0]">
                <ShieldCheck size={28} />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Check your email</h2>
              <p className="text-slate-400 text-sm mb-8">
                We sent a code to <span className="text-white font-bold">{email}</span>
              </p>
              
              <div className="space-y-6">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 6)
                    setOtp(val)
                    if (error) setError('')
                    if (val.length === 6) {
                      // We don't verify automatically here to give user control
                    }
                  }}
                  onKeyDown={e => e.key === 'Enter' && verifyOTP()}
                  className="w-full px-4 py-6 bg-white/5 border border-white/10 rounded-2xl text-[#00F5A0] text-4xl text-center font-black tracking-[0.5em] focus:outline-none focus:border-[#00F5A0] focus:ring-1 focus:ring-[#00F5A0] transition-all placeholder:text-white/5"
                  autoFocus
                />
                
                {error && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-rose-500 text-xs font-bold text-center"
                  >
                    {error}
                  </motion.p>
                )}
                
                <button
                  onClick={verifyOTP}
                  disabled={loading || otp.length < 6}
                  className="w-full bg-[#00F5A0] text-[#0A0A0F] font-black py-4 rounded-2xl hover:shadow-[0_0_30px_rgba(0,245,160,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    'Verify Code ✓'
                  )}
                </button>
                
                <div className="text-center pt-2">
                  <button
                    onClick={sendOTP}
                    disabled={countdown > 0}
                    className="text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
                    style={{ color: countdown > 0 ? '#6B7280' : '#00F5A0' }}
                  >
                    {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend code now'}
                  </button>
                </div>

                <div className="text-center pt-4 border-t border-white/5">
                  <button 
                    onClick={() => {
                      setStep('email')
                      setOtp('')
                      setError('')
                    }}
                    className="text-slate-500 text-xs font-bold hover:text-white transition-colors"
                  >
                    Use a different email
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
