import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const loader = new GLTFLoader();

/**
 * Creates the roulette group
 * @returns {THREE.Group}
 */
export function createHubObjects() {
  const group = new THREE.Group();

  const items = [
    {
      name: "multimedia",
      path: "/assets/models/clapper.glb",
    },
    {
      name: "game",
      path: "/assets/models/joystick.glb",
    },
    {
      name: "software",
      path: "/assets/models/terminal.glb",
    },
  ];

  const radius = 4; // distance from center
  const angleStep = (Math.PI * 2) / items.length;

  items.forEach((item, index) => {
    loader.load(item.path, (gltf) => {
      const model = gltf.scene;

      // Basic normalization
      model.scale.setScalar(1.5);
      model.position.y = 0;

      // Roulette positioning
      const angle = index * angleStep;
      model.position.x = Math.cos(angle) * radius;
      model.position.z = Math.sin(angle) * radius;

      model.name = item.name;

      group.add(model);
    });
  });

  return group;
}
