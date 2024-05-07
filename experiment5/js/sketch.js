// sketch.js - Ex5 Evolutionary Impressions
// Author: Alex Leghart
// Date: may 07 2024

/* exported preload, setup, draw */
/* global memory, dropper, mode, restart, rate, slider, activeScore, bestScore, fpsCounter */
/* global getInspirations, initDesign, renderDesign, mutateDesign */

let bestDesign;
let currentDesign;
let currentScore;
let currentInspiration;
let currentCanvas;
let currentInspirationPixels;

function preload() {
  

  let allInspirations = getInspirations();

  for (let i = 0; i < allInspirations.length; i++) {
    let insp = allInspirations[i];
    insp.image = loadImage(insp.assetUrl);
    let option = document.createElement("option");
    option.value = i;
    option.innerHTML = insp.name;
    dropper.appendChild(option);
  }
  dropper.onchange = e => inspirationChanged(allInspirations[e.target.value]);
  currentInspiration = allInspirations[0];

  restart.onclick = () =>
    inspirationChanged(allInspirations[dropper.value]);
  
  let selfSplash = document.createElement("p")
  let selfUpload = document.createElement("INPUT");
  const node = document.createTextNode("Your own image url:");
  selfSplash.appendChild(node);  
  selfUpload.setAttribute("type", "url");
  selfUpload.innerHTML = "Upload Image"
  selfUpload.id = "upload"
  selfSplash.appendChild(selfUpload)
  let cc = document.getElementById("canvas-container")
  cc.prepend(selfSplash)
  selfUpload.onchange = function () {
   
    let c = loadImage(getUploadedPath(), ()=>{
      console.log("good url");
      allInspirations[3].image = c;
      let wh = floor(max(c.width/200, c.height/200))
      if (wh < 1 ) { wh = 1}
      allInspirations[3].whRatio = wh
      inspirationChanged(allInspirations[dropper.value]); 
    }, ()=>{console.log("bad img url")})
  }
  

  let option1 = document.createElement("option");
  option1.value = "e";
  option1.innerHTML = "Circle";
  mode.appendChild(option1);
  let option2 = document.createElement("option");
  option2.value = "r";
  option2.innerHTML = "Square";
  mode.appendChild(option2);
  let option3 = document.createElement("option");
  option3.value = "t";
  option3.innerHTML = "Triangle";
  mode.appendChild(option3);
  mode.onchange = function() {
    inspirationChanged(allInspirations[dropper.value]); 
  }
  
}

function getUploadedPath(){
  try{
    console.log(document.getElementById("upload").value)
    return document.getElementById("upload").value
  } catch (e) {
    //do stuff
    console.log("yeah bad fp")
  }
  
  return false
}

function inspirationChanged(nextInspiration) {
  currentInspiration = nextInspiration;
  currentDesign = undefined;
  memory.innerHTML = "";
  currentInspiration.shape = mode.value
  setup();
}



function setup() {
  currentCanvas = createCanvas(width, height);
  currentCanvas.parent(document.getElementById("active"));
  currentScore = Number.NEGATIVE_INFINITY;
  currentDesign = initDesign(currentInspiration);
  bestDesign = currentDesign;
  image(currentInspiration.image, 0,0, width, height);
  loadPixels();
  currentInspirationPixels = pixels;
}

function evaluate() {
  loadPixels();

  let error = 0;
  let n = pixels.length;
  
  for (let i = 0; i < n; i++) {
    error += sq(pixels[i] - currentInspirationPixels[i]);
  }
  return 1/(1+error/n);
}



function memorialize() {
  let url = currentCanvas.canvas.toDataURL();

  let img = document.createElement("img");
  img.classList.add("memory");
  img.src = url;
  img.width = width;
  img.heigh = height;
  img.title = currentScore;

  document.getElementById("best").innerHTML = "";
  document.getElementById("best").appendChild(img.cloneNode());

  img.width = width / 2;
  img.height = height / 2;

  memory.insertBefore(img, memory.firstChild);

  if (memory.childNodes.length > memory.dataset.maxItems) {
    memory.removeChild(memory.lastChild);
  }
}

let mutationCount = 0;

function draw() {
  
  if(!currentDesign) {
    return;
  }
  randomSeed(mutationCount++);
  currentDesign = JSON.parse(JSON.stringify(bestDesign));
  rate.innerHTML = slider.value;
  mutateDesign(currentDesign, currentInspiration, slider.value/100.0);
  
  randomSeed(0);
  renderDesign(currentDesign, currentInspiration);
  let nextScore = evaluate();
  activeScore.innerHTML = nextScore;
  if (nextScore > currentScore) {
    currentScore = nextScore;
    bestDesign = currentDesign;
    memorialize();
    bestScore.innerHTML = currentScore;
  }
  
  fpsCounter.innerHTML = Math.round(frameRate());
}


/* exported getInspirations, initDesign, renderDesign, mutateDesign */

function getInspirations() {
  return [
    {
      name: "bliss",
      assetUrl:
        "https://cdn.glitch.global/a54807c8-0450-488b-875d-1f2a3889215a/bliss-downscaled.png?v=1714782326138",
      source: "Credit Charles O'Rear, Microsoft, upscaler unknown",
      whRatio: 10,
      shape: "e",
      bg: [0, 30, 0, 255],
    },
    {
      name: "nether",
      assetUrl:
        "https://cdn.glitch.global/a54807c8-0450-488b-875d-1f2a3889215a/zoom-bg-nether.webp?v=1714772272942",
      source: "myself",
      whRatio: 10,
      shape: "r",
      bg: [80, 0, 0, 255],
    },
    {
      name: "mountain",
      assetUrl:
        "https://cdn.glitch.global/a54807c8-0450-488b-875d-1f2a3889215a/snowy.png?v=1714797254711",
      source: "wallpaperaccess",
      whRatio: 10,
      shape: "t",
      bg: [0, 0, 0, 255],
    },
    {
      name: "Your Image",
      assetUrl:
        "https://cdn.glitch.global/24cc2402-bdc0-4ca8-bf2e-acba0f3428c5/empty-image-image.png?v=1714853662822",
      whRatio: 8,
      shape: "e",
      bg: [0, 0, 0, 255],
    },
  ];
}

function initDesign(insp) {
  insp.image.loadPixels();
  resizeCanvas(
    insp.image.width / insp.whRatio,
    insp.image.height / insp.whRatio
  );
  let design = {
    bg: insp.bg,
    shapes: [],
    minR: 5,
    maxR:
      Math.max(insp.image.width / 2, insp.image.height / 2) /
      insp.whRatio /
      3.5,
    alphaBase: 100,
    alphaSub: 70,
    numShapes: 2000,
  };
  //create a series of random points and radiuseseses. these will be converted to shapes in the render func
  let _x, _y, _r, _rot, _alpha;
  for (let i = 0; i <= design.numShapes; i++) {
    _x = floor(random(insp.image.width));
    _y = floor(random(insp.image.height));
    _alpha = random();
    _r = lerp(design.minR, design.maxR, map(i, 0, design.numShapes, 1, 0));
    _rot = random() * 3;
    design.shapes.push({
      x: _x / insp.whRatio,
      y: _y / insp.whRatio,
      r: _r,
      col: getColorIndex(_x, _y, insp.image),
      a: design.alphaBase - _alpha * design.alphaSub,
      rot: _rot,
    });
  }

  return design;
}

function renderDesign(design, insp) {
  background(design.bg[0], design.bg[1], design.bg[2], design.bg[3]);
  noStroke();
  for (let s of design.shapes) {
    switch (insp.shape) {
    case "e":
      fill(s.col[0], s.col[1], s.col[2], s.a);
      ellipse(s.x, s.y, s.r);
      noFill();
      break;
    case "r":
      fill(s.col[0], s.col[1], s.col[2], s.a);
      rect(s.x - s.r / 2, s.y - s.r / 2, s.r, s.r);
      noFill();
      break;
    case "t":
      fill(s.col[0], s.col[1], s.col[2], s.a);
      push();
      translate(s.x, s.y);
      rotate(s.rot);
      triangle(0 - s.r / 2, 0, 0 + s.r / 2, 0, 0, 0 - s.r);
      pop();
      noFill();
      break;
    }
  }
}

function mutateDesign(design, insp, rate) {
  let _x, _y, _r, _rot, _alpha;
  for (let s of design.shapes) {
    _x = s.x * insp.whRatio;
    _y = s.y * insp.whRatio;
    _x = floor(mut(_x, 0, insp.image.width - 1, rate));
    _y = floor(mut(_y, 0, insp.image.height - 1, rate));
    if (_x >= insp.image.width) {
      throw "amogus";
    }
    _r = mut(s.r, design.minR, design.maxR, rate);
    _alpha =
      design.alphaBase - map(_r, design.minR, design.maxR, 0, design.alphaSub); //don't mut, rather map from size to percentage of max size.
    _rot = mut(s.rot, 0, 3, rate);
    s.x = _x / insp.whRatio;
    s.y = _y / insp.whRatio;
    s.r = _r;
    s.col = getColorIndex(floor(_x), floor(_y), insp.image);
    s.a = _alpha;
    s.rot = _rot;
  }
}

function mut(num, min, max, rate) {
  return constrain(randomGaussian(num, (rate * (max - min)) / 10), min, max);
}

function getColorIndex(xpos, ypos, img) {
  let index = (ypos * img.width + xpos) * 4;
  let rval = [img.pixels[index], img.pixels[index + 1], img.pixels[index + 2]];
  if (index >= img.pixels.length) {
    throw "out o'bounds";
  }
  return rval;
}
