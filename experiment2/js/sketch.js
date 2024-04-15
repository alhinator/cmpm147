// sketch.js - purpose and description here
// Author: Your Name
// Date:

/* exported setup, draw */

let seed = 1; //the first like, 10 iterations all look nice w/seed=0



const Y_AXIS = 1;
const X_AXIS = 2;
const DIAG_AX = 3;

let sk1,sk2,mtn1,mtnH,mtnS,mtn2,mtn3;
let ssx_mod, ssy_mod, ssl_mod, ss_yoff
let s_rot;
let nextStep = 4000

function resizeScreen() {
  centerHorz = canvasContainer.width() / 6; // Adjusted for drawing logic
  centerVert = canvasContainer.height() / 4; // Adjusted for drawing logic
  console.log("Resizing...");
  resizeCanvas(canvasContainer.width()/3, canvasContainer.height()/2);
  // redrawCanvas(); // Redraw everything based on new size
}

function setup() {
  // place our canvas, making it fit our container
  canvasContainer = $("#canvas-container");
  let canvas = createCanvas(canvasContainer.width()/3, canvasContainer.height()/2);
  canvas.parent("canvas-container");
  // resize canvas if the page is resized

  $(window).resize(function() {
    resizeScreen();
  });
  resizeScreen();

  frameRate(30)
  let refreshButton = createButton("Reimagine").mousePressed(() => {seed++; resetStar()});
  refreshButton.parent("canvas-container")
  resetStar()

  sk1 = color(219,178,202);
  sk2 = color(29,89,141);
  mtn1 = color(125,138,162)
  mtnH = color(135, 138, 162,30)
  mtnS = color(115, 118, 162,30)
  mtn2 = color(42,68,91)
  mtn3 = color(38,66,88)
  
}

function draw() {
  console.log(frameRate())
  randomSeed(seed);
  noiseSeed(seed)
  
  background(0)
  // Sky
  setGradient(0, 0, width, height*3/4, sk1, sk2, X_AXIS);
  noStroke();

  //now do stars, going to make some that are randomly dist'ed.
  makeStarGroup(0,0,width,height*3/4,60)
  //now do a lot that are grouped together in a "nebula"
  // (and make multiple nebulas.)
  let num_neb = random()*4+1 //between 2 and 5 nebs
  for(let z = 0; z < num_neb;z++){
    let n_x, n_y, n_w, n_h
    n_x = random()*width*3/4 + width/8 //at most 3/8 from center of screen
    n_y = random()*height/2 + height/8 //at least 1/6 down the screen.
    n_w = random()*width/15+width/15
    n_h = random()*height/8+height/4
    makeStarGroup(n_x,n_y,n_w,n_h,80, true)
  }
  
  
  
  //shooting star.
  fill(255)
  angleMode(RADIANS)
  
  rotate(s_rot)
  let ss_x = -10 + ssx_mod
  let ss_y = ss_yoff + ssy_mod
  ellipse(ss_x,ss_y, random()*50+20+ssl_mod, 1);
  rotate(-s_rot)
  
  ssx_mod += 60*Math.sqrt(cos(s_rot)**2)
  ssy_mod += 60*Math.sqrt(sin(s_rot)**2)
  console.log( Math.sqrt(cos(s_rot)**2))
  console.log(Math.sqrt(sin(s_rot)**2))
  ssl_mod ++
  if(millis() > nextStep){ resetStar()} 
  else { random()*random()*random() }//faux random so the seed stays constant
  
  
  //first, start with background mountains.
  beginShape()
  noStroke()
  fill(mtn1)
  vertex(0,height*2/3)
  let mid_steps = random()*4+5
  let steps = width/2
  let midpoints = []
  let max_ht = 250
  let mt_base = 0
  //these are midpoints that we lerp towards.
  for (let i = 0; i <= mid_steps+1; i++){
    let ht = (random()*random()*random()*max_ht)
    //console.log(ht)
    let tmp = height*2/3 - ht - mt_base
    mt_base += 30/mid_steps
    midpoints.push(tmp)
    //vertex(width*i/steps,tmp)
  }
  //now for the actual mountain.
  let points = []
  let last = height*2/3
  for (let i = 0; i <= steps + 1; i++){
    
    let goal = midpoints[int(map(i,0,steps,0,mid_steps))]
    let spd = random()/30
    let temp = lerp(last,goal,spd)+ (noise(i)*2-1)
    vertex(width*i/steps,temp)
    last = temp
    points.push(temp)
    
  } 
 
  vertex(width,height)
  vertex(0,height)
  
  endShape(CLOSE)
  //now go back and add some shading
  for (let i = 0; i <= steps+1; i++){
    let last = points[i]
    let double_last = points[i-1]
    noFill()
    strokeWeight(3)
    if (last < double_last || last - double_last ==0){
      stroke(mtnH)
      
    } else {
      stroke(mtnS)
    }
    let steep = abs(last - double_last)*10 + 20
    line(width*i/steps,last, width*i/steps,last+steep)
    strokeWeight(1)
  }


  //now do the midground set of mountains.
  beginShape()
  noStroke()
  fill(mtn2)
  vertex(0,height)
  vertex(0,height*3/4)
  steps = 100
  let cos_scalar = random()*5+10
  let cos_w = (random()*60+80)
  let cos_off = 40
  for (let i = 0; i <= steps; i++){
    //at the end of each wave, change the width and amplitude of the wave.
    if (i % cos_w == 0){
      cos_w = (random()*60+80)
      cos_scalar = random()*5+10
    }
    let m_x = (width * i) / steps;
    let m_y = height*3/4 - cos(m_x/cos_w+cos_off)*cos_scalar
    //accentuate peaks
    m_y -= (m_y-height*3/4)*(m_y-height*3/4)/(cos_scalar/2)
    //add noise 
    m_y += + cos(noise(i)*cos(m_x/cos_w + cos_off))*cos_scalar
    vertex(m_x,m_y)
  }
  vertex(width,height)
  endShape(CLOSE)

  //and lastly, the foreground hill.
  //to-do: foreground


}


//linear gradient code taken from https://p5js.org/examples/color-linear-gradient.html
function setGradient(x, y, w, h, c1, c2, axis) {
  noFill();

  if (axis === Y_AXIS) {
    // Top to bottom gradient
    for (let i = y; i <= y + h; i++) {
      let inter = map(i, y, y + h, 0, 1);
      let c = lerpColor(c1, c2, inter);
      stroke(c);
      line(x, i, x + w, i);
    }
  } else if (axis === X_AXIS) {
    // Left to right gradient
    for (let i = x; i <= x + w; i++) {
      let inter = map(i, x, x + w, 0, 1);
      let c = lerpColor(c1, c2, inter);
      stroke(c);
      line(i, y, i, y + h);
    }
  } else if (axis === DIAG_AX) { //this is my own code, for diagonal gradient
    for (let i = y; i <= y + h; i++) {
      for (let j = x; j <= x + w; j++){
        //map remaps a value from a given range to another given range - 
        //we want the "lowest" to be bottom left, and highest to be top right
        /*
        tl: 0,0
        bl: 0,h
        tr: w,0
        br: w,h
        //to get the color we want, invert y
        */
        let dropper = j + (y+h-i) //nice fade here
        let inter = map( dropper, x+y,x+y+w+h, 0, 1)
        let c = lerpColor(c1,c2,inter)
        strokeWeight(1)
        stroke(c)
        point(j,i)//changed to point
      }
    }
  }
}

function makeStarGroup(x,y,w,h,n,nb){
  noStroke()
  
  for (let i = 0; i< n; i++){
    let s_x, s_y
    if (!nb){
      s_x = random()*w + x
      s_y = random()*h + y
    } else if(nb){ //if nebula style, generate from center outwards.
      s_x = x + random()*random()*w - random()*random()*random()*w
      s_y = y + random()*random()*h - random()*random()*h
      s_x -= random()*random()*s_y*1.3
    }
    stroke(255)
    //choose between circle & point
    if (random()*10 > 5){
      circle(s_x,s_y,(noise((millis()*s_x))/2 + 0.5 + noise(millis()*s_x)))
    } else {
      point(s_x,s_y)
    }
  }
}

function resetStar(){
  ssx_mod = 0
  ssy_mod = 0
  ss_yoff = abs(random()*(nextStep-millis()))%200-20
  ssl_mod = 0
  s_rot = (abs(random()*(nextStep-millis()))%10+5 ) * 3.14/180
  nextStep = millis() + random()*4000+1000
}