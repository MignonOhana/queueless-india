import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import OfflineBanner from "@/components/OfflineBanner";
import SmoothScroll from "@/components/SmoothScroll";
import SceneCanvasWrapper from "@/components/Spatial/SceneCanvasWrapper";
import MobileNav from "@/components/MobileNav";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QueueLess India",
  description: "Join queues digitally and arrive only when your turn is near.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "QueueLess",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: "#0ea5e9",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased font-sans bg-background text-foreground transition-colors duration-300 relative`} suppressHydrationWarning>
        
        {/* Phase 8: Global Ambient Spatial WebGL Canvas */}
        <SceneCanvasWrapper className="opacity-40 mix-blend-screen" />
        
        <div className="relative z-10">
          <OfflineBanner />
          <SmoothScroll>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <LanguageProvider>
                <AuthProvider>
                  {children}
                  <PWAInstallPrompt />
                  <MobileNav />
                </AuthProvider>
              </LanguageProvider>
            </ThemeProvider>
          </SmoothScroll>
        </div>
      </body>
    </html>
  );
}
