import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Group } from 'three';

function EnergyRings() {
  const group = useRef<Group>(null);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.z += delta * 0.08;
  });

  return (
    <group ref={group} rotation={[1.15, 0.15, 0]}>
      <mesh>
        <torusGeometry args={[2.6, 0.022, 10, 130]} />
        <meshBasicMaterial color="#55d8ff" transparent opacity={0.62} />
      </mesh>
      <mesh rotation={[0, 0, 0.28]}>
        <torusGeometry args={[2.05, 0.019, 10, 130]} />
        <meshBasicMaterial color="#af8cff" transparent opacity={0.52} />
      </mesh>
      <mesh rotation={[0, 0, -0.3]}>
        <torusGeometry args={[3.04, 0.014, 10, 130]} />
        <meshBasicMaterial color="#ffd27b" transparent opacity={0.28} />
      </mesh>
    </group>
  );
}

// 実際のWebGL 3D装飾。キャラは試作段階では2D立ち絵。
export default function OrbitalAura() {
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 8], fov: 48 }} gl={{ alpha: true, antialias: true }}>
      <EnergyRings />
    </Canvas>
  );
}