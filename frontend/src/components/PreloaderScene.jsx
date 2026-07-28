import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";

export function PreloaderScene({
  compact = false,
  entry = false,
  autoRotate = false,
  autoSpin = false,
  freeRotate = false,
  showPlatform = false,
  interactive = false,
}) {
  const nGroup = useRef();
  const orbitGroup = useRef();
  const orbit1 = useRef();
  const light1 = useRef();
  const light2 = useRef();
  const platform = useRef();
  const targetRotation = useRef({ x: 0, y: 0, z: 0 });
  const dragState = useRef({ active: false, moved: false, lastX: 0, lastY: 0 });
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const tiltPower = compact ? 0.16 : 0.12;
    const tiltX = -state.pointer.y * tiltPower;
    const tiltY = state.pointer.x * tiltPower;

    if (nGroup.current) {
      void autoRotate;
      if (autoSpin && !dragState.current.active) {
        targetRotation.current.y += delta * 0.32;
      }

      const idleX = autoSpin ? Math.sin(time * 0.7) * 0.18 : tiltX;
      const idleZ = autoSpin ? Math.sin(time * 0.55) * 0.06 : Math.sin(time * 0.85) * (entry ? 0.024 : 0.018);
      nGroup.current.rotation.x += (targetRotation.current.x + idleX - nGroup.current.rotation.x) * 0.08;
      nGroup.current.rotation.y += (targetRotation.current.y + tiltY - nGroup.current.rotation.y) * 0.09;
      nGroup.current.rotation.z += (targetRotation.current.z + idleZ - nGroup.current.rotation.z) * 0.08;

      const baseScale = hovered ? 1.035 : 1;
      nGroup.current.scale.setScalar(baseScale);
      nGroup.current.position.y = yOffset + Math.sin(time * 0.9) * (compact ? 0.05 : 0.075);
    }

    if (orbitGroup.current) {
      orbitGroup.current.position.y = yOffset + Math.sin(time * 0.9) * (compact ? 0.025 : 0.04);
      if (nGroup.current) {
        orbitGroup.current.rotation.x += (nGroup.current.rotation.x - orbitGroup.current.rotation.x) * 0.12;
        orbitGroup.current.rotation.y += (nGroup.current.rotation.y - orbitGroup.current.rotation.y) * 0.12;
        orbitGroup.current.rotation.z += (nGroup.current.rotation.z - orbitGroup.current.rotation.z) * 0.12;
      }
    }

    if (orbit1.current) orbit1.current.rotation.z += delta * 0.48;
    if (platform.current) platform.current.rotation.y += delta * 0.08;

    const points = [
      [light1, compact ? 2.2 : 2.85, time * 0.58, 0.15],
      [light2, compact ? 2.2 : 2.85, time * 0.58, 3.25],
    ];

    points.forEach(([ref, radius, angle, offset]) => {
      if (!ref.current) return;
      ref.current.position.set(
        Math.cos(angle + offset) * radius,
        Math.sin(angle + offset) * 0.44,
        Math.sin(angle + offset) * radius * 0.26
      );
    });
  });

  const scale = compact ? 0.66 : entry ? 0.84 : 0.92;
  const yOffset = compact ? 0.08 : 0;
  const handleClick = (event) => {
    if (!interactive) return;
    event.stopPropagation();
    if (dragState.current.moved) {
      dragState.current.moved = false;
      return;
    }
    targetRotation.current.y += Math.PI * 2;
    if (freeRotate) {
      targetRotation.current.x += Math.PI * 0.18;
      targetRotation.current.z += Math.PI * 0.08;
    }
  };
  const handlePointerDown = (event) => {
    if (!interactive || !freeRotate) return;
    event.stopPropagation();
    dragState.current = { active: true, moved: false, lastX: event.clientX, lastY: event.clientY };
    event.target?.setPointerCapture?.(event.pointerId);
    document.body.style.cursor = "grabbing";
  };
  const handlePointerMove = (event) => {
    if (!interactive || !freeRotate || !dragState.current.active) return;
    event.stopPropagation();
    const dx = event.clientX - dragState.current.lastX;
    const dy = event.clientY - dragState.current.lastY;
    if (Math.abs(dx) + Math.abs(dy) > 2) dragState.current.moved = true;
    targetRotation.current.y += dx * 0.012;
    targetRotation.current.x += dy * 0.012;
    targetRotation.current.z += (dx - dy) * 0.0025;
    dragState.current.lastX = event.clientX;
    dragState.current.lastY = event.clientY;
  };
  const stopDrag = (event) => {
    if (!interactive || !freeRotate) return;
    event?.stopPropagation?.();
    dragState.current.active = false;
    document.body.style.cursor = hovered ? "pointer" : "";
  };

  return (
    <>
      <ambientLight intensity={0.58} />
      <directionalLight position={[0, 6, 5]} intensity={1.05} />
      <spotLight position={[-3.4, 3.8, 4.5]} angle={0.42} penumbra={0.7} color="#28fff1" intensity={3.4} />
      <spotLight position={[3.6, 3.3, 4.2]} angle={0.42} penumbra={0.65} color="#9a5cff" intensity={3.1} />
      <pointLight position={[-2.8, -1.4, 2.8]} color="#22d3ee" intensity={1.9} />
      <pointLight position={[2.7, -1.5, 2.6]} color="#8f5cff" intensity={1.7} />

      <group
        ref={nGroup}
        position={[0, yOffset, 0]}
        scale={scale}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
        onLostPointerCapture={stopDrag}
        onPointerOver={(event) => {
          if (!interactive) return;
          event.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          if (!interactive) return;
          setHovered(false);
          document.body.style.cursor = "";
        }}
      >
        <mesh position={[-1.25, 0, 0]}>
          <boxGeometry args={[0.72, 4.35, 0.78]} />
          <meshPhysicalMaterial
            color="#14e8da"
            emissive="#0b8e96"
            emissiveIntensity={hovered ? 0.78 : 0.52}
            metalness={0.82}
            roughness={0.16}
            clearcoat={0.72}
            clearcoatRoughness={0.08}
            reflectivity={0.74}
          />
        </mesh>
        <mesh position={[1.25, 0, 0]}>
          <boxGeometry args={[0.72, 4.35, 0.78]} />
          <meshPhysicalMaterial
            color="#8d3dff"
            emissive="#5b20ca"
            emissiveIntensity={hovered ? 0.68 : 0.45}
            metalness={0.84}
            roughness={0.15}
            clearcoat={0.74}
            clearcoatRoughness={0.08}
            reflectivity={0.7}
          />
        </mesh>
        <mesh rotation={[0, 0, 0.58]} position={[0, 0, 0.04]}>
          <boxGeometry args={[0.7, 4.74, 0.8]} />
          <meshPhysicalMaterial
            color="#4c19df"
            emissive="#2e10ae"
            emissiveIntensity={hovered ? 0.74 : 0.5}
            metalness={0.88}
            roughness={0.13}
            clearcoat={0.78}
            clearcoatRoughness={0.07}
            reflectivity={0.76}
          />
        </mesh>
        <mesh position={[-1.52, 1.38, 0.48]} rotation={[0.2, -0.55, -0.08]}>
          <planeGeometry args={[0.06, 1.35]} />
          <meshBasicMaterial color="#b9fff9" transparent opacity={hovered ? 0.35 : 0.22} />
        </mesh>
        <mesh position={[1.52, 1.28, 0.49]} rotation={[0.18, 0.5, 0.06]}>
          <planeGeometry args={[0.055, 1.25]} />
          <meshBasicMaterial color="#e7d5ff" transparent opacity={hovered ? 0.28 : 0.18} />
        </mesh>
      </group>

      {showPlatform && <group ref={platform} position={[0, -2.65, 0]} scale={[1.05, 0.42, 1.05]}>
        <mesh>
          <cylinderGeometry args={[2.15, 2.35, 0.28, 64]} />
          <meshStandardMaterial color="#080d1e" metalness={0.82} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[1.85, 2.05, 0.14, 64]} />
          <meshStandardMaterial color="#111629" metalness={0.82} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.31, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.95, 0.04, 16, 100]} />
          <meshBasicMaterial color="#22d3ee" />
        </mesh>
        <mesh position={[0, 0.38, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.55, 0.018, 16, 100]} />
          <meshBasicMaterial color="#8f5cff" transparent opacity={0.8} />
        </mesh>
      </group>}

      <group ref={orbitGroup} position={[0, yOffset, 0]} scale={compact ? 0.9 : 1.02}>
        <mesh ref={orbit1} rotation={[1.42, 0, 0]}>
          <torusGeometry args={[2.5, compact ? 0.07 : 0.082, 20, 192]} />
          <meshBasicMaterial color="#62fff2" transparent opacity={hovered ? 1 : 0.94} />
        </mesh>
        <mesh rotation={[1.42, 0, 0]}>
          <torusGeometry args={[2.5, compact ? 0.108 : 0.13, 20, 192]} />
          <meshBasicMaterial color="#20eadc" transparent opacity={hovered ? 0.18 : 0.11} />
        </mesh>
        <mesh rotation={[1.42, 0, 0.02]}>
          <torusGeometry args={[2.18, compact ? 0.012 : 0.016, 12, 160]} />
          <meshBasicMaterial color="#9366ff" transparent opacity={0.44} />
        </mesh>
        {[light1, light2].map((ref, index) => (
          <mesh ref={ref} key={index}>
            <sphereGeometry args={[index === 0 ? 0.105 : 0.085, 28, 28]} />
            <meshBasicMaterial color={index === 1 ? "#8f5cff" : "#22d3ee"} />
          </mesh>
        ))}
      </group>
    </>
  );
}
