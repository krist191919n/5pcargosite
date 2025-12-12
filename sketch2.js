/* ============================================================
   Cargo-safe, mobile-compatible p5.js 3D particle image viewer
   Works inside #p5-container and supports touch + sliders
   ============================================================ */

let img;
let particles = [];

let step = 20;
let depthMin = -200;
let depthMax = 200;

let fileInput;
let dotSlider, stepSlider, depthSlider;

let dotSize = 5;
let depthAmt = 0.4;

let viewZ = -400;

let targetRotX = 0;
let targetRotY = 0;
let rotX = 0;
let rotY = 0;

let container;

/* ---------------------------
   SETUP
---------------------------- */
function setup() {
  container = document.getElementById("p5-container");

  let w = container.offsetWidth;
  let h = container.offsetHeight;

  let cnv = createCanvas(w, h, WEBGL);
  cnv.parent("p5-container");

  pixelDensity(1);

  createUI();
}

/* ---------------------------
   CREATE UI
---------------------------- */
function createUI() {
  // File input
  fileInput = createFileInput(handleFile);
  fileInput.parent("p5-container");
  fileInput.style("position", "absolute");
  fileInput.style("left", "10px");
  fileInput.style("top", "10px");
  fileInput.style("z-index", "10");

  // -----------------------------
  // Dot slider
  // -----------------------------
  dotSlider = createSlider(1, 20, dotSize, 1);
  dotSlider.parent("p5-container");
  dotSlider.style("position", "absolute");
  dotSlider.style("left", "10px");
  dotSlider.style("top", "50px");
  dotSlider.style("width", "120px");

  // -----------------------------
  // Step slider
  // -----------------------------
  stepSlider = createSlider(5, 50, step, 1);
  stepSlider.parent("p5-container");
  stepSlider.style("position", "absolute");
  stepSlider.style("left", "10px");
  stepSlider.style("top", "90px");
  stepSlider.style("width", "120px");
  stepSlider.input(() => {
    if (img) setupParticles();
  });

  // -----------------------------
  // Depth slider
  // -----------------------------
  depthSlider = createSlider(0.2, 2.0, depthAmt, 0.01);
  depthSlider.parent("p5-container");
  depthSlider.style("position", "absolute");
  depthSlider.style("left", "10px");
  depthSlider.style("top", "130px");
  depthSlider.style("width", "120px");
}

/* ---------------------------
   LOAD IMAGE
---------------------------- */
function handleFile(file) {
  if (file.type === "image") {
    img = loadImage(file.data, () => {
      setupParticles();
    });
  }
}

/* ---------------------------
   BUILD PARTICLES
---------------------------- */
function setupParticles() {
  if (!img) return;

  particles = [];
  img.loadPixels();

  step = stepSlider.value();
  dotSize = dotSlider.value();
  depthAmt = depthSlider.value();

  let scaleFactor = min(width / img.width, height / img.height) * 1.4;
  viewZ = -800 * scaleFactor;

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

      particles.push({
        sx, sy, sz,
        c: color(r, g, b)
      });
    }
  }
}

/* ---------------------------
   DRAW LOOP
---------------------------- */
function draw() {
  background(0);

  if (!img || particles.length === 0) return;

  translate(0, 0, viewZ);

  depthAmt = depthSlider.value();

  // mouse/touch rotation
  if (mouseIsPressed || touches.length > 0) {
    targetRotY += movedX * 0.01;
    targetRotX -= movedY * 0.01;
    targetRotX = constrain(targetRotX, -PI/2, PI/2);
  }

  rotX = lerp(rotX, targetRotX, 0.08);
  rotY = lerp(rotY, targetRotY, 0.08);

  rotateX(rotX);
  rotateY(rotY);

  dotSize = dotSlider.value();

  noStroke();

  for (let p of particles) {
    push();
    translate(p.sx, p.sy, p.sz * depthAmt);
    fill(p.c);
    box(dotSize);
    pop();
  }
}

/* ---------------------------
   Mouse wheel = zoom
---------------------------- */
function mouseWheel(event) {
  depthAmt += event.delta * -0.001;
  depthAmt = constrain(depthAmt, 0.2, 2.0);
  depthSlider.value(depthAmt);
}

/* ---------------------------
   Resize canvas with container
---------------------------- */
function windowResized() {
  let w = container.offsetWidth;
  let h = container.offsetHeight;

  resizeCanvas(w, h);

  if (img) setupParticles();
}
