import withPWAInit from "@ducanh2912/next-pwa";
import type { NextConfig } from "next";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
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
