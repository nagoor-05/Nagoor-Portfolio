import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls } from "@react-three/drei";
import { useRef } from "react";

function Mark({ compact = false }) {
  const group = useRef(null);

  useFrame((_, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.28;
      group.current.rotation.x = Math.sin(Date.now() * 0.0008) * 0.07;
    }
  });

  return (
    <Float speed={1.8} rotationIntensity={0.25} floatIntensity={compact ? 0.18 : 0.38}>
      <group ref={group} scale={compact ? 0.76 : 1}>
        <mesh position={[-0.72, 0, 0]}>
          <boxGeometry args={[0.34, 2.38, 0.34]} />
          <meshStandardMaterial color="#a779ff" emissive="#4a219e" metalness={0.72} roughness={0.18} />
        </mesh>
        <mesh position={[0.72, 0, 0]}>
          <boxGeometry args={[0.34, 2.38, 0.34]} />
          <meshStandardMaterial color="#00CEA8" emissive="#007866" metalness={0.7} roughness={0.2} />
        </mesh>
        <mesh rotation={[0, 0, -0.55]} position={[0, 0, 0.03]}>
          <boxGeometry args={[0.36, 2.78, 0.36]} />
          <meshStandardMaterial color="#915EFF" emissive="#462197" metalness={0.75} roughness={0.16} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.18, 0]}>
          <torusGeometry args={[1.8, 0.035, 16, 160]} />
          <meshStandardMaterial color="#00CEA8" emissive="#00CEA8" emissiveIntensity={0.35} />
        </mesh>
      </group>
    </Float>
  );
}

export default function Logo3D({ compact = false }) {
  return (
    <div className={compact ? "logo3d compact" : "logo3d"}>
      <Canvas camera={{ position: [0, 0, 5.2], fov: 45 }} dpr={[1, 1.6]}>
        <ambientLight intensity={0.85} />
        <pointLight position={[4, 5, 6]} intensity={6} color="#915EFF" />
        <pointLight position={[-4, -2, 4]} intensity={5} color="#00CEA8" />
        <Mark compact={compact} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.45} />
      </Canvas>
    </div>
  );
}
