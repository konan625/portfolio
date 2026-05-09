// script.js — self-contained animated background and small page interactions

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

const canvas = document.getElementById("bg3d");
const ctx = canvas?.getContext("2d", { alpha: true });

const pointer = {
  x: 0,
  y: 0,
  targetX: 0,
  targetY: 0
};

const particles = [];
const sparks = [];
const cursorSparkles = [];
let lastSparkleX = 0;
let lastSparkleY = 0;
let lastSparkleAt = 0;
const particleConfig = {
  count: 130,
  maxDistance: 150,
  speed: 0.34,
  sparkCount: 34
};

function resizeCanvas() {
  if (!canvas || !ctx) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function createParticles() {
  particles.length = 0;
  sparks.length = 0;
  cursorSparkles.length = 0;

  for (let i = 0; i < particleConfig.count; i += 1) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * particleConfig.speed,
      vy: (Math.random() - 0.5) * particleConfig.speed,
      radius: 1 + Math.random() * 1.7,
      phase: Math.random() * Math.PI * 2
    });
  }

  for (let i = 0; i < particleConfig.sparkCount; i += 1) {
    sparks.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.16,
      vy: -0.06 - Math.random() * 0.22,
      size: 0.8 + Math.random() * 1.8,
      phase: Math.random() * Math.PI * 2
    });
  }
}

function addCursorSparkles(x, y, amount = 5) {
  const now = performance.now();
  const dx = x - lastSparkleX;
  const dy = y - lastSparkleY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance < 10 && now - lastSparkleAt < 28) return;

  lastSparkleX = x;
  lastSparkleY = y;
  lastSparkleAt = now;

  for (let i = 0; i < amount; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.35 + Math.random() * 1.45;
    const spread = Math.random() * 18;

    cursorSparkles.push({
      x: x + Math.cos(angle) * spread,
      y: y + Math.sin(angle) * spread,
      vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 0.45,
      vy: Math.sin(angle) * speed + (Math.random() - 0.5) * 0.45,
      life: 1,
      decay: 0.018 + Math.random() * 0.022,
      size: 1.4 + Math.random() * 2.6,
      spin: Math.random() * Math.PI,
      spinSpeed: (Math.random() - 0.5) * 0.18,
      hue: Math.random() > 0.28 ? "blue" : "violet"
    });
  }

  if (cursorSparkles.length > 180) {
    cursorSparkles.splice(0, cursorSparkles.length - 180);
  }
}

function drawBackground(elapsed) {
  if (!canvas || !ctx) return;

  pointer.x += (pointer.targetX - pointer.x) * 0.035;
  pointer.y += (pointer.targetY - pointer.y) * 0.035;

  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  const glow = ctx.createRadialGradient(
    window.innerWidth * 0.65 + pointer.x * 30,
    window.innerHeight * 0.2 + pointer.y * 20,
    0,
    window.innerWidth * 0.65,
    window.innerHeight * 0.2,
    Math.max(window.innerWidth, window.innerHeight) * 0.62
  );
  glow.addColorStop(0, "rgba(56, 189, 248, 0.12)");
  glow.addColorStop(0.42, "rgba(37, 99, 235, 0.05)");
  glow.addColorStop(1, "rgba(2, 6, 23, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  for (const particle of particles) {
    particle.x += particle.vx + Math.sin(elapsed * 0.0009 + particle.phase) * 0.07;
    particle.y += particle.vy + Math.cos(elapsed * 0.0008 + particle.phase) * 0.065;

    if (particle.x < -20) particle.x = window.innerWidth + 20;
    if (particle.x > window.innerWidth + 20) particle.x = -20;
    if (particle.y < -20) particle.y = window.innerHeight + 20;
    if (particle.y > window.innerHeight + 20) particle.y = -20;
  }

  for (let i = 0; i < particles.length; i += 1) {
    const a = particles[i];
    const ax = a.x + pointer.x * 18;
    const ay = a.y + pointer.y * 12;

    for (let j = i + 1; j < particles.length; j += 1) {
      const b = particles[j];
      const bx = b.x + pointer.x * 18;
      const by = b.y + pointer.y * 12;
      const dx = ax - bx;
      const dy = ay - by;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < particleConfig.maxDistance) {
        const alpha = (1 - distance / particleConfig.maxDistance) * 0.22;
        ctx.strokeStyle = `rgba(96, 165, 250, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
      }
    }

    const pulse = 0.5 + Math.sin(elapsed * 0.0022 + a.phase) * 0.35;
    ctx.fillStyle = `rgba(125, 211, 252, ${0.42 + pulse * 0.32})`;
    ctx.beginPath();
    ctx.arc(ax, ay, a.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const spark of sparks) {
    spark.x += spark.vx + Math.sin(elapsed * 0.0016 + spark.phase) * 0.12;
    spark.y += spark.vy;

    if (spark.y < -20 || spark.x < -20 || spark.x > window.innerWidth + 20) {
      spark.x = Math.random() * window.innerWidth;
      spark.y = window.innerHeight + Math.random() * 80;
    }

    const twinkle = 0.45 + Math.sin(elapsed * 0.006 + spark.phase) * 0.4;
    const x = spark.x + pointer.x * 26;
    const y = spark.y + pointer.y * 18;

    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = `rgba(191, 219, 254, ${0.28 + twinkle * 0.52})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-spark.size * 2, 0);
    ctx.lineTo(spark.size * 2, 0);
    ctx.moveTo(0, -spark.size * 2);
    ctx.lineTo(0, spark.size * 2);
    ctx.stroke();
    ctx.restore();
  }

  for (let i = cursorSparkles.length - 1; i >= 0; i -= 1) {
    const sparkle = cursorSparkles[i];
    sparkle.life -= sparkle.decay;
    sparkle.x += sparkle.vx;
    sparkle.y += sparkle.vy;
    sparkle.vx *= 0.978;
    sparkle.vy *= 0.978;
    sparkle.spin += sparkle.spinSpeed;

    if (sparkle.life <= 0) {
      cursorSparkles.splice(i, 1);
      continue;
    }

    const alpha = Math.max(0, sparkle.life);
    const color = sparkle.hue === "violet"
      ? `rgba(216, 180, 254, ${alpha})`
      : `rgba(191, 219, 254, ${alpha})`;
    const glowColor = sparkle.hue === "violet"
      ? `rgba(192, 132, 252, ${alpha * 0.2})`
      : `rgba(56, 189, 248, ${alpha * 0.22})`;

    ctx.save();
    ctx.translate(sparkle.x, sparkle.y);
    ctx.rotate(sparkle.spin);
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 14;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(-sparkle.size, 0);
    ctx.lineTo(sparkle.size, 0);
    ctx.moveTo(0, -sparkle.size);
    ctx.lineTo(0, sparkle.size);
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(0.65, sparkle.size * 0.18), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  requestAnimationFrame(drawBackground);
}

if (canvas && ctx) {
  resizeCanvas();
  createParticles();
  requestAnimationFrame(drawBackground);
}

window.addEventListener("pointermove", (event) => {
  pointer.targetX = event.clientX / window.innerWidth - 0.5;
  pointer.targetY = event.clientY / window.innerHeight - 0.5;
  addCursorSparkles(event.clientX, event.clientY);
});

window.addEventListener("resize", () => {
  resizeCanvas();
  createParticles();
});

const phrases = [
  "I build digital experiences.",
  "Full stack developer - clean UI, solid systems.",
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
