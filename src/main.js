import "./style.css";
import * as THREE from "three";
import { createHubObjects } from "./scenes/hub/hubObjects.js";

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("app"),
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x0f0f0f);

// Scene
const scene = new THREE.Scene();

// Camera (character-select angle)
const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 6, 10);
camera.lookAt(0, 1, 0);

// Lights (top-down spotlight vibe)
scene.add(new THREE.AmbientLight(0xffffff, 0.4));

const spot = new THREE.SpotLight(0xffffff, 1.2);
spot.position.set(0, 10, 0);
spot.angle = Math.PI / 6;
spot.penumbra = 0.4;
spot.castShadow = true;
scene.add(spot);

// Hub Objects (roulette)
const hubObjects = createHubObjects();
scene.add(hubObjects);

// Loop
function animate() {
  requestAnimationFrame(animate);
  hubObjects.rotation.y += 0.002; // TEMP auto-rotate
  renderer.render(scene, camera);
}
animate();
