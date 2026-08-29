/**
 * Heavy 3D canvas — three.js + react-three-fiber.
 *
 * This module is imported lazily by ProductViewer3D so the ~900 KB of 3D
 * runtime never reaches visitors who don't open a product page.
 */
import { Bounds, Environment, Html, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Loader2 } from "lucide-react";
import { Suspense, useEffect, useRef } from "react";
import type { Group } from "three";

/* ─── Model ───────────────────────────────────────────────────────────────── */

function Model({ url, autoRotate }: { url: string; autoRotate: boolean }) {
  const { scene } = useGLTF(url);
  const ref = useRef<Group>(null);

  // Every product page mounts its own model; dispose the cache entry on unmount
  // so navigating between four products doesn't pile up GPU memory.
  useEffect(() => {
    return () => {
      useGLTF.clear(url);
    };
  }, [url]);

  return (
    <group ref={ref}>
      <primitive object={scene} />
    </group>
  );
}

/* ─── Loading indicator drawn inside the canvas ───────────────────────────── */

function CanvasLoader() {
  return (
    <Html center>
      <div className="flex items-center gap-2 text-sm text-neutral-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading model…</span>
      </div>
    </Html>
  );
}

/* ─── Canvas ──────────────────────────────────────────────────────────────── */

export default function ProductViewer3DCanvas({
  url,
  autoRotate = true,
}: {
  url: string;
  autoRotate?: boolean;
}) {
  return (
    <Canvas
      // Cap the pixel ratio: retina phones would otherwise render 3x and melt.
      dpr={[1, 2]}
      camera={{ position: [0, 0, 4], fov: 35 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      // Only redraw when something actually changes (orbit, autorotate).
      frameloop="demand"
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1.4} />
      <directionalLight position={[-5, -2, -5]} intensity={0.5} />

      <Suspense fallback={<CanvasLoader />}>
        {/* Studio HDRI so chrome and translucent plastics read correctly. */}
        <Environment preset="studio" />
        {/* Auto-frames the model regardless of the scale it was exported at. */}
        <Bounds fit clip observe margin={1.15}>
          <Model url={url} autoRotate={autoRotate} />
        </Bounds>
      </Suspense>

      <OrbitControls
        makeDefault
        // Product viewer, not a scene explorer: no panning off-center.
        enablePan={false}
        autoRotate={autoRotate}
        autoRotateSpeed={0.9}
        minPolarAngle={Math.PI * 0.15}
        maxPolarAngle={Math.PI * 0.85}
        minDistance={1.6}
        maxDistance={7}
        enableDamping
        dampingFactor={0.08}
      />
    </Canvas>
  );
}
