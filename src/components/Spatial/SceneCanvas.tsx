"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, PerspectiveCamera } from "@react-three/drei";
import { Suspense, useRef } from "react";
import * as THREE from "three";

// Mouse-tracking camera rig for subtle parallax depth
function CameraRig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!group.current) return;
    // Lerp the camera group towards the mouse coordinates (-1 to +1)
    const targetX = (state.pointer.x * Math.PI) / 20;
    const targetY = (state.pointer.y * Math.PI) / 20;
    
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetX, 0.05);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -targetY, 0.05);
  });

  return <group ref={group}>{children}</group>;
}

export default function SceneCanvas({ children, className = "" }: { children?: React.ReactNode, className?: string }) {
  return (
    <div className={`fixed inset-0 z-0 pointer-events-none ${className}`}>
      <Canvas dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={45} />
        
        {/* Soft studio lighting optimized for glass refraction */}
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#f97316" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#3b82f6" />
        <Environment preset="city" />

        <Suspense fallback={null}>
          <CameraRig>
             {children}
          </CameraRig>
        </Suspense>
      </Canvas>
    </div>
  );
}
