import * as THREE from "https://unpkg.com/three@0.164.1/build/three.module.js";

document.getElementById("year").textContent = new Date().getFullYear();

const canvas = document.getElementById("bg3d");
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);

const uniforms = {
  uTime: { value: 0 },
  uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
  uPointer: { value: new THREE.Vector2(0.5, 0.5) },
  uPointerVelocity: { value: 0.0 }
};

const material = new THREE.ShaderMaterial({
  uniforms,
  transparent: true,
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    precision highp float;
    varying vec2 vUv;
    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec2 uPointer;
    uniform float uPointerVelocity;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
        u.y
      );
    }

    float fbm(vec2 p) {
      float value = 0.0;
      float amplitude = 0.5;
      for (int i = 0; i < 5; i++) {
        value += amplitude * noise(p);
        p *= 2.0;
        amplitude *= 0.5;
      }
      return value;
    }

    void main() {
      vec2 uv = vUv;
      vec2 centered = uv - 0.5;
      centered.x *= uResolution.x / uResolution.y;

      vec2 mouse = uPointer - 0.5;
      mouse.x *= uResolution.x / uResolution.y;
      float dist = distance(centered, mouse);
      float ripple = exp(-dist * 8.0) * sin(22.0 * dist - uTime * 4.0);

      float water1 = fbm(uv * 3.2 + vec2(0.0, uTime * 0.08));
      float water2 = fbm(uv * 6.0 + vec2(uTime * 0.03, -uTime * 0.06));
      float flow = water1 * 0.65 + water2 * 0.35;
      flow += ripple * (0.35 + uPointerVelocity * 0.2);

      vec2 distortUv = uv + vec2(
        sin((uv.y + flow) * 10.0 + uTime * 0.8),
        cos((uv.x + flow) * 8.0 - uTime * 0.7)
      ) * 0.012;

      float glow = exp(-dist * 7.5) * (0.55 + uPointerVelocity * 0.55);
      vec3 deepBlue = vec3(0.03, 0.06, 0.22);
      vec3 cyan = vec3(0.10, 0.78, 0.92);
      vec3 violet = vec3(0.33, 0.22, 0.95);
      vec3 pink = vec3(0.78, 0.18, 0.82);

      float band = sin((distortUv.y + flow) * 11.0 + uTime) * 0.5 + 0.5;
      vec3 col = mix(deepBlue, cyan, smoothstep(0.2, 0.95, flow));
      col = mix(col, violet, band * 0.35);
      col += pink * glow * 0.22;
      col += cyan * glow * 0.35;

      float vignette = smoothstep(1.25, 0.08, length(centered));
      col *= (0.7 + vignette * 0.7);

      float grain = (hash(uv * uResolution.xy + uTime) - 0.5) * 0.045;
      col += grain;

      gl_FragColor = vec4(col, 0.93);
    }
  `
});

const plane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
scene.add(plane);

const pointer = { x: 0.5, y: 0.5, px: 0.5, py: 0.5, v: 0 };
window.addEventListener("pointermove", (event) => {
  pointer.x = event.clientX / window.innerWidth;
  pointer.y = 1 - event.clientY / window.innerHeight;
});

const clock = new THREE.Clock();
function tick() {
  const elapsed = clock.getElapsedTime();
  pointer.v = Math.hypot(pointer.x - pointer.px, pointer.y - pointer.py) * 15.0;
  pointer.px += (pointer.x - pointer.px) * 0.14;
  pointer.py += (pointer.y - pointer.py) * 0.14;

  uniforms.uTime.value = elapsed;
  uniforms.uPointer.value.set(pointer.px, pointer.py);
  uniforms.uPointerVelocity.value += (pointer.v - uniforms.uPointerVelocity.value) * 0.1;

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();

const interactiveCards = document.querySelectorAll("[data-tilt]");

function applyTilt(event, element) {
  const bounds = element.getBoundingClientRect();
  const x = event.clientX - bounds.left;
  const y = event.clientY - bounds.top;
  const rotateX = ((y / bounds.height) - 0.5) * -8;
  const rotateY = ((x / bounds.width) - 0.5) * 8;

  element.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(
    2
  )}deg) rotateY(${rotateY.toFixed(2)}deg)`;
}

interactiveCards.forEach((card) => {
  card.addEventListener("mousemove", (event) => {
    applyTilt(event, card);
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
  });
});

const heroPanel = document.querySelector(".hero-panel");
if (heroPanel) {
  heroPanel.addEventListener("mousemove", (event) => {
    const bounds = heroPanel.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    heroPanel.style.setProperty("--x", `${x}%`);
    heroPanel.style.setProperty("--y", `${y}%`);
  });
}

// Resize handling
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
});