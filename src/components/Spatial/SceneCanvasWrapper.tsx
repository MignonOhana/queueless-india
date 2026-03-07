"use client";

import dynamic from "next/dynamic";

// We must wrap this in a Client Component because layout.tsx is a Server Component,
// and Next.js 14+ explicitly forbids `ssr: false` inside Server Components.
const SceneCanvas = dynamic(() => import("@/components/Spatial/SceneCanvas"), { ssr: false });

export default function SceneCanvasWrapper({ className }: { className?: string }) {
  return <SceneCanvas className={className} />;
}
