"use client";

import { useFrame } from "@react-three/fiber";
import { Center, MeshTransmissionMaterial, Text3D } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

interface HolographicTokenProps {
  tokenNumber: string;
  position?: [number, number, number];
  scale?: number;
  color?: string; // "orange" | "blue" etc.
}

export default function HolographicToken({ tokenNumber = "OPD-021", position = [0, 0, 0], scale = 1, color = "#f97316" }: HolographicTokenProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const textRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!meshRef.current || !textRef.current) return;
    
    // Slow, zero-gravity rotation for the holographic vibe
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.y = Math.sin(time * 0.5) * 0.2;
    meshRef.current.rotation.x = Math.cos(time * 0.3) * 0.1;

    // Apply the same rotation to the embedded text so they move together
    textRef.current.rotation.copy(meshRef.current.rotation);
  });

  return (
    <group position={position} scale={scale}>

      {/* Embedded 3D Text inside the Glass */}
      <group ref={textRef} position={[0, -0.6, 0.4]}>
         <Center>
           <Text3D 
              font="/fonts/inter_bold.json" 
              size={1.2} 
              height={0.2} 
              curveSegments={12} 
              bevelEnabled 
              bevelThickness={0.02} 
              bevelSize={0.02}
            >
             {tokenNumber}
             <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.1} metalness={0.8} />
           </Text3D>
         </Center>
      </group>

      {/* The Physical Glass Block */}
      <mesh ref={meshRef}>
        <boxGeometry args={[6, 3, 0.5]} />
        <MeshTransmissionMaterial 
           backside
           samples={4} 
           thickness={2} 
           chromaticAberration={0.1} 
           anisotropy={0.2} 
           distortion={0.5} 
           distortionScale={0.5} 
           temporalDistortion={0.1} 
           clearcoat={1} 
           attenuationDistance={1} 
           attenuationColor="#ffffff" 
           color="#e2e8f0" 
        />
      </mesh>

    </group>
  );
}
