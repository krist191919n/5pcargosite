
let img;
let particles = [];
let step =20;
let depthMin = -200;
let depthMax = 200;
let fileInput;
let dotSize = 7;
let time = 0;
let targetRotX = 0;
let targetRotY = 0;
let rotX = 0;
let rotY = 0;
let depthAmt = 0.4;




function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pixelDensity(1);

  // Create a file input
  fileInput = createFileInput(handleFile);
  fileInput.position(width/2-60,20);
  fileInput.style('position','absolute');
  fileInput.style('z-index','10');
}

function handleFile(file) {
  if (file.type === 'image') {
    img = loadImage(file.data, () => {
      console.log("Image loaded!");
      setupParticles();   // rebuild depth points
    });
  } else {
    console.error("Not an image file!");
  }
}

function setupParticles() {
  particles = [];
  img.loadPixels();

  const step = 20;
  const depthMin = -200;
  const depthMax = 200;

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

      particles.push({
        px: x - img.width / 2,
        py: y - img.height / 2,
        z,
        c: color(r, g, b)
      });
    }
  }

  console.log("Particles:", particles.length);
}
// Smooth rotation state

function draw() {
  background(0);

  // Don't draw until image and particles exist
  if (!img || particles.length === 0) return;

  // Fit artwork to window (adjust 0.4 for size)
  let scaleFactor = min(width / img.width, height / img.height) * 0.4;
  scale(scaleFactor);

  // Center artwork in WebGL space
  translate(-img.width / 2, -img.height / 2, -400);

  // Mouse rotation only while pressed
  if (mouseIsPressed) {
    targetRotY += movedX * 0.01;
    targetRotX -= movedY * 0.01;
  }

  rotX = lerp(rotX, targetRotX, 0.08);
  rotY = lerp(rotY, targetRotY, 0.08);

  rotateX(rotX);
  rotateY(rotY);

  depthAmt = constrain(depthAmt, 0.2, 1.8);

  noStroke();
  for (let p of particles) {
    push();
    translate(p.px, p.py, lerp(0, p.z, depthAmt));
    fill(p.c);
    box(dotSize);
    pop();
  }


  }
