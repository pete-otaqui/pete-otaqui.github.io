import { clear, createVector, createBird, accelerateBird } from "./lib/lib.js";
const CONFIG = {
  V_MAX_LO: 3,
  V_MAX_HI: 5,
  V_MIN_LO: -5,
  V_MIN_HI: -3,
  A_MAX_LO: 3,
  A_MAX_HI: 5,
  A_MIN_LO: -5,
  A_MIN_HI: -3,
  BIRD_BASE: 4,
  BIRD_HEIGHT: 10,
};

const NUMBER_OF_BIRDS = 1000;
const NUMBER_OF_ATTRACTORS = 8;
const ATTRACTOR_RESET = {
  min: 1000,
  range: 6000,
};

let sky;
let width;
let height;
let ctx;
let birds = [];
let attractors = [];

function reqAnim(fn) {
  requestAnimationFrame(fn);
  // setTimeout(fn, 1000);
}

function loop() {
  clear(ctx, sky);
  attractors.forEach((attractor) => {
    drawAttractor(attractor, ctx);
  });
  birds.forEach((bird) => {
    accelerateBird(bird, birds, attractors);
    drawBird(bird, ctx);
  });
  reqAnim(loop);
}

function startAttractors() {
  for (let i = 0; i < NUMBER_OF_ATTRACTORS; i += 1) {
    resetAttractor(i);
  }
}
function resetAttractor(index) {
  const attractor = createVector(
    width * 0.1 + Math.random() * width * 0.8,
    height * 0.1 + Math.random() * height * 0.8
  );
  // const attractor = new Vector(width / 2, height / 2);
  attractors[index] = attractor;
  setTimeout(
    () => resetAttractor(index),
    ATTRACTOR_RESET.min + Math.random() * ATTRACTOR_RESET.range
  );
}

function main() {
  sky = document.getElementById("sky");
  ctx = sky.getContext("2d");
  ctx.fillStyle = "green";
  ctx.strokeStyle = "none";
  const computed = sky.parentNode.getBoundingClientRect();
  width = computed.width;
  height = computed.height;
  sky.setAttribute("width", width);
  sky.setAttribute("height", height);
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  for (let i = 0; i < NUMBER_OF_BIRDS; i += 1) {
    const position = createVector(
      Math.random() * width,
      Math.random() * height
    );
    const velocity = createVector(
      (Math.random() * width - halfWidth) / 200,
      (Math.random() * height - halfHeight) / 200
    );
    const bird = createBird(position, velocity);
    birds.push(bird);
  }
  startAttractors();
  loop();
}

window.addEventListener("load", main);

export function drawBird(bird, ctx) {
  drawBirdBody(bird, ctx);
  // drawBirdVelocity(bird, ctx);
  // drawBirdAcceleration(bird, ctx);
}

export function drawBirdBody(bird, ctx) {
  const { position, velocity } = bird;
  const { x, y } = position;
  const vx = velocity.x;
  const vy = velocity.y;

  const theta = Math.atan2(vy, vx);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(theta);
  ctx.beginPath();

  const baseSize = 5;
  const height = 20;

  const tp1x = 0;
  const tp1y = -CONFIG.BIRD_BASE;

  const tp2x = 0;
  const tp2y = CONFIG.BIRD_BASE;

  const tp3x = CONFIG.BIRD_HEIGHT;
  const tp3y = 0;

  ctx.fillStyle = "rgb(0, 0, 0)";
  // ctx.arc(bird.position.x, bird.position.y, 2, 0, 2 * Math.PI);
  ctx.moveTo(tp1x, tp1y);
  ctx.lineTo(tp2x, tp2y);
  ctx.lineTo(tp3x, tp3y);
  ctx.fill();
  ctx.restore();
}

export function drawBirdAcceleration(bird, ctx) {
  ctx.beginPath();
  ctx.strokeStyle = "rgba(255, 0, 0, 0.3)";
  ctx.moveTo(bird.position.x, bird.position.y);
  ctx.lineTo(
    bird.position.x + bird.acceleration.x * 200,
    bird.position.y + bird.acceleration.y * 200
  );
  ctx.lineWidth = 1;
  ctx.stroke();
}

export function drawBirdVelocity(bird, ctx) {
  ctx.moveTo(bird.position.x, bird.position.y);
  ctx.beginPath();
  ctx.strokeStyle = "rgba(0, 0, 255, 0.1)";
  ctx.lineWidth = 1;
  ctx.moveTo(bird.position.x, bird.position.y);
  ctx.lineTo(
    bird.position.x - bird.velocity.x * 10,
    bird.position.y - bird.velocity.y * 10
  );
  ctx.stroke();
}

export function drawAttractor(attractor, ctx) {
  ctx.fillStyle = "rgba(255, 0, 0, 0.1)";
  ctx.fillRect(attractor.x, attractor.y, 5, 5);
}
