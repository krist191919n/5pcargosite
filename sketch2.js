
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
      console.log('Image loaded!');
      setupParticles(); // rebuild particles array
    });
  } else {
    console.error('Not an image file!');
  }
}

function setupParticles() {
  particles = [];
  img.loadPixels();
  let step = 20;
  let depthMin = -200;
  let depthMax = 200;

  for (let x = 0; x < img.width; x += step) {
    for (let y = 0; y < img.height; y += step) {
      let i = (x + y * img.width) * 4;
      let r = img.pixels[i];
      let g = img.pixels[i+1];
      let b = img.pixels[i+2];
      let a = img.pixels[i+3];
      if (a < 10) continue;
      let brightness = (r+g+b)/3;
      let z = map(brightness,0,255,depthMin,depthMax);
      let px = x - img.width/2;
      let py = y - img.height/2;
      particles.push({px, py, z, c: color(r,g,b)});
    }
  }
  console.log('Particles loaded:', particles.length);
}

// Smooth rotation state

function draw() {
  background(0);
  translate(-img.widht/2*scaleFactor, -img.height/2*scaleFactor, -400)
  translate(0, 0, -300);
  scale(0.6);

  // Only update target rotation WHILE dragging
  if (mouseIsPressed) {
    targetRotY += movedX * 0.01;
    targetRotX -= movedY * 0.01;
  }
  function mouseWheel(event) {
  depthAmt += event.delta * -0.001;
}

  // Smooth easing toward target rotation
  rotX = lerp(rotX, targetRotX, 0.08);
  rotY = lerp(rotY, targetRotY, 0.08);

  // Keep depth useful / safe
  depthAmt = constrain(depthAmt, 0.2, 1.8);

  // Apply rotation
  rotateX(rotX);
  rotateY(rotY);

  // Draw particles
  noStroke();
  for (let p of particles) {
    push();
    let dz = lerp(0, p.z, depthAmt);
    translate(p.px, p.py, dz);
    fill(p.c);
    box(dotSize, 6, 6);
    pop();
  }


  }
