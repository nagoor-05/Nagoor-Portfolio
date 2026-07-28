import { Canvas } from "@react-three/fiber";
import { PreloaderScene } from "./PreloaderScene";

export default function Logo3D({ compact = false, autoSpin = true, freeRotate = true, showPlatform = false }) {
  return (
    <div className={compact ? "logo3d compact" : "logo3d"} aria-hidden="true">
      <Canvas camera={{ position: [0, 0.35, compact ? 8 : 7.4], fov: compact ? 36 : 42 }} dpr={[1, 1.5]}>
        <PreloaderScene
          compact={compact}
          entry
          interactive
          autoSpin={autoSpin}
          freeRotate={freeRotate}
          showPlatform={showPlatform}
        />
      </Canvas>
    </div>
  );
}
