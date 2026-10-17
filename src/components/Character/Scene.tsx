import { useEffect, useRef } from "react";
import * as THREE from "three";
import setCharacter from "./utils/character";
import setLighting from "./utils/lighting";
import { useLoading } from "../../context/LoadingProvider";
import handleResize from "./utils/resizeUtils";
import {
  handleMouseMove,
  handleTouchEnd,
  handleHeadRotation,
  handleTouchMove,
} from "./utils/mouseUtils";
import setAnimations from "./utils/animationUtils";
import { setProgress } from "../Loading";

const Scene = () => {
  const canvasDiv = useRef<HTMLDivElement | null>(null);
  const hoverDivRef = useRef<HTMLDivElement>(null);
  const { setLoading } = useLoading();

  useEffect(() => {
    const container = canvasDiv.current;
    if (!container) return;

    let isMounted = true;

    // Remove any leftover canvas elements to prevent duplicate layers
    container.querySelectorAll("canvas").forEach((c) => c.remove());

    const rect = container.getBoundingClientRect();
    const width = rect.width || window.innerWidth;
    const height = rect.height || window.innerHeight;
    const aspect = width / height;

    // Fresh scene instance dedicated to this mount
    const scene = new THREE.Scene();

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    container.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(14.5, aspect, 0.1, 1000);
    camera.position.set(0, 13.1, 24.7);
    camera.zoom = 1.1;
    camera.updateProjectionMatrix();

    let characterModel: THREE.Object3D | null = null;
    let headBone: THREE.Object3D | null = null;
    let screenLight: any | null = null;
    let mixer: THREE.AnimationMixer | null = null;

    const clock = new THREE.Clock();
    const light = setLighting(scene);
    const progress = setProgress((value) => setLoading(value));
    const { loadCharacter } = setCharacter(renderer, scene, camera);

    const resizeCallback = () => {
      if (characterModel) {
        handleResize(renderer, camera, canvasDiv, characterModel);
      }
    };
    window.addEventListener("resize", resizeCallback);

    loadCharacter().then((gltf) => {
      if (!isMounted || !gltf) return;

      const animations = setAnimations(gltf);
      if (hoverDivRef.current) {
        animations.hover(gltf, hoverDivRef.current);
      }
      mixer = animations.mixer;
      characterModel = gltf.scene;

      // Remove any existing character object from scene before adding
      const existing =
        scene.getObjectByName("metarig002") ||
        scene.getObjectByName("metarig.002");
      if (existing) {
        scene.remove(existing);
      }

      scene.add(characterModel);
      headBone = characterModel.getObjectByName("spine006") || null;
      screenLight = characterModel.getObjectByName("screenlight") || null;

      progress.loaded().then(() => {
        if (!isMounted) return;
        setTimeout(() => {
          if (!isMounted) return;
          light.turnOnLights();
          animations.startIntro();
        }, 2500);
      });
    });

    let mouse = { x: 0, y: 0 },
      interpolation = { x: 0.1, y: 0.2 };

    const onMouseMove = (event: MouseEvent) => {
      handleMouseMove(event, (x, y) => (mouse = { x, y }));
    };
    let debounce: number | undefined;
    const onTouchStart = (event: TouchEvent) => {
      const element = event.target as HTMLElement;
      debounce = setTimeout(() => {
        element?.addEventListener("touchmove", (e: TouchEvent) =>
          handleTouchMove(e, (x, y) => (mouse = { x, y }))
        );
      }, 200);
    };

    const onTouchEnd = () => {
      handleTouchEnd((x, y, interpolationX, interpolationY) => {
        mouse = { x, y };
        interpolation = { x: interpolationX, y: interpolationY };
      });
    };

    document.addEventListener("mousemove", onMouseMove);
    const landingDiv = document.getElementById("landingDiv");
    if (landingDiv) {
      landingDiv.addEventListener("touchstart", onTouchStart);
      landingDiv.addEventListener("touchend", onTouchEnd);
    }

    let isVisible = true;
    const visibleSections = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleSections.add(entry.target);
          } else {
            visibleSections.delete(entry.target);
          }
        });
        isVisible = visibleSections.size > 0;
      },
      { rootMargin: "250px 0px" }
    );

    const observedElements = document.querySelectorAll(
      "#landingDiv, .about-section, .whatIDO"
    );
    observedElements.forEach((el) => observer.observe(el));

    let rafId: number;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      if (!isVisible || document.hidden) return;

      if (headBone) {
        handleHeadRotation(
          headBone,
          mouse.x,
          mouse.y,
          interpolation.x,
          interpolation.y,
          THREE.MathUtils.lerp
        );
        light.setPointLight(screenLight);
      }
      const delta = clock.getDelta();
      if (mixer) {
        mixer.update(delta);
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      isMounted = false;
      cancelAnimationFrame(rafId);
      observer.disconnect();
      clearTimeout(debounce);
      window.removeEventListener("resize", resizeCallback);
      scene.clear();
      renderer.dispose();
      renderer.forceContextLoss?.();
      if (renderer.domElement.parentNode) {
        renderer.domElement.remove();
      }
      document.removeEventListener("mousemove", onMouseMove);
      if (landingDiv) {
        landingDiv.removeEventListener("touchstart", onTouchStart);
        landingDiv.removeEventListener("touchend", onTouchEnd);
      }
    };
  }, []);

  return (
    <>
      <div className="character-container">
        <div className="character-model" ref={canvasDiv}>
          <div className="character-rim"></div>
          <div className="character-hover" ref={hoverDivRef}></div>
        </div>
      </div>
    </>
  );
};

export default Scene;
