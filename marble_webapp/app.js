const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let angleX = 0;
let angleY = 0;
let velocity = {x: 0, y: 0};
let marble = {x: 50, y: 50, r: 10};
const startPoint = {x: 50, y: 50};
const goal = {x: canvas.width - 60, y: canvas.height - 60, r: 20};
const holes = [
  {x: 150, y: 150, r: 15},
  {x: 300, y: 200, r: 15},
  {x: 400, y: 400, r: 15}
];
const friction = 0.98;
const sensitivity = 0.5;

const keys = {};
document.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
document.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

// Mobile tilt support
if (window.DeviceMotionEvent) {
  window.addEventListener('devicemotion', e => {
    if (e.accelerationIncludingGravity) {
      angleX = e.accelerationIncludingGravity.x*0.1; // Scale down for sensitivity
      angleY = e.accelerationIncludingGravity.y*0.1; // Scale down for sensitivity
    }
  });
}

function restartGame() {
  marble.x = startPoint.x;
  marble.y = startPoint.y;
  velocity = {x: 0, y: 0};
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Goal
  ctx.fillStyle = "green";
  ctx.beginPath();
  ctx.arc(goal.x, goal.y, goal.r, 0, Math.PI * 2);
  ctx.fill();

  // Holes
  ctx.fillStyle = "black";
  for (const hole of holes) {
    ctx.beginPath();
    ctx.arc(hole.x, hole.y, hole.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Marble
  ctx.fillStyle = "blue";
  ctx.beginPath();
  ctx.arc(marble.x, marble.y, marble.r, 0, Math.PI * 2);
  ctx.fill();

  // Debug
  ctx.fillStyle = "black";
  ctx.font = "14px sans-serif";
  ctx.fillText(`angleX: ${angleX.toFixed(2)} angleY: ${angleY.toFixed(2)}`, 10, 20);
}

function update() {
  // WASD simulation
  let keyboardAngleX = 0;
  let keyboardAngleY = 0;
  if (keys['w']) keyboardAngleY -= 1;
  if (keys['s']) keyboardAngleY += 1;
  if (keys['a']) keyboardAngleX -= 1;
  if (keys['d']) keyboardAngleX += 1;

  // Kombiniere Tastatur und DeviceMotion
  const totalAngleX = angleX + keyboardAngleX;
  const totalAngleY = angleY + keyboardAngleY;

  velocity.x += totalAngleX * sensitivity;
  velocity.y += totalAngleY * sensitivity;
  velocity.x *= friction;
  velocity.y *= friction;

  marble.x += velocity.x;
  marble.y += velocity.y;

  // Wall clamp
  marble.x = Math.max(marble.r, Math.min(canvas.width - marble.r, marble.x));
  marble.y = Math.max(marble.r, Math.min(canvas.height - marble.r, marble.y));

  // Hole check
  for (const hole of holes) {
    const dx = marble.x - hole.x;
    const dy = marble.y - hole.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < marble.r + hole.r) {
      restartGame();
      return;
    }
  }

  // Goal check
  const dx = marble.x - goal.x;
  const dy = marble.y - goal.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < marble.r + goal.r) {
    alert("You reached the goal!");
    restartGame();
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
