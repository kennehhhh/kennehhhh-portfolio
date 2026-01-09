import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const loader = new GLTFLoader();

export function createHeroObjects() {
  const group = new THREE.Group();
  group.name = "heroGroup";

  // 1. The Head
  // Starts at (0,0,0) so it looks good spinning in the center
  loader.load("/models/mc_head.glb", (gltf) => {
    const model = gltf.scene;
    model.name = "mc_head";
    model.scale.setScalar(2.0);
    model.position.set(0, 0, 0);

    // Auto-center the pivot
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.x -= center.x;
    model.position.y -= center.y;
    model.position.z -= center.z;

    group.add(model);
  });

  // 2. The Body
  // Starts hidden deep below/right
  loader.load("/models/mc_body.glb", (gltf) => {
    const model = gltf.scene;
    model.name = "mc_body";
    model.scale.setScalar(2.0);

    // Set X to 0 so it aligns with the Head
    // Set Y to 0 (or lower) so it stands upright immediately
    model.position.set(0, 0, 0);

    model.visible = true; // Set true immediately
    group.add(model);
  });

  return group;
}
