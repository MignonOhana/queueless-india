'use client'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'

export function GoogleSignInButton({ redirectTo = '/dashboard', role = 'customer' }: { redirectTo?: string; role?: string }) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      // Detect if running as installed PWA (standalone mode)
      const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true

      // Always use the Vercel production URL as redirect origin
      // This ensures the callback works even from PWA on Android
      const origin = 'https://queueless-india.vercel.app'
      const callbackUrl = `${origin}/auth/callback?next=${redirectTo}&role=${role}`

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          // Skip browser redirect — we'll handle it manually for PWA support
          skipBrowserRedirect: isPWA,
        },
      })

      if (error) {
        console.error('Google sign in error:', error)
        setLoading(false)
        return
      }

      // For PWA: manually redirect to the OAuth URL so Android Chrome
      // handles it correctly and returns to the PWA after login
      if (isPWA && data?.url) {
        window.location.href = data.url
      }
      // For normal browser: Supabase handles the redirect automatically
    } catch (err) {
      console.error('Google sign in error:', err)
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={loading}
      className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-white text-zinc-900 border border-zinc-200 rounded-2xl font-bold text-sm hover:bg-zinc-50 hover:border-zinc-300 active:scale-[0.98] transition-all shadow-sm group disabled:opacity-70"
    >
      {loading ? (
        <Loader2 size={20} className="animate-spin text-zinc-500" />
      ) : (
        /* Google SVG icon */
        <svg width="20" height="20" viewBox="0 0 24 24" className="group-hover:scale-110 transition-transform">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      )}
      {loading ? 'Opening Google...' : 'Continue with Google'}
    </button>
  )
}
