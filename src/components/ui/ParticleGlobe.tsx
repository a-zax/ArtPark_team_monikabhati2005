"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function RotatingGlobe() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.15;
      meshRef.current.rotation.x += delta * 0.05;
    }
  });

  return (
    <Sphere ref={meshRef} args={[2.5, 48, 48]}>
      <meshStandardMaterial 
        color="#8b5cf6"
        wireframe={true}
        transparent
        opacity={0.3}
      />
    </Sphere>
  );
}

export default function ParticleGlobe() {
  return (
    <div className="absolute right-0 -top-20 w-[600px] h-[600px] -z-10 opacity-30 pointer-events-none overflow-hidden hidden md:block">
      <Canvas camera={{ position: [0, 0, 6] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} color="#3b82f6" />
        <RotatingGlobe />
      </Canvas>
    </div>
  );
}
