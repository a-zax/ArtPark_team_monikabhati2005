"use client";
import { Canvas } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";

export default function HeroConstellation() {
  return (
    <div className="absolute inset-0 -z-10 w-full h-full opacity-60 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 10] }}>
        <Sparkles count={800} scale={25} size={1.5} speed={0.4} opacity={0.3} color="#3b82f6" noise={0.1} />
        <Sparkles count={400} scale={25} size={2.5} speed={0.6} opacity={0.4} color="#8b5cf6" noise={0.2} />
        <Sparkles count={100} scale={25} size={3} speed={0.8} opacity={0.5} color="#10b981" noise={0.3} />
      </Canvas>
    </div>
  );
}
