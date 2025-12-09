// sketch.js — robust, scaled particle positions so the image always fits & is centered

let img;
let particles = [];
let step = 20;
let depthMin = -200;
let depthMax = 200;
let fileInput;
let dotSize = 5;
let time = 0;

let targetRotX = 0;
let targetRotY = 0;
let rotX = 0;
let rotY = 0;
let depthAmt = 0.4;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pixelDensity(1);

  // Create a file input and float it above the canvas
  fileInput = createFileInput(handleFile);
  fileInput.position(width / 2 - 60, 20);
  fileInput.style('position', 'fixed');
  fileInput.style('z-index', '10');
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
  img.loadPixels();

  // compute scale factor so the artwork fits inside the canvas nicely
  // adjust the multiplier (0.45) to change how much of the canvas the art occupies
  let scaleFactor = min(width / img.width, height / img.height) * 0.7;

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

      // original centered coordinates (image space)
      let px = x - img.width / 2;
      let py = y - img.height / 2;

      // scaled coordinates in canvas space (WEBGL origin is canvas center)
      let sx = px * scaleFactor;
      let sy = py * scaleFactor;
      let sz = z * scaleFactor * 0.9; // scale z a bit less so depth feels natural

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

  // nothing to draw until the user uploads an image
  if (!img || particles.length === 0) {
    return;
  }

  // push the whole scene back so the particles sit comfortably in view
  // the value below is in canvas units (since we pre-scaled positions)
  translate(0, 0, -600);

  // only rotate while pressed (user "grabs" the art)
  if (mouseIsPressed) {
    targetRotY += movedX * 0.01; // horizontal control (positive = right)
    targetRotX -= movedY * 0.01; // vertical control (negative = move down tilts away)
    targetRotX = constrain(targetRotX, -PI / 2, PI / 2);
  }

  // smooth easing
  rotX = lerp(rotX, targetRotX, 0.08);
  rotY = lerp(rotY, targetRotY, 0.08);

  // apply rotation
  rotateX(rotX);
  rotateY(rotY);

  depthAmt = constrain(depthAmt, 0.2, 2.0);

  noStroke();
  for (let p of particles) {
    push();
    // use precomputed scaled screen coords (sx, sy), and scale z by depthAmt
    translate(p.sx, p.sy, lerp(0, p.sz, depthAmt));
    fill(p.c);
    box(dotSize);
    pop();
  }
}

// zoom with mouse wheel (flatten / pop)
function mouseWheel(event) {
  depthAmt += event.delta * -0.001;
}

// rebuild canvas & particles on resize so scaleFactor updates
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // reposition file input in case width changed
  if (fileInput) {
    fileInput.position(width / 2 - 60, 20);
  }
  // if we have an image, rebuild scaled particles
  if (img) {
    setupParticles();
  }
}
