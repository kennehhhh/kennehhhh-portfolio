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
      path: "src/assets/models/paintbrush.glb",
      scale: 1.7, // slightly bigger
      y: 0.5, // default Y position
    },
    {
      name: "game",
      path: "src/assets/models/nes_controller.glb",
      scale: 0.1, // scale down controller
      y: 0.0, // we'll override below to lift it
    },
    {
      name: "software",
      path: "src/assets/models/computer.glb",
      scale: 1.5, // medium size
      y: 1.0, // default Y position
    },
  ];

  const radius = 4; // distance from center
  const angleStep = (Math.PI * 2) / items.length;

  items.forEach((item, index) => {
    loader.load(item.path, (gltf) => {
      const model = gltf.scene;

      // Apply individual scaling
      model.scale.setScalar(item.scale);

      // Set default Y position
      if (item.name === "game") {
        model.position.y = 2; // lift the controller to match other objects
      } else {
        model.position.y = item.y;
      }

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
