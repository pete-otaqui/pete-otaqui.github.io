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

export function addVector(v1, v2, clamper = identity) {
  return clampVector(
    {
      x: v1.x + v2.x,
      y: v1.y + v2.y,
    },
    clamper
  );
}
export function clampVector(vector, clamper) {
  return {
    x: clamper(vector.x),
    y: clamper(vector.y),
  };
}

export function clampBirdVelocity(bird) {
  const vClamper = clamper(bird.vClampMax, bird.vClampMin);
  return {
    ...bird,
    velocity: clampVector(bird.velocity, vClamper),
  };
}

export function clampBirdAcceleration(bird) {
  const aClamper = clamper(bird.aClampMax, bird.aClampMin);
  return {
    ...bird,
    acceleration: clampVector(bird.acceleration, aClamper),
  };
}

export function createVector(x, y) {
  return { x, y };
}

export function createBird(position, velocity, acceleration) {
  return {
    position,
    velocity,
    acceleration,
    vClampMax: range(CONFIG.V_MAX_LO, CONFIG.V_MAX_HI),
    vClampMin: range(CONFIG.V_MIN_LO, CONFIG.V_MIN_HI),
    aClampMax: range(CONFIG.A_MAX_LO, CONFIG.A_MAX_HI),
    aClampMin: range(CONFIG.A_MIN_LO, CONFIG.A_MIN_HI),
  };
}
export function vectorDifference(v1, v2) {
  const dx = v2.x - v1.x;
  const dy = v2.y - v1.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const theta = Math.atan2(dy, dx);
  return { distance, theta };
}

export function identity(n) {
  return n;
}

export function round(num, sf = 0) {
  if (!sf) {
    return Math.round(num);
  } else {
    return Math.round(num * Math.pow(10, sf)) / Math.pow(10, sf);
  }
}

export function clamp(num, max, min) {
  return Math.min(max, Math.max(min, num));
}

export function clamper(max, min) {
  return (num) => clamp(num, max, min);
}

export function range(min, max) {
  return min + Math.random() * (max - min);
}

const GRAVITY = 5;
export function accelerate(v1, v2, factor, accelerationClamper = identity) {
  const { distance, theta } = vectorDifference(v1, v2);
  if (distance < 40) {
    return createVector(0, 0);
  }
  const acc = GRAVITY / distance;
  const oax = factor * acc * Math.cos(theta);
  const oay = factor * acc * Math.sin(theta);
  const ax = accelerationClamper(oax);
  const ay = accelerationClamper(oay);
  return createVector(ax, ay);
}

export function clear(ctx, canvas) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(0, 0, 0, 0)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
  ctx.beginPath();
}

export function accelerateBird(bird, birds, attractors) {
  let acceleration = createVector(0, 0);
  attractors.forEach((thing) => {
    const thingAcceleration = accelerate(bird.position, thing, 1);
    acceleration = addVector(acceleration, thingAcceleration);
  });
  bird.acceleration = acceleration;
  // bird = clampBirdAcceleration(bird);
  bird.velocity = addVector(bird.velocity, acceleration);
  // bird = clampBirdVelocity(bird);
  bird.position = addVector(bird.position, bird.velocity);
}
