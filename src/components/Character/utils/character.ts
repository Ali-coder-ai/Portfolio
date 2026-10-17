import * as THREE from "three";
import { DRACOLoader, GLTF, GLTFLoader } from "three-stdlib";
import { setCharTimeline, setAllTimeline } from "../../utils/GsapScroll";
import { decryptFile } from "./decrypt";

const setCharacter = (
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera
) => {
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");
  loader.setDRACOLoader(dracoLoader);

  const loadCharacter = () => {
    return new Promise<GLTF | null>(async (resolve, reject) => {
      try {
        const encryptedBlob = await decryptFile(
          "/models/character.enc",
          "Character3D#@"
        );
        const blobUrl = URL.createObjectURL(new Blob([encryptedBlob]));

        let character: THREE.Object3D;
        loader.load(
          blobUrl,
          async (gltf) => {
            character = gltf.scene;
            await renderer.compileAsync(character, camera, scene);

            // ── Material colour map ───────────────────────────────────────
            // The GLB ships everything on the grey "default" material.
            // We clone per mesh and assign the correct baseColor so the
            // character matches the reference (black outfit, brown skin,
            // silver cap, purple brim, white shoes).
            // Animations, bones and transforms are untouched.
            const colorMap: Record<string, { color: number; roughness?: number; metalness?: number }> = {
              // clothing
              "BODY.SHIRT":  { color: 0x111111, roughness: 0.8 },
              "Pant":        { color: 0x0d0d0d, roughness: 0.85 },
              // shoes
              "Shoe":        { color: 0xd4d4d8, roughness: 0.25, metalness: 0.35 },
              "Sole":        { color: 0xf0f0f0, roughness: 0.6 },
              // skin
              "Hand":        { color: 0x8B5E3C, roughness: 0.65 },
              "Neck":        { color: 0x8B5E3C, roughness: 0.65 },
              "Ear.001":     { color: 0x8B5E3C, roughness: 0.65 },
              // cap
              "Cube.002":    { color: 0xc8c8cc, roughness: 0.3, metalness: 0.25 }, // silver crown
              "Plane.007":   { color: 0x6a2bbf, roughness: 0.7 },                  // purple brim
              // watch band on wrist (small black cube near hand)
              "Plane.003":   { color: 0x111111, roughness: 0.8 },
            };

            character.traverse((child: any) => {
              if (child.isMesh) {
                const mesh = child as THREE.Mesh;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                mesh.frustumCulled = true;

                const cfg = colorMap[child.name];
                if (cfg) {
                  // Clone so we don't mutate a shared material instance
                  const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
                  mat.color.set(cfg.color);
                  if (cfg.roughness !== undefined) mat.roughness = cfg.roughness;
                  if (cfg.metalness !== undefined) mat.metalness = cfg.metalness;
                  mesh.material = mat;
                }
              }
            });
            // ── End material fix ─────────────────────────────────────────
            resolve(gltf);
            setCharTimeline(character, camera);
            setAllTimeline();
            character!.getObjectByName("footR")!.position.y = 3.36;
            character!.getObjectByName("footL")!.position.y = 3.36;
            dracoLoader.dispose();
          },
          undefined,
          (error) => {
            console.error("Error loading GLTF model:", error);
            reject(error);
          }
        );
      } catch (err) {
        reject(err);
        console.error(err);
      }
    });
  };

  return { loadCharacter };
};

export default setCharacter;
