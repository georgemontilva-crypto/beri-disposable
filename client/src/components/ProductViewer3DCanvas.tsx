/**
 * Heavy 3D canvas — three.js + react-three-fiber.
 *
 * Imported lazily by ProductViewer3D so the ~900 KB of 3D runtime never reaches
 * visitors who don't open a product page.
 *
 * Rotation is hand-rolled rather than OrbitControls. OrbitControls' damping is
 * an exponential lerp toward the last pointer position: the model stops the
 * instant you let go. Real product viewers carry the gesture — you flick the
 * device and it keeps spinning, decelerating like something with mass. That
 * carried momentum is most of what makes a viewer feel expensive, so the drag
 * here measures pointer velocity and hands it to a decaying spin.
 */
import { Bounds, Environment, Html, useGLTF } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Loader2 } from "lucide-react";
import { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Box3, Vector3, type Group } from "three";

/* ─── Tuning ──────────────────────────────────────────────────────────────── */

const CONFIG = {
  /** Radians of yaw per pixel dragged. */
  sensitivity: 0.008,
  /** Vertical drag is deliberately less sensitive — it's clamped anyway. */
  pitchSensitivity: 0.005,
  /** Fraction of spin velocity surviving each second. Lower = more friction. */
  spinDecayPerSecond: 0.06,
  /** Below this (rad/s) the spin is considered stopped. */
  spinEpsilon: 0.06,
  /** Cap so a violent flick doesn't turn into a blur. */
  maxSpin: 9,
  /** Pitch limits, radians from level. */
  pitchLimit: 0.5,
  /** Idle seconds before auto-rotation resumes after an interaction. */
  idleBeforeAutoRotate: 2.5,
  autoRotateSpeed: 0.32,
};

/** Shared, mutable motion state written by the DOM layer, read in useFrame. */
export type MotionState = {
  yaw: number;
  pitch: number;
  spin: number;
  dragging: boolean;
  idleSeconds: number;
};

export function createMotionState(): MotionState {
  return { yaw: 0, pitch: 0, spin: 0, dragging: false, idleSeconds: 0 };
}

/* ─── Model ───────────────────────────────────────────────────────────────── */

function Model({
  url,
  motion,
  autoRotate,
  onReady,
}: {
  url: string;
  motion: React.MutableRefObject<MotionState>;
  autoRotate: boolean;
  onReady?: () => void;
}) {
  const { scene } = useGLTF(url);
  const ref = useRef<Group>(null);
  const inner = useRef<Group>(null);
  const { invalidate } = useThree();

  /**
   * Normalizes whatever the modeller exported into something that spins
   * sensibly, without needing every supplier to follow the same conventions.
   *
   *  - CAD tools (FreeCAD, SolidWorks) treat Z as vertical; glTF and three.js
   *    treat Y as vertical. A model converted without correcting that arrives
   *    lying down, pointing at the camera — you end up staring at the bottom
   *    cap. If the depth clearly exceeds the height, stand it upright.
   *  - The scene is then offset so its bounding-box centre sits on the origin.
   *    Otherwise the model orbits around whatever point the exporter happened
   *    to use, drifting off-frame as it turns.
   */
  useLayoutEffect(() => {
    const g = inner.current;
    if (!g) return;

    g.rotation.set(0, 0, 0);
    g.position.set(0, 0, 0);
    g.updateMatrixWorld(true);

    const box = new Box3().setFromObject(g);
    const size = box.getSize(new Vector3());

    // Elongated along Z rather than Y: a Z-up export. 1.3 keeps roughly cubic
    // products (a bottle cap, a squat pod) from being rotated by accident.
    if (size.z > size.y * 1.3) {
      g.rotation.x = -Math.PI / 2;
      g.updateMatrixWorld(true);
    }

    const centered = new Box3().setFromObject(g);
    const center = centered.getCenter(new Vector3());
    g.position.sub(center);

    invalidate();
  }, [scene, invalidate]);

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  // Each product page mounts its own model; drop the cache entry on unmount so
  // moving between four products doesn't pile up GPU memory.
  useEffect(() => () => useGLTF.clear(url), [url]);

  useFrame((_, rawDelta) => {
    const m = motion.current;
    const g = ref.current;
    if (!g) return;

    // A backgrounded tab resumes with a huge delta; clamp so the model doesn't
    // snap a half-turn on return.
    const dt = Math.min(rawDelta, 0.05);
    let moving = false;

    if (m.dragging) {
      m.idleSeconds = 0;
      moving = true;
    } else {
      if (Math.abs(m.spin) > CONFIG.spinEpsilon) {
        m.yaw += m.spin * dt;
        // Exponential friction: velocity keeps a fixed fraction each second,
        // which decays smoothly at any frame rate instead of per-frame.
        m.spin *= Math.pow(CONFIG.spinDecayPerSecond, dt);
        m.idleSeconds = 0;
        moving = true;
      } else {
        m.spin = 0;
        m.idleSeconds += dt;
        if (autoRotate && m.idleSeconds > CONFIG.idleBeforeAutoRotate) {
          m.yaw += CONFIG.autoRotateSpeed * dt;
          moving = true;
        }
      }
      // Ease the pitch back toward level once the user lets go.
      if (Math.abs(m.pitch) > 0.001) {
        m.pitch *= Math.pow(0.25, dt);
        moving = true;
      } else {
        m.pitch = 0;
      }
    }

    g.rotation.y = m.yaw;
    g.rotation.x = m.pitch;

    // frameloop is "demand", so keep requesting frames while anything moves.
    if (moving) invalidate();
  });

  return (
    <group ref={ref}>
      {/* Inner group carries the orientation/centering fix; the outer group
          carries the interactive rotation, so the two never fight. */}
      <group ref={inner}>
        <primitive object={scene} />
      </group>
    </group>
  );
}

/* ─── Loading indicator ───────────────────────────────────────────────────── */

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

/* ─── Canvas + hit area ───────────────────────────────────────────────────── */

export default function ProductViewer3DCanvas({
  url,
  autoRotate = true,
  onReady,
}: {
  url: string;
  autoRotate?: boolean;
  onReady?: () => void;
}) {
  const motion = useRef<MotionState>(createMotionState());
  const [grabbing, setGrabbing] = useState(false);

  // Sample history for velocity. A single last-frame delta is noisy — a pointer
  // that stalls for one frame before release would read as zero velocity and
  // kill the flick, so average over a short window instead.
  const samples = useRef<{ x: number; t: number }[]>([]);
  const lastX = useRef(0);
  const lastY = useRef(0);
  const activePointer = useRef<number | null>(null);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointer.current !== null) return;
    activePointer.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    motion.current.dragging = true;
    motion.current.spin = 0;
    lastX.current = e.clientX;
    lastY.current = e.clientY;
    samples.current = [{ x: e.clientX, t: performance.now() }];
    setGrabbing(true);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointer.current !== e.pointerId) return;
    const m = motion.current;
    const dx = e.clientX - lastX.current;
    const dy = e.clientY - lastY.current;
    lastX.current = e.clientX;
    lastY.current = e.clientY;

    m.yaw += dx * CONFIG.sensitivity;
    m.pitch = Math.max(
      -CONFIG.pitchLimit,
      Math.min(CONFIG.pitchLimit, m.pitch + dy * CONFIG.pitchSensitivity)
    );

    const now = performance.now();
    samples.current.push({ x: e.clientX, t: now });
    // Keep roughly the last 100ms of movement.
    while (samples.current.length > 2 && now - samples.current[0].t > 100) {
      samples.current.shift();
    }
  }, []);

  const endDrag = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointer.current !== e.pointerId) return;
    activePointer.current = null;
    const m = motion.current;
    m.dragging = false;
    setGrabbing(false);

    const s = samples.current;
    if (s.length >= 2) {
      const first = s[0];
      const last = s[s.length - 1];
      const dt = (last.t - first.t) / 1000;
      if (dt > 0.005) {
        const pxPerSecond = (last.x - first.x) / dt;
        const spin = pxPerSecond * CONFIG.sensitivity;
        m.spin = Math.max(-CONFIG.maxSpin, Math.min(CONFIG.maxSpin, spin));
      }
    }
    samples.current = [];
  }, []);

  const dpr = useMemo<[number, number]>(() => [1, 2], []);

  return (
    <div className="relative h-full w-full">
      <Canvas
        // Cap the pixel ratio: retina phones would otherwise render at 3x.
        dpr={dpr}
        camera={{ position: [0, 0, 4], fov: 35 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        // Redraw only while something is actually moving.
        frameloop="demand"
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 8, 5]} intensity={1.4} />
        <directionalLight position={[-5, -2, -5]} intensity={0.5} />

        <Suspense fallback={<CanvasLoader />}>
          {/* Studio HDRI so chrome and translucent plastics read correctly. */}
          <Environment preset="studio" />
          {/* Auto-frames the model whatever scale it was exported at. */}
          <Bounds fit clip observe margin={1.15}>
            <Model url={url} motion={motion} autoRotate={autoRotate} onReady={onReady} />
          </Bounds>
        </Suspense>
      </Canvas>

      {/*
        A separate hit area rather than listeners on the canvas: it keeps the
        cursor and touch-action rules in plain DOM, away from the renderer.
        touch-action pan-y is what makes this usable on phones — the browser
        keeps vertical scrolling, we only receive horizontal drags, so nobody
        gets stuck inside the viewer trying to scroll past it.
      */}
      <div
        className="absolute inset-0"
        style={{ cursor: grabbing ? "grabbing" : "grab", touchAction: "pan-y" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      />
    </div>
  );
}
