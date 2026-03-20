"use client";
import { Canvas } from "@react-three/fiber";
import { Float, Icosahedron, MeshDistortMaterial } from "@react-three/drei";

export default function AICrystal() {
  return (
    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[400px] h-[400px] pointer-events-none opacity-60 hidden lg:block -z-10 translate-x-20">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1.5} color="#3b82f6" />
        <directionalLight position={[-10, -10, -10]} intensity={1} color="#10b981" />
        
        <Float speed={2.5} rotationIntensity={1.5} floatIntensity={2.5}>
          <Icosahedron args={[1.6, 0]}>
            <MeshDistortMaterial 
              color="#8b5cf6" 
              attach="material" 
              distort={0.4} 
              speed={2.5} 
              roughness={0.1}
              metalness={0.8}
              transparent
              opacity={0.8}
            />
          </Icosahedron>
        </Float>
      </Canvas>
    </div>
  );
}
