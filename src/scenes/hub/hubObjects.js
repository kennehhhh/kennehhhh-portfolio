import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const loader = new GLTFLoader();

export function createHubObjects() {
  const group = new THREE.Group();

  const spacing = 8;
  const items = [
    {
      name: "art",
      path: "src/assets/models/paintbrush.glb",
      scale: 1.7,
      position: new THREE.Vector3(0, 2.35, -spacing),
      rotation: new THREE.Euler(0, 0, Math.PI * 7.15),
      fixPivot: true, // <--- NEW: Flag to force auto-centering
    },
    {
      name: "game",
      path: "src/assets/models/nes_controller.glb",
      scale: 0.1,
      position: new THREE.Vector3(spacing, 3.2, 0),
      rotation: new THREE.Euler(-0.15, Math.PI, 0),
    },
    {
      name: "editing",
      path: "src/assets/models/camera.glb",
      scale: 1.5,
      position: new THREE.Vector3(-spacing, 2.3, 0),
      rotation: new THREE.Euler(-0.15, Math.PI * 0.75, 0),
    },
    {
      name: "software",
      path: "src/assets/models/computer.glb",
      scale: 1.5,
      position: new THREE.Vector3(0, 2.0, spacing),
    },
  ];

  items.forEach((item) => {
    loader.load(item.path, (gltf) => {
      const model = gltf.scene;

      // --- STRATEGY: Create a Wrapper Anchor ---
      // The Wrapper becomes the "Main Object" controlled by main.js
      const anchor = new THREE.Group();
      anchor.name = item.name;

      // 1. Apply Transform to the ANCHOR, not the model
      anchor.position.copy(item.position);
      anchor.scale.setScalar(item.scale);
      if (item.rotation) anchor.rotation.copy(item.rotation);

      // 2. Handle the "Wobbly Rotation" Fix
      if (item.fixPivot) {
        // Calculate the bounding box of the raw model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());

        // Shift the model so its center aligns with (0,0,0)
        // We subtract the center position from the model's position
        // Note: We usually only center X and Z for rotation.
        // Centering Y might make it sink into the floor, but for floating items,
        // centering all axes is usually safer for spin balance.
        model.position.x = -center.x;
        model.position.y = -center.y;
        model.position.z = -center.z;
      }

      // 3. Add the Model to the Anchor
      anchor.add(model);

      // 4. Setup Data for Animation (On the Anchor)
      // main.js looks for these values on the group child
      anchor.userData.initialY = anchor.position.y;
      anchor.userData.initialRotationY = anchor.rotation.y;

      group.add(anchor);
    });
  });

  return group;
}
