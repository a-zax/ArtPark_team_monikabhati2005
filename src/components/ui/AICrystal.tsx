'use client';

import { Float, Icosahedron, MeshDistortMaterial } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

export default function AICrystal() {
  return (
    <div className="absolute right-0 top-1/2 hidden h-[400px] w-[400px] translate-x-20 -translate-y-1/2 pointer-events-none -z-10 opacity-60 lg:block">
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
