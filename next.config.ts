import withPWAInit from "@ducanh2912/next-pwa";
import type { NextConfig } from "next";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    skipWaiting: true,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/vodqvokicxfnxkoqbfte\.supabase\.co\/rest\//,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'supabase-api',
          expiration: { maxEntries: 50, maxAgeSeconds: 300 }
        }
      },
      {
        urlPattern: /\.(png|jpg|jpeg|svg|gif|webp)$/,
        handler: 'CacheFirst',
        options: { cacheName: 'images', expiration: { maxAgeSeconds: 86400 } }
      }
    ]
  }
});

const nextConfig: NextConfig = {
  transpilePackages: [
    'react-map-gl', 
    '@deck.gl/react', 
    '@deck.gl/layers', 
    '@deck.gl/aggregation-layers', 
    'mapbox-gl'
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
      { protocol: 'https', hostname: '*.supabase.co' }
    ],
  },
  turbopack: {},
};

export default withPWA(nextConfig);
