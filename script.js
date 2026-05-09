// script.js — starfield only (no planets / circles)
import * as THREE from "https://unpkg.com/three@0.164.1/build/three.module.js";

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

const canvas = document.getElementById("bg3d");
if (!canvas) {
  throw new Error("Missing canvas #bg3d");
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 0, 14);

const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: true,
  powerPreference: "high-performance"
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);

const clock = new THREE.Clock();

const STAR_COUNT = 3800;
const starGeometry = new THREE.BufferGeometry();
const starPositions = new Float32Array(STAR_COUNT * 3);
const starColors = new Float32Array(STAR_COUNT * 3);

for (let i = 0; i < STAR_COUNT; i += 1) {
  const i3 = i * 3;
  const r = 45 + Math.random() * 95;
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const sinP = Math.sin(phi);
  starPositions[i3] = r * sinP * Math.cos(theta);
  starPositions[i3 + 1] = r * sinP * Math.sin(theta);
  starPositions[i3 + 2] = r * Math.cos(phi);

  const tw = 0.78 + Math.random() * 0.22;
  starColors[i3] = tw;
  starColors[i3 + 1] = tw * (0.88 + Math.random() * 0.12);
  starColors[i3 + 2] = 1;
}

starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
starGeometry.setAttribute("color", new THREE.BufferAttribute(starColors, 3));

const starMaterial = new THREE.PointsMaterial({
  size: 0.05,
  transparent: true,
  opacity: 0.88,
  vertexColors: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  sizeAttenuation: true
});
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

const GLINT_COUNT = 140;
const glintGeometry = new THREE.BufferGeometry();
const glintPositions = new Float32Array(GLINT_COUNT * 3);
for (let i = 0; i < GLINT_COUNT; i += 1) {
  const i3 = i * 3;
  glintPositions[i3] = (Math.random() - 0.5) * 38;
  glintPositions[i3 + 1] = (Math.random() - 0.5) * 22;
  glintPositions[i3 + 2] = -8 - Math.random() * 18;
}
glintGeometry.setAttribute("position", new THREE.BufferAttribute(glintPositions, 3));
const glints = new THREE.Points(
  glintGeometry,
  new THREE.PointsMaterial({
    color: 0xc4b5fd,
    size: 0.065,
    transparent: true,
    opacity: 0.28,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  })
);
scene.add(glints);

function animate(elapsed) {
  stars.rotation.y = elapsed * 0.016;
  stars.rotation.x = Math.sin(elapsed * 0.035) * 0.03;

  glints.rotation.z = elapsed * 0.009;
  glints.position.x = Math.sin(elapsed * 0.07) * 0.28;

  camera.position.x = Math.sin(elapsed * 0.055) * 0.2;
  camera.position.y = Math.cos(elapsed * 0.04) * 0.1;
  camera.lookAt(0, 0, -18);
}

function tick() {
  const elapsed = clock.getElapsedTime();
  animate(elapsed);
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();

const phrases = [
  "I build digital experiences.",
  "Full stack developer — clean UI, solid systems.",
  "I turn ideas into reliable web products."
];
const typeEl = document.getElementById("typewriter");
let pIndex = 0;
let charIndex = 0;
function typeLoop() {
  const current = phrases[pIndex];
  if (charIndex <= current.length) {
    if (typeEl) typeEl.textContent = current.slice(0, charIndex);
    charIndex += 1;
    setTimeout(typeLoop, 28);
  } else {
    setTimeout(() => {
      const erase = setInterval(() => {
        if (charIndex > 0) {
          charIndex -= 1;
          if (typeEl) typeEl.textContent = current.slice(0, charIndex);
        } else {
          clearInterval(erase);
          pIndex = (pIndex + 1) % phrases.length;
          setTimeout(typeLoop, 400);
        }
      }, 18);
    }, 1600);
  }
}
if (typeEl) typeLoop();

window.addEventListener("resize", () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
