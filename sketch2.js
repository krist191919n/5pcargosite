// --- 3D Depth Image Viewer (Mobile + Desktop) --------------------------------

let img;
let particles = [];

let step = 20;
let dotSize = 5;
let depthAmt = 0.4;

let depthMin = -200;
let depthMax = 200;

let viewZ = -400;

let targetRotX = 0;
let targetRotY = 0;
let rotX = 0;
let rotY = 0;

let fileInput;
let dotSlider, stepSlider, depthSlider;

// Touch variables
let touchActive = false;
let lastTouchX = 0;
let lastTouchY = 0;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pixelDensity(1);

  // Detect mobile
  let mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (mobile) pixelDensity(1);

  // File input
  fileInput = createFileInput(handleFile);
  fileInput.style('position', 'fixed');
  fileInput.style('z-index', '10');

  // Dot size slider
  dotSlider = createSlider(1, 20, dotSize, 1);
  dotSlider.style('position', 'fixed');
  dotSlider.style('z-index', '10');
  dotSlider.style('width', '150px');

  // Step slider
  stepSlider = createSlider(5, 50, step, 1);
  stepSlider.style('position', 'fixed');
  stepSlider.style('z-index', '10');
  stepSlider.style('width', '150px');
  stepSlider.input(() => {
    if (img) setupParticles();
  });

  // Depth slider
  depthSlider = createSlider(0.1, 2.5, depthAmt, 0.01);
  depthSlider.style('position', 'fixed');
  depthSlider.style('z-index', '10');
  depthSlider.style('width', '150px');

  // Place UI
  positionUI();
}

function positionUI() {
  let centerX = windowWidth / 2 - 75;

  fileInput.position(centerX, 20);
  dotSlider.position(centerX - 120, 70);
  stepSlider.position(centerX - 120, 100);
  depthSlider.position(centerX - 120, 130);
}

function handleFile(file) {
  if (file.type === 'image') {
    img = loadImage(file.data, () => {
      setupParticles();
      console.log("Image loaded");
    });
  } else {
    console.error("Not an image file");
  }
}

function setupParticles() {
  particles = [];
  if (!img) return;

  img.loadPixels();

  step = stepSlider.value();
  dotSize = dotSlider.value();

  let mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  let scaleFactor = min(width / img.width, height / img.height) * (mobile ? 0.8 : 1.4);

  viewZ = -600 * scaleFactor;

  for (let x = 0; x < img.width; x += step) {
    for (let y = 0; y < img.height; y += step) {

      let i = (x + y * img.width) * 4;
      let a = img.pixels[i + 3];
      if (a < 10) continue;

      let r = img.pixels[i];
      let g = img.pixels[i + 1];
      let b = img.pixels[i + 2];

      let brightness = (r + g + b) / 3;
      let z = map(brightness, 0, 255, depthMin, depthMax);

      let px = x - img.width / 2;
      let py = y - img.height / 2;

      let sx = px * scaleFactor;
      let sy = py * scaleFactor;
      let sz = z * scaleFactor * 0.9;

      particles.push({ sx, sy, sz, c: color(r, g, b) });
    }
  }

  console.log("Particles:", particles.length);
}

function draw() {
  background(0);

  if (!img || particles.length === 0) return;

  depthAmt = depthSlider.value();

  translate(0, 0, viewZ);

  // Mouse drag
  if (mouseIsPressed) {
    targetRotY += movedX * 0.01;
    targetRotX -= movedY * 0.01;
  }

  // Smooth rotation
  rotX = lerp(rotX, targetRotX, 0.08);
  rotY = lerp(rotY, targetRotY, 0.08);

  rotateX(rotX);
  rotateY(rotY);

  // Draw particles
  noStroke();
  for (let p of particles) {
    push();
    translate(p.sx, p.sy, lerp(0, p.sz, depthAmt));
    fill(p.c);
    box(dotSize);
    pop();
  }
}

// Touch controls (mobile)
function touchStarted() {
  touchActive = true;
  if (touches.length > 0) {
    lastTouchX = touches[0].x;
    lastTouchY = touches[0].y;
  }
}

function touchMoved() {
  if (touchActive && touches.length > 0) {
    let dx = touches[0].x - lastTouchX;
    let dy = touches[0].y - lastTouchY;

    targetRotY += dx * 0.01;
    targetRotX -= dy * 0.01;

    lastTouchX = touches[0].x;
    lastTouchY = touches[0].y;
  }
  return false; // prevent scroll
}

function touchEnded() {
  touchActive = false;
}

// Resize
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  positionUI();
  if (img) setupParticles();
}
