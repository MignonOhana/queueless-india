import type { Metadata } from "next";
import { Inter, Outfit, JetBrains_Mono } from "next/font/google";
import "@/styles/tokens.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import OfflineBanner from "@/components/OfflineBanner";
import SmoothScroll from "@/components/SmoothScroll";
import MobileNav from "@/components/MobileNav";
import { Toaster } from "sonner";
import PwaInstallBanner from "@/components/PwaInstallBanner";
import PwaRegistration from "@/components/PwaRegistration";
import { WebVitals } from "@/components/WebVitals";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import PageTransition from "@/components/ui/PageTransition";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://queueless-india.vercel.app'),
  title: {
    default: 'QueueLess India — Skip the Queue at Hospitals, Banks & Temples',
    template: '%s | QueueLess India',
  },
  description: 'Join queues digitally at hospitals, banks, temples, and government offices across India. No more waiting in line. Get your token on your phone.',
  keywords: ['queue management india', 'skip hospital queue', 'digital token system', 'hospital OPD queue online', 'bank queue token', 'temple darshan queue'],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://queueless-india.vercel.app',
    siteName: 'QueueLess India',
    title: 'QueueLess India — Skip the Queue',
    description: 'Join queues digitally across India. No more waiting in line.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'QueueLess India' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QueueLess India — Skip the Queue',
    description: 'Join queues digitally. No more waiting in line.',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://queueless-india.vercel.app' },
  applicationName: "QueueLess India",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "QueueLess",
  },
  icons: {
    icon: "/favicon.png",
    apple: "/icons/icon-192.png",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
  }
};

const UmamiScript = () => {
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  if (!websiteId) return null;
  return (
    <script
      defer
      src="https://cloud.umami.is/script.js"
      data-website-id={websiteId}
    />
  );
};

export const viewport = {
  themeColor: "#00F5A0",
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
      <head>
        <UmamiScript />
      </head>
      <body className={`${inter.variable} ${outfit.variable} ${jetbrainsMono.variable} antialiased font-sans bg-[#0A0A0F] text-[#F0F0F8] transition-colors duration-300 relative`} suppressHydrationWarning>
        
        <AnimatedBackground />
        
        <div className="relative z-10 min-h-screen flex flex-col">
          <OfflineBanner />
          <SmoothScroll>
            <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false}>
              <LanguageProvider>
                <AuthProvider>
                  <Toaster position="top-center" expand={false} richColors theme="dark" />
                  <div className="flex flex-1">
                    <main className="flex-1 md:pl-64 transition-all duration-300">
                      <PageTransition>
                        {children}
                      </PageTransition>
                    </main>
                  </div>
                  <PwaInstallBanner />
                  <PwaRegistration />
                  <WebVitals />
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
