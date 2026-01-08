import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const loader = new GLTFLoader();

export function createHubObjects() {
  const group = new THREE.Group();

  const spacing = 8;
  const items = [
    {
      name: "art",
      // Path relative to the PUBLIC folder
      path: "models/paintbrush.glb",
      scale: 1.7,
      position: new THREE.Vector3(0, 2.35, -spacing),
      rotation: new THREE.Euler(0, 0, Math.PI * 7.15),
      fixPivot: true,
    },
    {
      name: "game",
      path: "models/nes_controller.glb",
      scale: 0.1,
      position: new THREE.Vector3(spacing, 3.2, 0),
      rotation: new THREE.Euler(-0.15, Math.PI, 0),
    },
    {
      name: "editing",
      path: "models/camera.glb",
      scale: 1.5,
      position: new THREE.Vector3(-spacing, 2.3, 0),
      rotation: new THREE.Euler(-0.15, Math.PI * 0.75, 0),
    },
    {
      name: "software",
      path: "models/computer.glb",
      scale: 1.5,
      position: new THREE.Vector3(0, 2.0, spacing),
    },
  ];

  items.forEach((item) => {
    loader.load(item.path, (gltf) => {
      const model = gltf.scene;

      const anchor = new THREE.Group();
      anchor.name = item.name;

      anchor.position.copy(item.position);
      anchor.scale.setScalar(item.scale);
      if (item.rotation) anchor.rotation.copy(item.rotation);

      if (item.fixPivot) {
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());

        model.position.x = -center.x;
        model.position.y = -center.y;
        model.position.z = -center.z;
      }

      anchor.add(model);

      anchor.userData.initialY = anchor.position.y;
      anchor.userData.initialRotationY = anchor.rotation.y;

      group.add(anchor);
    });
  });

  return group;
}
