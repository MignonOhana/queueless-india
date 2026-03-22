"use client";

import React from "react";
import { usePathname } from "next/navigation";
import PwaInstallBanner from "@/components/PwaInstallBanner";
import PwaRegistration from "@/components/PwaRegistration";
import { WebVitals } from "@/components/WebVitals";
import MobileNav from "@/components/MobileNav";
import PageTransition from "@/components/ui/PageTransition";
import GlobalTurnAlert from "@/components/GlobalTurnAlert";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const noSidebarRoutes = ['/', '/about', '/pricing', '/contact', '/login', '/register', '/onboarding'];
  const isNoSidebar = 
    noSidebarRoutes.includes(pathname) || 
    pathname.startsWith('/b/') || 
    pathname.startsWith('/display') || 
    pathname.startsWith('/tv') ||
    pathname.startsWith('/customer/queue/') ||
    pathname.startsWith('/track/');

  return (
    <>
      <GlobalTurnAlert />
      <div className="flex flex-1">
        <main className={`flex-1 transition-all duration-300 ${isNoSidebar ? '' : 'md:pl-64'}`}>
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
      <PwaInstallBanner />
      <PwaRegistration />
      <WebVitals />
      {!isNoSidebar && <MobileNav />}
    </>
  );
}
