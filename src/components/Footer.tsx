import Link from "next/link";
import { ArrowRight, Instagram, Twitter, Linkedin, Facebook, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 pt-24 pb-8 border-t border-slate-200 dark:border-slate-900 px-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12 mb-16 pb-12 md:pb-0">
        
        {/* Left: Brand */}
        <div className="md:w-1/3 flex flex-col items-start">
          <Link href="/" className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-500 to-rose-500 text-white flex items-center justify-center font-bold text-lg">
              Q
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
              QueueLess<span className="text-blue-600 dark:text-blue-500"> India</span>
            </span>
          </Link>
          <p className="font-medium text-slate-500 mb-8 leading-relaxed max-w-xs">
            Eliminating physical queues across India. Join the virtual queue revolution for hospitals, clinics, salons, and beyond.
          </p>
          <Link href="/dashboard" className="hidden md:inline-flex items-center gap-2 text-slate-900 dark:text-white font-bold hover:text-orange-500 dark:hover:text-orange-400 transition-colors group">
            Start using QueueLess today <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Center: Links */}
        <div className="md:w-1/3 flex flex-col md:items-center">
          <div className="w-full md:w-auto">
            <h4 className="text-slate-900 dark:text-white font-bold mb-6 tracking-wide uppercase text-sm">Product & Company</h4>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 font-medium text-sm">
              <Link href="#how-it-works" className="hover:text-slate-900 dark:hover:text-white transition-colors">How it works</Link>
              <Link href="/pricing" className="hover:text-slate-900 dark:hover:text-white transition-colors">Pricing</Link>
              <Link href="/dashboard" className="hover:text-slate-900 dark:hover:text-white transition-colors">For Businesses</Link>
              <Link href="/about" className="hover:text-slate-900 dark:hover:text-white transition-colors">About Us</Link>
              <Link href="/contact" className="hover:text-slate-900 dark:hover:text-white transition-colors">Contact</Link>
              <Link href="/policies" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Policy</Link>
            </div>
          </div>
        </div>

        {/* Right: Social Media */}
        <div className="md:w-1/3 flex flex-col md:items-end mt-4 md:mt-0">
          <h4 className="text-slate-900 dark:text-white font-bold mb-6 tracking-wide uppercase text-sm">Connect with us</h4>
          <div className="flex flex-wrap gap-4">
            <a href="https://instagram.com/queueless" target="_blank" rel="noopener noreferrer" className="w-12 h-12 md:w-10 md:h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-pink-500 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 active:scale-95">
              <Instagram size={20} />
            </a>
            <a href="https://twitter.com/queueless" target="_blank" rel="noopener noreferrer" className="w-12 h-12 md:w-10 md:h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-sky-500 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 active:scale-95">
              <Twitter size={20} />
            </a>
            <a href="https://linkedin.com/company/queueless" target="_blank" rel="noopener noreferrer" className="w-12 h-12 md:w-10 md:h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-blue-700 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 active:scale-95">
              <Linkedin size={20} />
            </a>
            <a href="https://facebook.com/queueless" target="_blank" rel="noopener noreferrer" className="w-12 h-12 md:w-10 md:h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 active:scale-95">
              <Facebook size={20} />
            </a>
            <a href="https://youtube.com/@queueless" target="_blank" rel="noopener noreferrer" className="w-12 h-12 md:w-10 md:h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-red-500 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 active:scale-95">
              <Youtube size={20} />
            </a>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-200 dark:border-slate-800 text-center font-medium text-sm text-slate-500 dark:text-slate-600">
        &copy; {new Date().getFullYear()} QueueLess India. All rights reserved. Built for India.
      </div>
    </footer>
  );
}
