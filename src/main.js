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

const axesHelper = new THREE.AxesHelper(20);
scene.add(axesHelper);

// Camera (character-select angle)
const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(2, 0.5, 2);
camera.lookAt(1, 1, -1);

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

function setControls() {
  var i = 0;
  document.addEventListener("keydown", (event) => {
    console.log(event.key);
    switch (event.key) {
      case "ArrowUp":
        camera.position.y += 1;
        break;
      case "ArrowDown":
        camera.position.y -= 1;
        break;
      case "ArrowLeft":
        camera.position.x -= 1;
        break;
      case "ArrowRight":
        camera.position.x += 1;
        break;

      case "w":
        camera.position.z -= 1;
        break;
      case "s":
        camera.position.z += 1;
        break;
      case "i":
        i++;
        camera.lookAt(0, 0, i);
        break;
    }
  });
}
animate();
setControls();
