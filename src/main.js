import "./style.css";
import * as THREE from "three";
import { createHubObjects } from "./scenes/hub/hubObjects.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

// Data for the button links
const projectLinks = [
  { name: "software", link: "/projects/software-dev", label: "View Projects" },
  { name: "game", link: "/projects/gamedev", label: "Play Games" },
  { name: "art", link: "/projects/digital-art", label: "View Gallery" },
  { name: "editing", link: "/projects/video-edit", label: "Watch Edits" },
];

// The order of items as they appear when rotating Right
// (Front -> Right -> Back -> Left)
const itemNames = [
  "software", // 0: Computer (Front)
  "game", // 1: NES Controller (Right)
  "art", // 2: Paintbrush (Back)
  "editing", // 3: Your 4th item (Left) - Change this name!
];

let currentIndex = 0; // Start at 0 (software)

/* -------------------- UI UPDATES -------------------- */
function updateHeaderUI() {
  const list = document.getElementById("role-list");
  if (!list) return;

  // Simple vertical scroll
  list.style.transform = `translateY(${currentIndex * -1.21}em)`;
}

function updateOutline() {
  // 1. Get the name of the current item
  const targetName = itemNames[currentIndex];

  // 2. Find the actual 3D object in the scene
  const targetObject = hubObjects.getObjectByName(targetName);

  // 3. Update the outline pass
  if (targetObject) {
    outlinePass.selectedObjects = [targetObject];
  } else {
    // If model isn't loaded yet, try again next frame or clear outlines
    outlinePass.selectedObjects = [];
  }
}

const animationConfig = {
  // FLOATING (Bobbing up and down)
  floatSpeed: 2.2, // How fast it moves (Higher = Faster)
  floatHeight: 0.1, // How high it goes (Higher = More movement)
  rotationSpeed: 0.0035, // Speed of the active spinning item
  // RETURN SPEED
  smoothness: 0.1, // How fast it snaps back when no longer active (0.1 is smooth)
};

function updateButtonUI() {
  const btn = document.getElementById("project-btn");
  if (!btn) return;

  // 1. Get current data
  // (We use % length to handle the wrapping logic safely)
  const data = projectLinks[currentIndex];

  if (data) {
    // 2. Update Text and Link
    btn.textContent = data.label;
    btn.href = data.link;

    // 3. REPLAY ANIMATION TRICK
    // Remove class -> Force Browser Reflow -> Add class back
    btn.classList.remove("pop-anim");
    void btn.offsetWidth; // This line forces the browser to realize the class is gone
    btn.classList.add("pop-anim");
  }
}

const clock = new THREE.Clock(); // Required to track animation time

function animateItems(elapsedTime) {
  const activeName = itemNames[currentIndex];

  hubObjects.children.forEach((child) => {
    // Safety check
    if (child.userData.initialY === undefined) return;

    if (child.name === activeName) {
      // --- ACTIVE STATE ---

      // 1. Float Up/Down
      const newY =
        child.userData.initialY +
        Math.sin(elapsedTime * animationConfig.floatSpeed) *
          animationConfig.floatHeight;
      child.position.y +=
        (newY - child.position.y) * animationConfig.smoothness;

      // 2. Spin Continuously
      child.rotation.y += animationConfig.rotationSpeed;
    } else {
      // --- INACTIVE STATE (Reset) ---

      // 1. Return to Y Position
      child.position.y +=
        (child.userData.initialY - child.position.y) *
        animationConfig.smoothness;

      // 2. Return to Original Rotation (Smart Reset)
      // We calculate the difference between current and target
      let targetRot = child.userData.initialRotationY;

      // OPTIONAL: Normalize angle to prevent "helicopter" spinning reset
      // This makes it so if you are at 370 degrees, it treats it like 10 degrees
      // (Remove these two lines if you WANT the long spin back)
      const twoPi = Math.PI * 2;
      if (child.rotation.y - targetRot > Math.PI) child.rotation.y -= twoPi;
      if (child.rotation.y - targetRot < -Math.PI) child.rotation.y += twoPi;

      // Smoothly interpolate back to start
      child.rotation.y +=
        (targetRot - child.rotation.y) * animationConfig.smoothness;
    }
  });
}

/* -------------------- Renderer -------------------- */
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("app"),
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x0f0f0f);

/* -------------------- Scene -------------------- */
const scene = new THREE.Scene();

// Axes helper
scene.add(new THREE.AxesHelper(5));

// --- NEW: Floor Grid ---
const gridHelper = new THREE.GridHelper(250, 20, 0xff0000, 0x444444);
scene.add(gridHelper);

/* -------------------- Camera (Stationary) -------------------- */
const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);

// 1. Position the camera to look at the scene from a fixed point
camera.position.set(0, 2.5, 12);
camera.lookAt(0, 2, 0); // Look at the vertical center of your objects

/* -------------------- Lights -------------------- */
// 1. The Spacing variable (must match your hubObjects spacing)
const spacing = 12;

// 2. Create the Hero Light
const heroLight = new THREE.SpotLight(0xffffff, 100); // High intensity (40)

// 3. Position it HIGH above the "front" position
// x=0, y=10, z=spacing (matches the computer's starting Z)
heroLight.position.set(0, 6, spacing);

// 4. Configure the cone
heroLight.angle = Math.PI / 2.5; // Narrow beam
heroLight.penumbra = 0.5; // Soft edges
heroLight.decay = 2; // Realistic light falloff
heroLight.distance = 50;

// 5. Point the light DOWN at the objec
// We create a target object for the light to look at
heroLight.target.position.set(0, 2, spacing);

// IMPORTANT: You must add BOTH the light AND its target to the scene
scene.add(heroLight);
scene.add(heroLight.target);

// Optional: Helper to see where the light is pointing (remove later)
const helper = new THREE.SpotLightHelper(heroLight);
scene.add(helper);

/* -------------------- Hub Objects -------------------- */
const hubObjects = createHubObjects();
hubObjects.position.y = -0.21; // Raise the whole group up a bit
scene.add(hubObjects);

/* -------------------- Post-Processing (Outlines) -------------------- */

// 1. Create the Composer
const composer = new EffectComposer(renderer);

// 2. Add the Render Pass (This draws the scene normally first)
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// 3. Create the Outline Pass
const outlinePass = new OutlinePass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  scene,
  camera
);

// 4. Configure the Outline Style
outlinePass.edgeStrength = 5.0; // How thick/bright the edge is
outlinePass.edgeGlow = 0.0; // No blurry glow, just solid line
outlinePass.edgeThickness = 1.0; // Sharpness of the edge
outlinePass.pulsePeriod = 0; // set to '2' if you want it to blink/breathe
outlinePass.visibleEdgeColor.set("#ffffff"); // Color of the visible outline
outlinePass.hiddenEdgeColor.set("#190a05"); // Color of outline when behind objects

// 5. Select which objects to outline
// We pass the ARRAY of objects found inside your group
outlinePass.selectedObjects = hubObjects.children;

composer.addPass(outlinePass);

// 6. Color Correction (Optional but recommended)
const outputPass = new OutputPass();
composer.addPass(outputPass);

/* -------------------- Controls -------------------- */
let targetRotationY = 0;
// CHANGED: Set to 'true' temporarily so you can test immediately without scrolling
// Change back to 'false' later when you are done testing layout
let isRouletteActive = true;

// Helper: Moves the carousel Left (-1) or Right (+1)
function rotateCarousel(direction) {
  const totalItems = itemNames.length;

  if (direction === "left") {
    targetRotationY += Math.PI / 2;
    currentIndex = (currentIndex - 1 + totalItems) % totalItems;
  } else if (direction === "right") {
    targetRotationY -= Math.PI / 2;
    currentIndex = (currentIndex + 1) % totalItems;
  }

  updateButtonUI();
  updateOutline();
  updateHeaderUI();
}

function setControls() {
  // ... (keep your existing scroll listener) ...

  // --- 1. KEYBOARD CONTROLS ---
  document.addEventListener("keydown", (event) => {
    if (!isRouletteActive) return;

    if (event.key === "ArrowLeft") {
      event.preventDefault(); // Stop page scroll
      rotateCarousel("left");
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      rotateCarousel("right");
    }
  });

  // --- 2. TOUCH / SWIPE CONTROLS ---
  let touchStartX = 0;
  let touchStartY = 0;

  // Detect when finger touches screen
  document.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  });

  // Detect when finger leaves screen
  document.addEventListener("touchend", (e) => {
    if (!isRouletteActive) return;

    const touchEndX = e.changedTouches[0].screenX;
    const touchEndY = e.changedTouches[0].screenY;

    handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY);
  });

  // --- 3. ON-SCREEN ARROW CLICK LISTENERS ---
  const leftBtn = document.getElementById("nav-left");
  const rightBtn = document.getElementById("nav-right");

  if (leftBtn && rightBtn) {
    leftBtn.addEventListener("click", () => {
      rotateCarousel("left");
    });

    rightBtn.addEventListener("click", () => {
      rotateCarousel("right");
    });
  }
}

// Logic to determine if it was a valid swipe
function handleSwipe(startX, startY, endX, endY) {
  const diffX = startX - endX;
  const diffY = startY - endY;

  // Threshold: Swipe must be at least 50px long to count
  if (Math.abs(diffX) < 50) return;

  // Vertical Check: If user swiped more vertically than horizontally,
  // assume they are scrolling the page, NOT rotating the carousel.
  if (Math.abs(diffY) > Math.abs(diffX)) return;

  // Determine Direction
  if (diffX > 0) {
    // Swipe Left (Finger moved right to left) -> Rotate Right (next item)
    rotateCarousel("right");
  } else {
    // Swipe Right (Finger moved left to right) -> Rotate Left (prev item)
    rotateCarousel("left");
  }
}

/* -------------------- Responsive Logic -------------------- */
function handleResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  // 1. Fix the "Stretched" look (Update Aspect Ratio)
  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  // 2. Resize Renderer & Composer
  renderer.setSize(width, height);
  composer.setSize(width, height);

  // 3. Mobile Adjustment (Focus on Middle Item)
  // If width is less than 768px (Mobile), move camera back to z=16
  // If Desktop, keep it at z=12
  if (width < 768) {
    camera.position.z = 14; // Further away so the item fits in narrow width
  } else {
    camera.position.z = 12; // Original Desktop distance
  }
}

// Add the listener
window.addEventListener("resize", handleResize);

// Call it once manually to set initial state correctly
handleResize();

/* -------------------- Loop -------------------- */
function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();

  // 1. Rotate the whole carousel
  hubObjects.rotation.y += (targetRotationY - hubObjects.rotation.y) * 0.1;

  // 2. Animate the individual items (Floating effect)
  animateItems(elapsedTime);

  // 3. Keep outline logic (failsafe)
  if (outlinePass.selectedObjects.length === 0) {
    updateOutline();
  }

  composer.render();
}

setControls();
animate();
updateHeaderUI();
