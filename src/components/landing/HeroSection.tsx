"use client";

import { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Points, PointMaterial } from "@react-three/drei";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────────────────

function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

// ─── 3D COMPONENTS ──────────────────────────────────────────────────────────

/** Simple stick figure made from box/sphere geometries */
function StickFigure({
  position,
  color,
  scale = 1,
  animate = false,
}: {
  position: [number, number, number];
  color: string;
  scale?: number;
  animate?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const t = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    t.current += delta;
    if (animate) {
      groupRef.current.position.y = position[1] + Math.sin(t.current * 1.5) * 0.08;
      groupRef.current.rotation.y = Math.sin(t.current * 0.5) * 0.3;
    }
  });

  const mat = new THREE.MeshStandardMaterial({ color, metalness: 0.2, roughness: 0.7 });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Head */}
      <mesh material={mat}>
        <sphereGeometry args={[0.12, 12, 12]} />
      </mesh>
      {/* Body */}
      <mesh position={[0, -0.28, 0]} material={mat}>
        <boxGeometry args={[0.12, 0.36, 0.1]} />
      </mesh>
      {/* Left arm */}
      <mesh position={[-0.18, -0.22, 0]} rotation={[0, 0, 0.8]} material={mat}>
        <boxGeometry args={[0.28, 0.07, 0.07]} />
      </mesh>
      {/* Right arm */}
      <mesh position={[0.18, -0.22, 0]} rotation={[0, 0, -0.8]} material={mat}>
        <boxGeometry args={[0.28, 0.07, 0.07]} />
      </mesh>
      {/* Left leg */}
      <mesh position={[-0.09, -0.58, 0]} rotation={[0, 0, 0.15]} material={mat}>
        <boxGeometry args={[0.08, 0.38, 0.08]} />
      </mesh>
      {/* Right leg */}
      <mesh position={[0.09, -0.58, 0]} rotation={[0, 0, -0.15]} material={mat}>
        <boxGeometry args={[0.08, 0.38, 0.08]} />
      </mesh>
      {/* Phone in hand (happy side) */}
      {animate && (
        <mesh position={[0.34, -0.22, 0.06]} material={new THREE.MeshStandardMaterial({ color: "#00F5A0", emissive: "#00F5A0", emissiveIntensity: 0.5 })}>
          <boxGeometry args={[0.1, 0.16, 0.03]} />
        </mesh>
      )}
    </group>
  );
}

/** Old way: red stressed humans queued in a straight line */
function OldWayQueue() {
  return (
    <group position={[-2.2, 0, 0]}>
      {/* Queue line */}
      <mesh position={[0.7, -0.8, 0]}>
        <boxGeometry args={[2.2, 0.05, 0.05]} />
        <meshStandardMaterial color="#ef4444" opacity={0.4} transparent />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <StickFigure
          key={i}
          position={[i * 0.55 - 0.3, 0, 0]}
          color="#ef4444"
          scale={0.8}
        />
      ))}
      {/* Label */}
      <mesh position={[0.8, 1.3, 0]}>
        <boxGeometry args={[1.8, 0.35, 0.05]} />
        <meshStandardMaterial color="#991b1b" />
      </mesh>
    </group>
  );
}

/** New way: green happy humans spread freely */
function NewWayFree() {
  const positions: [number, number, number][] = [
    [0.1, 0.4, 0.3],
    [0.7, -0.3, -0.2],
    [-0.2, -0.5, 0.4],
    [0.5, 0.3, -0.5],
    [-0.4, 0.2, -0.3],
  ];
  return (
    <group position={[2.2, 0, 0]}>
      {positions.map((pos, i) => (
        <StickFigure key={i} position={pos} color="#10b981" scale={0.8} animate />
      ))}
    </group>
  );
}

/** Floating QR code panel in the centre */
function QRPanel({ scrollProgress }: { scrollProgress: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const t = useRef(0);

  useFrame((_, delta) => {
    t.current += delta;
    if (!meshRef.current) return;
    meshRef.current.rotation.y = Math.sin(t.current * 0.4) * 0.25;
    meshRef.current.position.y = Math.sin(t.current * 0.6) * 0.12;
    if (glowRef.current) {
      (glowRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.5 + Math.sin(t.current * 2) * 0.3;
    }
    // Scale up on scroll
    const sc = 1 + scrollProgress * 2;
    meshRef.current.scale.setScalar(sc);
  });

  return (
    <group>
      {/* Glow ring */}
      <mesh ref={glowRef} position={[0, 0, -0.05]}>
        <torusGeometry args={[0.68, 0.04, 8, 60]} />
        <meshStandardMaterial color="#00F5A0" emissive="#00F5A0" emissiveIntensity={0.8} />
      </mesh>

      {/* QR frame panel */}
      <mesh ref={meshRef}>
        <boxGeometry args={[1.2, 1.2, 0.04]} />
        <meshStandardMaterial color="#0a0a0f" metalness={0.6} roughness={0.2} />
      </mesh>

      {/* QR pixel grid (simple 4×4 approximation) */}
      {[-1, 0, 1].map((row) =>
        [-1, 0, 1].map((col) => {
          const on = (row + col + 3) % 2 === 0;
          if (!on) return null;
          return (
            <mesh key={`${row}-${col}`} position={[col * 0.28, row * 0.28, 0.05]}>
              <boxGeometry args={[0.22, 0.22, 0.04]} />
              <meshStandardMaterial color="#00F5A0" emissive="#00F5A0" emissiveIntensity={0.6} />
            </mesh>
          );
        })
      )}
      {/* Corner finders */}
      {[
        [-0.42, 0.42],
        [0.42, 0.42],
        [-0.42, -0.42],
      ].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.05]}>
          <boxGeometry args={[0.22, 0.22, 0.04]} />
          <meshStandardMaterial color="#00F5A0" emissive="#00F5A0" emissiveIntensity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

/** Floating ambient particles */
function ParticleCloud() {
  const count = 400;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = randomInRange(-6, 6);
    positions[i * 3 + 1] = randomInRange(-4, 4);
    positions[i * 3 + 2] = randomInRange(-5, 5);
  }

  const pointsRef = useRef<THREE.Points>(null);
  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y += delta * 0.05;
    pointsRef.current.rotation.x += delta * 0.02;
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#00F5A0" size={0.025} sizeAttenuation depthWrite={false} opacity={0.5} />
    </Points>
  );
}

/** Invisible plane for scroll-based camera rig */
function CameraRig({ scrollProgress }: { scrollProgress: number }) {
  const { camera } = useThree();
  const baseZ = 6;
  useFrame(() => {
    const targetZ = baseZ - scrollProgress * 4.5;
    camera.position.z += (targetZ - camera.position.z) * 0.08;
    const targetY = scrollProgress * -0.4;
    camera.position.y += (targetY - camera.position.y) * 0.08;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

// ─── 3D SCENE ───────────────────────────────────────────────────────────────
function Scene({ scrollProgress }: { scrollProgress: number }) {
  return (
    <>
      <color attach="background" args={["#0A0A0F"]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} color="#ffffff" />
      <pointLight position={[0, 0, 2]} intensity={2} color="#00F5A0" distance={6} />
      <pointLight position={[-3, 2, 1]} intensity={0.8} color="#4f46e5" distance={8} />

      <CameraRig scrollProgress={scrollProgress} />
      <OrbitControls
        autoRotate
        autoRotateSpeed={0.4}
        enableZoom={false}
        enablePan={false}
        maxPolarAngle={Math.PI * 0.65}
        minPolarAngle={Math.PI * 0.35}
      />

      <ParticleCloud />
      <OldWayQueue />
      <QRPanel scrollProgress={scrollProgress} />
      <NewWayFree />

      {/* Divider */}
      <mesh position={[0, 0, -0.2]}>
        <boxGeometry args={[0.03, 3.5, 0.03]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
    </>
  );
}

// ─── SKELETON LOADER ─────────────────────────────────────────────────────────
function HeroSkeleton() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#0A0A0F]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-24 h-24 rounded-full border-2 border-[#00F5A0]/30 border-t-[#00F5A0] animate-spin" />
        <p className="text-[#00F5A0]/60 text-sm font-bold tracking-widest uppercase">Loading 3D Scene</p>
      </div>
    </div>
  );
}

// ─── MOBILE FALLBACK ─────────────────────────────────────────────────────────
function MobileFallback() {
  const figures = [
    { x: "15%", delay: 0, color: "#10b981" },
    { x: "35%", delay: 0.2, color: "#10b981" },
    { x: "55%", delay: 0.4, color: "#6366f1" },
    { x: "75%", delay: 0.6, color: "#10b981" },
  ];

  return (
    <div className="absolute inset-0 bg-[#0A0A0F] overflow-hidden flex items-center justify-center">
      {/* Particle dots */}
      {Array.from({ length: 30 }, (_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-[#00F5A0]/40"
          style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
          animate={{ y: [-10, 10, -10], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
        />
      ))}

      {/* People figures CSS */}
      <div className="relative w-full max-w-xs flex justify-center items-end gap-6 pb-8">
        {figures.map((f, i) => (
          <motion.div
            key={i}
            className="flex flex-col items-center gap-1"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: [0, -8, 0], opacity: 1 }}
            transition={{ y: { duration: 2, repeat: Infinity, delay: f.delay }, opacity: { duration: 0.5 } }}
          >
            <div className="w-5 h-5 rounded-full border-2" style={{ borderColor: f.color }} />
            <div className="w-3 h-8 rounded" style={{ backgroundColor: f.color + "55" }} />
          </motion.div>
        ))}
      </div>

      {/* Glowing QR */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <div className="w-28 h-28 border-2 border-[#00F5A0]/50 rounded-xl flex items-center justify-center shadow-[0_0_40px_rgba(0,245,160,0.2)]">
          <div className="grid grid-cols-3 gap-1 p-2 w-full h-full">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="rounded-sm"
                style={{ backgroundColor: [0, 2, 6, 8].includes(i) ? "#00F5A0" : i % 2 === 0 ? "#00F5A060" : "transparent" }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── FLOATING STAT BADGES ────────────────────────────────────────────────────
const STATS = [
  { label: "2,400+", sub: "businesses", delay: 0.8, x: "-5%", y: "30%" },
  { label: "18 min", sub: "avg wait saved", delay: 1.0, x: "73%", y: "22%" },
  { label: "50+ Cities", sub: "Mumbai · Delhi · Bangalore", delay: 1.2, x: "5%", y: "72%" },
];

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    return scrollYProgress.on("change", (v) => setScrollProgress(v));
  }, [scrollYProgress]);

  const textY = useTransform(scrollYProgress, [0, 0.5], [0, -80]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative h-[100svh] min-h-[650px] overflow-hidden bg-[#0A0A0F]"
    >
      {/* ── 3D Canvas ── */}
      <div className="absolute inset-0">
        {isMobile ? (
          <MobileFallback />
        ) : (
          <Suspense fallback={<HeroSkeleton />}>
            <Canvas
              camera={{ position: [0, 0, 6], fov: 55 }}
              dpr={[1, 1.5]}
              gl={{ antialias: true, alpha: false }}
              performance={{ min: 0.5 }}
            >
              <Scene scrollProgress={scrollProgress} />
            </Canvas>
          </Suspense>
        )}
      </div>

      {/* ── Gradient overlay (bottom fade into sections below) ── */}
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#0A0A0F] to-transparent pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-[#0A0A0F] to-transparent pointer-events-none opacity-60" />

      {/* ── Text Overlay ── */}
      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center pointer-events-none z-10"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 bg-opacity-95 text-sm font-bold text-slate-300 mb-6"
        >
          <span>🇮🇳</span> Built for Bharat
          <span className="w-1.5 h-1.5 rounded-full bg-[#00F5A0] animate-pulse" />
        </motion.div>

        {/* H1 */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-5xl sm:text-7xl lg:text-[90px] font-black tracking-tighter text-white leading-none mb-6 max-w-4xl"
        >
          No Queue.{" "}
          <span
            className="text-transparent"
            style={{ WebkitTextStroke: "2px #00F5A0" }}
          >
            Just Arrive.
          </span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-lg text-slate-400 max-w-xl mb-10 leading-relaxed font-medium"
        >
          AI-powered virtual queues for hospitals, salons, banks &amp; government offices. Join from anywhere. Walk in when it's your turn.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="flex flex-col sm:flex-row gap-4 items-center pointer-events-auto"
        >
          <Link
            href="/register"
            className="group px-8 py-4 rounded-full font-black text-base text-black flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(0,245,160,0.35)]"
            style={{ background: "linear-gradient(135deg, #00F5A0, #00D4FF)" }}
          >
            Start Free — No Credit Card
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>

          <button
            onClick={() => setShowVideoModal(true)}
            className="px-7 py-4 rounded-full font-bold text-base text-white border border-white/20 bg-white/5 bg-opacity-95 flex items-center gap-2 hover:bg-white/10 hover:border-white/30 active:scale-95 transition-all"
          >
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <Play size={12} fill="white" />
            </div>
            Watch 60-second Demo
          </button>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 flex flex-col items-center gap-2 opacity-40"
        >
          <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">Scroll to explore</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-5 h-8 rounded-full border border-slate-600 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-slate-400" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* ── Floating Stat Badges ── */}
      {STATS.map((stat) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: stat.delay }}
          style={{ left: stat.x, top: stat.y }}
          className="absolute z-20 bg-white/5 border border-white/10 bg-opacity-95 rounded-2xl px-4 py-3 hidden sm:block pointer-events-none"
        >
          <p className="text-white font-black text-lg leading-tight">{stat.label}</p>
          <p className="text-slate-400 text-xs font-medium">{stat.sub}</p>
        </motion.div>
      ))}

      {/* ── Video Modal ── */}
      <AnimatePresence>
        {showVideoModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowVideoModal(false)}
              className="absolute inset-0 bg-black/90 bg-opacity-95"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative z-10 w-full max-w-3xl bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
              {/* Mock video placeholder */}
              <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col items-center justify-center gap-4">
                <div className="w-20 h-20 rounded-full bg-[#00F5A0]/20 border border-[#00F5A0]/30 flex items-center justify-center">
                  <Play size={32} className="text-[#00F5A0]" fill="currentColor" />
                </div>
                <p className="text-slate-400 font-medium">Demo video coming soon</p>
              </div>
              <div className="p-6 flex justify-between items-center">
                <p className="text-white font-bold">QueueLess India — 60 Second Overview</p>
                <button onClick={() => setShowVideoModal(false)} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-slate-300 hover:bg-white/10">
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
