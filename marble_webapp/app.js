class Game {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");

    // Game state
    this.gameState = 'loading'; // 'loading', 'playing', 'won'
    this.assets = {};
    this.friction = 0.98;
    this.sensitivity = 0.5;

    // Input state
    this.keys = {};
    this.tilt = { x: 0, y: 0 };
    this.tiltOffset = { x: 0, y: 0 };
    
    // Game objects (will be defined in resize)
    this.marble = {};
    this.goal = {};
    this.holes = [];
    this.level = {
        start: { x: 0.1, y: 0.1 },
        goal: { x: 0.9, y: 0.9, r: 0.05 },
        holes: [
            { x: 0.3, y: 0.4, r: 0.04 },
            { x: 0.6, y: 0.2, r: 0.04 },
            { x: 0.7, y: 0.7, r: 0.04 },
            { x: 0.2, y: 0.8, r: 0.04 },
        ]
    };

    // UI Elements
    this.resetTiltBtn = document.getElementById('resetTiltBtn');
    this.sensitivitySlider = document.getElementById('sensitivitySlider');
    this.winMessage = document.getElementById('win-message');
    this.playAgainBtn = document.getElementById('play-again-btn');
  }

  async init() {
    await this.loadAssets();
    this.setupEventListeners();
    this.resize(); // Initial size calculation
    this.restart();
    this.gameState = 'playing';
    this.gameLoop();
  }

  loadAssets() {
    const assetPromises = [
      this.loadImage('marble', 'assets/marble.png'),
      this.loadImage('hole', 'assets/hole.png'),
      this.loadImage('goal', 'assets/goal.png'),
      this.loadImage('background', 'assets/background.jpg'),
    ];
    return Promise.all(assetPromises);
  }

  loadImage(key, src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        this.assets[key] = img;
        resolve();
      };
      img.onerror = reject;
    });
  }

  setupEventListeners() {
    // Keyboard
    document.addEventListener('keydown', e => this.keys[e.key.toLowerCase()] = true);
    document.addEventListener('keyup', e => this.keys[e.key.toLowerCase()] = false);

    // Device Tilt
    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', e => {
        if (e.accelerationIncludingGravity) {
            // Adjust axis for intuitive control
            this.tilt.x = e.accelerationIncludingGravity.x * -2;
            this.tilt.y = e.accelerationIncludingGravity.y * -2;
        }
      });
    }

    // Window Resize/Orientation Change
    window.addEventListener('resize', () => this.resize());
    
    // UI Controls
    this.resetTiltBtn.addEventListener('click', () => {
        this.tiltOffset.x = this.tilt.x;
        this.tiltOffset.y = this.tilt.y;
    });
    this.sensitivitySlider.addEventListener('input', e => this.sensitivity = Number(e.target.value));
    this.playAgainBtn.addEventListener('click', () => this.restart());
  }
  
  resize() {
    const size = this.canvas.parentElement.getBoundingClientRect().width;
    this.canvas.width = size;
    this.canvas.height = size;
    
    // Recalculate all game object sizes and positions based on the new canvas size
    const scale = (obj, relativePos) => {
        obj.x = relativePos.x * size;
        obj.y = relativePos.y * size;
        obj.r = (relativePos.r || 0.025) * size; // Default marble radius
    }
    
    scale(this.marble, this.level.start);
    scale(this.goal, this.level.goal);
    this.holes = this.level.holes.map(h => {
        const hole = {};
        scale(hole, h);
        return hole;
    });
    
    // Force a redraw
    this.draw();
  }

  restart() {
    const size = this.canvas.width;
    this.marble.x = this.level.start.x * size;
    this.marble.y = this.level.start.y * size;
    this.marble.vx = 0;
    this.marble.vy = 0;
    
    this.winMessage.classList.add('hidden');
    this.gameState = 'playing';
  }

  update() {
    if (this.gameState !== 'playing') return;

    // 1. Calculate input force
    let forceX = 0;
    let forceY = 0;

    // Keyboard input (for desktop)
    const keySensitivity = 5;
    if (this.keys['w'] || this.keys['arrowup']) forceY -= keySensitivity;
    if (this.keys['s'] || this.keys['arrowdown']) forceY += keySensitivity;
    if (this.keys['a'] || this.keys['arrowleft']) forceX -= keySensitivity;
    if (this.keys['d'] || this.keys['arrowright']) forceX += keySensitivity;

    // Tilt input (for mobile)
    const finalTiltX = this.tilt.x - this.tiltOffset.x;
    const finalTiltY = this.tilt.y - this.tiltOffset.y;
    forceX += finalTiltX;
    forceY -= finalTiltY; // Invert Y-axis for natural feel

    // 2. Apply forces to velocity
    this.marble.vx += forceX * this.sensitivity * 0.1;
    this.marble.vy += forceY * this.sensitivity * 0.1;

    // 3. Apply friction
    this.marble.vx *= this.friction;
    this.marble.vy *= this.friction;

    // 4. Update position
    this.marble.x += this.marble.vx;
    this.marble.y += this.marble.vy;

    // 5. Collision detection
    // Walls
    if (this.marble.x < this.marble.r) { this.marble.x = this.marble.r; this.marble.vx *= -0.5; }
    if (this.marble.x > this.canvas.width - this.marble.r) { this.marble.x = this.canvas.width - this.marble.r; this.marble.vx *= -0.5; }
    if (this.marble.y < this.marble.r) { this.marble.y = this.marble.r; this.marble.vy *= -0.5; }
    if (this.marble.y > this.canvas.height - this.marble.r) { this.marble.y = this.canvas.height - this.marble.r; this.marble.vy *= -0.5; }

    // Holes
    for (const hole of this.holes) {
      if (this.checkCollision(this.marble, hole)) {
        this.restart();
        return;
      }
    }

    // Goal
    if (this.checkCollision(this.marble, this.goal)) {
      this.gameState = 'won';
      this.winMessage.classList.remove('hidden');
    }
  }
  
  checkCollision(obj1, obj2) {
      const dx = obj1.x - obj2.x;
      const dy = obj1.y - obj2.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      // Fall in if center is over the hole radius
      return distance < obj2.r;
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Background
    if (this.assets.background) {
        this.ctx.drawImage(this.assets.background, 0, 0, this.canvas.width, this.canvas.height);
    } else {
        this.ctx.fillStyle = '#d2b48c'; // Fallback color
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Draw helper function for sprites
    const drawSprite = (asset, obj) => {
        if (this.assets[asset]) {
            this.ctx.drawImage(this.assets[asset], obj.x - obj.r, obj.y - obj.r, obj.r * 2, obj.r * 2);
        }
    };

    // Draw Goal, Holes, and Marble
    drawSprite('goal', this.goal);
    this.holes.forEach(hole => drawSprite('hole', hole));
    drawSprite('marble', this.marble);
  }

  gameLoop() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.gameLoop());
  }
}

// Kickstart the game
const game = new Game('gameCanvas');
game.init();