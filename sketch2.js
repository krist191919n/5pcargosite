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

let fileInput, dotSlider, stepSlider, depthSlider;
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
   UI CREATION
---------------------------- */
function createUI() {
  const ui = document.getElementById("ui-layer");

  fileInput = createFileInput(handleFile);
  fileInput.parent(ui);

  dotSlider = createSlider(1, 20, dotSize, 1);
  dotSlider.parent(ui);

  stepSlider = createSlider(5, 50, step, 1);
  stepSlider.parent(ui);
  stepSlider.input(() => {
    if (img) setupParticles();
  });

  depthSlider = createSlider(0.2, 2.0, depthAmt, 0.01);
  depthSlider.parent(ui);
  depthSlider.input(() => {
    depthAmt = depthSlider.value();
  });
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

  let scaleFactor = min(width / img.width, height / img.height) * 1.4;
  viewZ = -800 * scaleFactor;

  for (let x = 0; x < img.width; x += step) {
    for (let y = 0; y < img.height; y += step) {
      let i = (x + y * img.width) * 4;
      if (img.pixels[i + 3] < 10) continue;

      let r = img.pixels[i];
      let g = img.pixels[i + 1];
      let b = img.pixels[i + 2];
      let br = (r + g + b) / 3;
      let z = map(br, 0, 255, depthMin, depthMax);

      let px = x - img.width / 2;
      let py = y - img.height / 2;

      particles.push({
        sx: px * scaleFactor,
        sy: py * scaleFactor,
        sz: z * scaleFactor * 0.9,
        c: color(r, g, b)
      });
    }
  }
}

/* ---------------------------
   DRAW
---------------------------- */
function draw() {
  background(0);
  if (!img) return;

  translate(0, 0, viewZ);

  depthAmt = depthSlider.value();

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
   SCROLL ZOOM
---------------------------- */
function mouseWheel(e) {
  depthAmt += e.delta * -0.001;
  depthAmt = constrain(depthAmt, 0.2, 2.0);
  depthSlider.value(depthAmt);
}

/* ---------------------------
   RESIZE
---------------------------- */
function windowResized() {
  let w = container.offsetWidth;
  let h = container.offsetHeight;
  resizeCanvas(w, h);

  if (img) setupParticles();
}
