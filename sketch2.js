// sketch.js — robust, scaled particle positions with sliders

let img;
let particles = [];
let step = 20;
let depthMin = -200;
let depthMax = 200;
let fileInput;
let dotSize = 5;
let time = 0;
let viewZ = -400;
let targetRotX = 0;
let targetRotY = 0;
let rotX = 0;
let rotY = 0;
let depthAmt = 0.4;

// sliders
let dotSlider, stepSlider;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pixelDensity(1);

  // File input
  fileInput = createFileInput(handleFile);
  fileInput.position(width / 2 - 60, 20);
  fileInput.style('position', 'fixed');
  fileInput.style('z-index', '10');

  // Dot size slider
  dotSlider = createSlider(1, 20, dotSize, 1);
  dotSlider.position(20, 50);
  dotSlider.style('width', '150px');

  // Step slider
  stepSlider = createSlider(5, 50, step, 1);
  stepSlider.position(20, 80);
  stepSlider.style('width', '150px');
  stepSlider.input(() => {
    if (img) setupParticles(); // rebuild particles immediately
  });
}

function handleFile(file) {
  if (file.type === 'image') {
    img = loadImage(file.data, () => {
      console.log('Image loaded!');
      setupParticles(); // build scaled particles now that img exists
    });
  } else {
    console.error('Not an image file!');
  }
}

function setupParticles() {
  particles = [];
  if (!img) return;

  img.loadPixels();

  step = stepSlider.value(); // get current step
  dotSize = dotSlider.value(); // get current dot size

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
        px, py, z,
        sx, sy, sz,
        c: color(r, g, b)
      });
    }
  }

  console.log('Particles created:', particles.length, 'scaleFactor:', scaleFactor);
}

function draw() {
  background(0);

  if (!img || particles.length === 0) return;

  translate(0, 0, viewZ);

  if (mouseIsPressed) {
    targetRotY += movedX * 0.01;
    targetRotX -= movedY * 0.01;
    targetRotX = constrain(targetRotX, -PI / 2, PI / 2);
  }

  rotX = lerp(rotX, targetRotX, 0.08);
  rotY = lerp(rotY, targetRotY, 0.08);

  rotateX(rotX);
  rotateY(rotY);

  depthAmt = constrain(depthAmt, 0.2, 2.0);

  dotSize = dotSlider.value();

  noStroke();
  for (let p of particles) {
    push();
    translate(p.sx, p.sy, lerp(0, p.sz, depthAmt));
    fill(p.c);
    box(dotSize);
    pop();
  }
}


}

// rebuild canvas & particles on resize
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (fileInput) fileInput.position(width / 2 - 60, 20);
  if (img) setupParticles();
}
