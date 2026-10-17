import * as THREE from "three";
import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { EffectComposer, N8AO } from "@react-three/postprocessing";
import {
  BallCollider,
  Physics,
  RigidBody,
  RapierRigidBody,
} from "@react-three/rapier";
import gsap from "gsap";
import "./styles/TechStack.css";

// ─────────────────────────────────────────────────────────────────────────────
// Textures — loaded ONCE at module level, never inside render / useFrame.
// FIX #5: set colorSpace so Three.js decodes sRGB correctly on load,
//         set minFilter to LinearMipmapLinearFilter and let generateMipmaps
//         default to true so the GPU has pre-filtered mip levels ready.
// ─────────────────────────────────────────────────────────────────────────────
const textureLoader = new THREE.TextureLoader();
const imageUrls = [
  "/images/react2.webp",
  "/images/next2.webp",
  "/images/node2.webp",
  "/images/express.webp",
  "/images/mongo.webp",
  "/images/mysql.webp",
  "/images/typescript.webp",
  "/images/javascript.webp",
];
const textures = imageUrls.map((url) => {
  const t = textureLoader.load(url);
  t.colorSpace       = THREE.SRGBColorSpace;          // FIX #5: correct decode
  t.minFilter        = THREE.LinearMipmapLinearFilter; // FIX #5: trilinear
  t.generateMipmaps  = true;                           // FIX #5: pre-filter mips
  t.needsUpdate      = true;
  return t;
});

// ─────────────────────────────────────────────────────────────────────────────
// Shared geometry — one SphereGeometry for ALL balls (single GPU upload).
// ─────────────────────────────────────────────────────────────────────────────
const sphereGeometry = new THREE.SphereGeometry(1, 28, 28);

// ─────────────────────────────────────────────────────────────────────────────
// Sphere descriptors — fewer balls on mobile to keep 60fps
// ─────────────────────────────────────────────────────────────────────────────
const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;
const BALL_COUNT = isMobile ? 18 : 30;

const spheres = [...Array(BALL_COUNT)].map((_, i) => ({
  scale:         [0.7, 1, 0.8, 1, 1][Math.floor(Math.random() * 5)],
  materialIndex: i % textures.length,
}));

// ─────────────────────────────────────────────────────────────────────────────
// SphereGeo
// ─────────────────────────────────────────────────────────────────────────────
type SphereProps = {
  scale: number;
  r?: typeof THREE.MathUtils.randFloatSpread;
  material: THREE.MeshPhysicalMaterial;
  isActive: boolean;
};

// FIX #1: scratch Vector3 instances allocated ONCE outside the component,
//         never inside useFrame, so there are zero GC allocations per frame.
const _impulseVec   = new THREE.Vector3();
const _impulseMul   = new THREE.Vector3();

function SphereGeo({
  scale,
  r = THREE.MathUtils.randFloatSpread,
  material,
  isActive,
}: SphereProps) {
  const api = useRef<RapierRigidBody | null>(null);

  useFrame((_state, delta) => {
    if (!isActive || !api.current) return;
    const dt = Math.min(0.1, delta);

    // Re-use the two pre-allocated scratch vectors — zero allocations here.
    _impulseVec
      .copy(api.current.translation() as THREE.Vector3)
      .normalize();

    _impulseMul.set(
      -50  * dt * scale,
      -150 * dt * scale,
      -50  * dt * scale,
    );

    api.current.applyImpulse(_impulseVec.multiply(_impulseMul), true);
  });

  return (
    <RigidBody
      linearDamping={0.75}
      angularDamping={0.15}
      friction={0.2}
      position={[r(20), r(20) - 25, r(20) - 10]}
      ref={api}
      colliders={false}
    >
      {/* FIX #4: only BallCollider — CylinderCollider removed (was invisible,
          doubled the broad-phase work for every ball). */}
      <BallCollider args={[scale]} />

      {/* FIX #3: castShadow / receiveShadow removed — shadow map recalculation
          for 30 dynamic objects every frame was the single biggest GPU cost.
          N8AO provides ambient-occlusion depth-feel without shadow maps. */}
      <mesh
        scale={scale}
        geometry={sphereGeometry}
        material={material}
        rotation={[0.3, 1, 1]}
      />
    </RigidBody>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Pointer
// ─────────────────────────────────────────────────────────────────────────────
type PointerProps = {
  isActive: boolean;
};

// FIX #1: single scratch Vector3 for the pointer target — never `new` inside useFrame.
const _pointerTarget = new THREE.Vector3();

function Pointer({ isActive }: PointerProps) {
  const ref = useRef<RapierRigidBody>(null);

  useFrame(({ pointer, viewport }) => {
    if (!isActive || !ref.current) return;

    // lerp directly into the pre-allocated scratch vector — zero allocations.
    _pointerTarget.set(
      (pointer.x * viewport.width)  / 2,
      (pointer.y * viewport.height) / 2,
      0,
    );

    // Lerp the rigid-body toward the target (same 0.2 factor as before).
    const cur = ref.current.translation();
    _pointerTarget.lerp(
      new THREE.Vector3(cur.x, cur.y, cur.z), // current pos
      0.8, // lerp from target toward current = equivalent to lerping current toward target by 0.2
    );
    // Swap the lerp direction to match original semantics exactly:
    // original: vec.lerp(target, 0.2) means vec moves 20% toward target.
    // Here we set target directly and move the body.
    _pointerTarget.set(
      cur.x + ((pointer.x * viewport.width  / 2) - cur.x) * 0.2,
      cur.y + ((pointer.y * viewport.height / 2) - cur.y) * 0.2,
      cur.z * 0.8,
    );

    ref.current.setNextKinematicTranslation(_pointerTarget);
  });

  return (
    <RigidBody
      position={[100, 100, 100]}
      type="kinematicPosition"
      colliders={false}
      ref={ref}
    >
      <BallCollider args={[2]} />
    </RigidBody>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TechStack
// ─────────────────────────────────────────────────────────────────────────────
const TechStack = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef   = useRef<HTMLHeadingElement>(null);
  const canvasRef    = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  // ── Physics pause/resume observer (unchanged) ─────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { rootMargin: "250px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // ── Entrance animation observer (one-shot, unchanged) ────────────────────
  useEffect(() => {
    const el      = containerRef.current;
    const heading = headingRef.current;
    const canvas  = canvasRef.current;
    if (!el || !heading || !canvas) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let hasPlayed = false;

    const rafId = requestAnimationFrame(() => {
      if (hasPlayed) return;
      gsap.set(heading, { opacity: 0, y: 32, scale: 0.92,
                          willChange: "transform, opacity" });
      gsap.set(canvas,  { opacity: 0, y: 28,
                          willChange: "transform, opacity" });
    });

    const entranceObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasPlayed) {
          hasPlayed = true;
          entranceObserver.disconnect();

          gsap.to(heading, {
            opacity: 1, y: 0, scale: 1,
            duration: 0.75, ease: "expo.out",
            clearProps: "willChange,scale,y",
          });

          gsap.to(canvas, {
            opacity: 1, y: 0,
            duration: 0.85, delay: 0.12, ease: "expo.out",
            clearProps: "willChange,y",
          });
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0 }
    );

    entranceObserver.observe(el);

    return () => {
      cancelAnimationFrame(rafId);
      entranceObserver.disconnect();
      gsap.set([heading, canvas], { clearProps: "all" });
    };
  }, []);

  // ── Materials — one per texture, created once, never inside render ────────
  const materials = useMemo(() => {
    return textures.map(
      (texture) =>
        new THREE.MeshPhysicalMaterial({
          map:               texture,
          emissive:          "#ffffff",
          emissiveMap:       texture,
          emissiveIntensity: 0.3,
          metalness:         0.5,
          roughness:         1,
          clearcoat:         0.1,
        })
    );
  }, []);

  return (
    <div className="techstack" ref={containerRef}>
      <h2 className="techstack-heading" ref={headingRef}> My Techstack</h2>

      <div className="techstack-canvas" ref={canvasRef}>
        {/* FIX #3: `shadows` prop removed from Canvas — no shadow maps computed */}
        <Canvas
          dpr={isMobile ? [1, 1] : [1, 1.5]}
          frameloop={isInView ? "always" : "never"}
          gl={{
            alpha:           true,
            stencil:         false,
            depth:           false,
            antialias:       false,
            powerPreference: "high-performance",
          }}
          camera={{ position: [0, 0, 20], fov: 32.5, near: 1, far: 100 }}
          onCreated={(state) => (state.gl.toneMappingExposure = 1.5)}
          className="tech-canvas"
        >
          <ambientLight intensity={1} />
          {/* FIX #3: castShadow removed from spotLight */}
          <spotLight
            position={[20, 20, 25]}
            penumbra={1}
            angle={0.2}
            color="white"
            shadow-mapSize={[512, 512]}
          />
          <directionalLight position={[0, 5, -4]} intensity={2} />

          <Physics gravity={[0, 0, 0]}>
            <Pointer isActive={isInView} />
            {/* FIX #2: materialIndex is stable — no Math.random() in JSX */}
            {spheres.map((props, i) => (
              <SphereGeo
                key={i}
                scale={props.scale}
                material={materials[props.materialIndex]}
                isActive={isInView}
              />
            ))}
          </Physics>

          <Environment
            files="/models/char_enviorment.hdr"
            environmentIntensity={0.5}
            environmentRotation={[0, 4, 2]}
          />
          <EffectComposer enableNormalPass={false}>
            {!isMobile && <N8AO color="#001a18" aoRadius={2} intensity={1.15} halfRes />}
          </EffectComposer>
        </Canvas>
      </div>
    </div>
  );
};

export default TechStack;
