import Link from 'next/link';
import { SearchX, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
      
      <div className="glass-panel p-8 md:p-12 rounded-3xl max-w-lg w-full text-center space-y-6 relative z-10 border border-white/10 shadow-2xl bg-opacity-95">
        <div className="mx-auto w-20 h-20 bg-rose-500/20 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(244,63,94,0.3)] mb-6">
          <SearchX className="w-10 h-10 text-rose-500" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-br from-indigo-400 via-purple-400 to-rose-400 bg-clip-text text-transparent">
          404
        </h1>
        <h2 className="text-2xl font-bold text-foreground">Page Not Found</h2>
        
        <p className="text-muted-foreground text-lg">
          We couldn't find the page you're looking for. It might have been moved, or the link is broken.
        </p>

        <div className="pt-4">
          <Link 
            href="/home" 
            className="group inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-full font-bold transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]"
          >
            Return Home
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
