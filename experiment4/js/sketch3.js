"use strict";

/* global p5 */
/* exported preload, setup, draw, mouseClicked, increaseSnakeLen, gameOver, getScore, cloudSpeed */

// Project base code provided by {amsmith,ikarth}@ucsc.edu

let tile_width_step_main; // A width step is half a tile's width
let tile_height_step_main; // A height step is half a tile's height

// Global variables. These will mostly be overwritten in setup().
let tile_rows, tile_columns;
let camera_offset;
let camera_velocity;
let camera_target;

let snake_direction, snake_direction_temp; //0 = UP,  1 = DOWN,  2 = RIGHT, 3 = LEFT
let snake_head_pos;
let snake_body;
let snake_len;

let next, step, base_step, ready, cloud_speed;

let score;

window.addEventListener("keydown", function(e) {
    if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
}, false);


/////////////////////////////
// Transforms between coordinate systems
// These are actually slightly weirder than in full 3d...
/////////////////////////////
function worldToScreen([world_x, world_y], [camera_x, camera_y]) {
  let i = (world_x - world_y) * tile_width_step_main;
  let j = (world_x + world_y) * tile_height_step_main;
  return [i + camera_x, j + camera_y];
}

function worldToCamera([world_x, world_y], [camera_x, camera_y]) {
  let i = (world_x - world_y) * tile_width_step_main;
  let j = (world_x + world_y) * tile_height_step_main;
  return [i, j];
}

function tileRenderingOrder(offset) {
  return [offset[1] - offset[0], offset[0] + offset[1]];
}

function screenToWorld([screen_x, screen_y], [camera_x, camera_y]) {
  screen_x -= camera_x;
  screen_y -= camera_y;
  screen_x /= tile_width_step_main * 2;
  screen_y /= tile_height_step_main * 2;
  screen_y += 0.5;
  return [Math.floor(screen_y + screen_x), Math.floor(screen_y - screen_x)];
}

function cameraToWorldOffset([camera_x, camera_y]) {
  let world_x = camera_x / (tile_width_step_main * 2);
  let world_y = camera_y / (tile_height_step_main * 2);
  return { x: Math.round(world_x), y: Math.round(world_y) };
}

function worldOffsetToCamera([world_x, world_y]) {
  let camera_x = world_x * (tile_width_step_main * 2);
  let camera_y = world_y * (tile_height_step_main * 2);
  return new p5.Vector(camera_x, camera_y);
}

function preload() {
  if (window.p3_preload) {
    window.p3_preload();
  }
}

function setup() {
  let canvas = createCanvas(800, 400);
  canvas.parent("canvas-container");

  camera_offset = new p5.Vector(-width / 2, height / 2);
  camera_velocity = new p5.Vector(0, 0);
  camera_target = new p5.Vector(-width / 2, height / 2);

  snake_head_pos = new p5.Vector(0, 0);
  snake_body = []; //will be an array of position arrays.
  snake_direction = -1;
  snake_direction_temp = -1;
  next = 1500;
  base_step = 1000;
  step = base_step;
  ready = false;
  snake_len = 3;
  score = 0;
  cloud_speed = false;

  if (window.p3_setup) {
    window.p3_setup();
  }

  let label = createP();
  label.html("World key: ");
  label.parent("splash-container");
  let input = createInput("woag");
  input.parent(label);
  input.id("daLabel");

  input.input(() => {
    rebuildWorld(input.value());
  });

  createP(
    "Arrow keys change snake direction. Eating orbs increases snake speed and length! Flying through clouds makes you fast but decreases your length."
  ).parent("splash-container");

  rebuildWorld(input.value());
}

function rebuildWorld(key) {
  if (window.p3_worldKeyChanged) {
    window.p3_worldKeyChanged(key);
  }
  tile_width_step_main = window.p3_tileWidth ? window.p3_tileWidth() : 32;
  tile_height_step_main = window.p3_tileHeight ? window.p3_tileHeight() : 14.5;
  tile_columns = Math.ceil(width / (tile_width_step_main * 2));
  tile_rows = Math.ceil(height / (tile_height_step_main * 2));
}

function mouseClicked() {
  let world_pos = screenToWorld(
    [0 - mouseX, mouseY],
    [camera_offset.x, camera_offset.y]
  );

  if (window.p3_tileClicked) {
    window.p3_tileClicked(world_pos[0], world_pos[1]);
  }
  //return false;
}

function resetCamera() {
  camera_velocity.x = 0;
  camera_velocity.y = 0;
  camera_offset.x = 0;
  camera_offset.y = 0;
}

function cameraToSnakeHead() {
  let tmp = worldToCamera([snake_head_pos.x, snake_head_pos.y], []);
  camera_target.x = -tmp[0] - tile_width_step_main * 10;
  camera_target.y = -tmp[1] + tile_height_step_main * 12;
  //console.log(camera_target.x, camera_offset.x, camera_target.y, camera_offset.y)
}

function increaseSnakeLen() {
  snake_len++;
}

function moveSnake() {
  // Keyboard controls! prevent snake from going backwards directly.
  if (keyIsDown(70)) {
    //key f
    resetCamera();
  }
  if (keyIsDown(LEFT_ARROW) && snake_direction != 2) {
    //camera_velocity.x -= 1;
    snake_direction_temp = 3;
    ready = true;
  }
  if (keyIsDown(RIGHT_ARROW) && snake_direction != 3) {
    //camera_velocity.x += 1;
    snake_direction_temp = 2;
    ready = true;
  }
  if (keyIsDown(DOWN_ARROW) && snake_direction != 0) {
    //camera_velocity.y -= 1;
    snake_direction_temp = 1;
    ready = true;
  }
  if (keyIsDown(UP_ARROW) && snake_direction != 1) {
    //camera_velocity.y += 1;
    snake_direction_temp = 0;
    ready = true;
  }

  if (ready && millis() > next) {
    snake_direction = snake_direction_temp;
    //first, add the current square to the "body" of the snake
    let itm = [snake_head_pos.x, snake_head_pos.y];
    snake_body.push(itm);
    //and if the length of the body is longer than the ideal length, get rid of the "tail" of the snake (which is actually body[0])
    if (snake_body.length > snake_len) {
      snake_body.splice(0, 1);
    }
    //console.log(snake_body);

    //adjust the head
    snake_head_pos.x +=
      snake_direction == 3 ? 1 : snake_direction == 2 ? -1 : 0;
    snake_head_pos.y +=
      snake_direction == 0 ? -1 : snake_direction == 1 ? 1 : 0;

    step = cloud_speed ? 150 : base_step - snake_body.length * 20;
    //console.log(cloud_speed);

    next += step;
    score += snake_len / 2;
    if (snake_len <= 0) {
      gameOver();
    }
  } else if (!ready) {
    next = millis() + step;
  }
}

function cloudSpeed(_cs) {
  if (_cs && !cloud_speed) {
    next = millis();
    snake_len--;
    if (snake_body.length > snake_len) {
      snake_body.splice(0, 1);
    }
  }
  cloud_speed = _cs;
}

function getScore() {
  return floor(score);
}

function gameOver() {
  resetCamera();
  snake_head_pos = new p5.Vector(0, 0);
  snake_body = []; //will be an array of position arrays.
  snake_direction = -1;
  snake_direction_temp = -1;
  next = millis() + 1500;
  base_step = 1000;
  step = base_step;
  ready = false;
  snake_len = 3;
  score = 0;
  //console.log(document.getElementById("daLabel").value);
  rebuildWorld(document.getElementById("daLabel").value);
  cloud_speed = false;
}

function draw() {
  moveSnake();

  //set camera target
  cameraToSnakeHead();

  let camera_delta = new p5.Vector(
    camera_target.x - camera_offset.x,
    camera_target.y - camera_offset.y
  );

  //console.log(camera_delta)
  camera_velocity = camera_delta;
  camera_velocity.mult(0.1); // cheap easing
  camera_offset.add(camera_velocity);
  if (camera_velocity.mag() < 0.01) {
    camera_velocity.setMag(0);
  }

  let world_pos = screenToWorld(
    [0 - mouseX, mouseY],
    [camera_offset.x, camera_offset.y]
  );
  let world_offset = cameraToWorldOffset([camera_offset.x, camera_offset.y]);

  background(100);

  if (window.p3_drawBefore) {
    window.p3_drawBefore();
  }

  let overdraw = 0.1;

  let y0 = Math.floor((0 - overdraw) * tile_rows);
  let y1 = Math.floor((1 + overdraw) * tile_rows);
  let x0 = Math.floor((0 - overdraw) * tile_columns);
  let x1 = Math.floor((1 + overdraw) * tile_columns);

  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      drawTile(tileRenderingOrder([x + world_offset.x, y - world_offset.y]), [
        camera_offset.x,
        camera_offset.y,
      ]); // odd row
    }
    for (let x = x0; x < x1; x++) {
      drawTile(
        tileRenderingOrder([
          x + 0.5 + world_offset.x,
          y + 0.5 - world_offset.y,
        ]),
        [camera_offset.x, camera_offset.y]
      ); // even rows are offset horizontally
    }
  }

  describeMouseTile(world_pos, [camera_offset.x, camera_offset.y]);

  if (window.p3_drawAfter) {
    window.p3_drawAfter(snake_direction);
  }
  if (!ready) {
    fill(0);
    text("press an arrow key to start!\n", width / 2, height / 2);
  }
}

// Display a discription of the tile at world_x, world_y.
function describeMouseTile([world_x, world_y], [camera_x, camera_y]) {
  let [screen_x, screen_y] = worldToScreen(
    [world_x, world_y],
    [camera_x, camera_y]
  );
  drawTileDescription([world_x, world_y], [0 - screen_x, screen_y]);
}

function drawTileDescription([world_x, world_y], [screen_x, screen_y]) {
  push();
  translate(screen_x, screen_y);
  if (window.p3_drawSelectedTile) {
    window.p3_drawSelectedTile(world_x, world_y, screen_x, screen_y);
  }
  pop();
}

// Draw a tile, mostly by calling the user's drawing code.
function drawTile([world_x, world_y], [camera_x, camera_y]) {
  let [screen_x, screen_y] = worldToScreen(
    [world_x, world_y],
    [camera_x, camera_y]
  );
  push();
  translate(0 - screen_x, screen_y);
  if (window.p3_drawTile) {
    window.p3_drawTile(
      world_x,
      world_y,
      -screen_x,
      screen_y,
      [snake_head_pos.x, snake_head_pos.y],
      snake_body
    );
  }
  pop();
}


"use strict";

/* global XXH */
/* exported --
    p3_preload
    p3_setup
    p3_worldKeyChanged
    p3_tileWidth
    p3_tileHeight
    p3_tileClicked
    p3_drawBefore
    p3_drawTile
    p3_drawSelectedTile
    p3_drawAfter
*/

function p3_preload() {
  
}

function p3_setup() {}

let worldSeed;

function p3_worldKeyChanged(key) {
  worldSeed = XXH.h32(key, 0);
  noiseSeed(worldSeed);
  randomSeed(worldSeed);
}

function p3_tileWidth() {
  return 32;
}
function p3_tileHeight() {
  return 16;
}

let [tw, th] = [p3_tileWidth(), p3_tileHeight()];

let clicks = {};
let collected = {}

function p3_tileClicked(i, j) { //don't need you for this version
  //let key = [i, j]; 
  //clicks[key] = 1 + (clicks[key] | 0);
}
function p3_collectPowerup(i,j){
  let key = [i, j]
  if(collected[key] == "pluh"){ return false} //dont want to collect multiple times.
  collected[key] = "pluh"
  window.increaseSnakeLen()
  return true;
}

function p3_drawBefore() {
  fill(167,235,255)
  rect(0,0,width,height)
  noFill()
}

function p3_drawTile(i, j, w_i, w_j, [snake_head_posx,snake_head_posy], snake_body) {
  noStroke();

  //draw base tiles in alternating colors.
//    if((abs(i % 2) == 0 && abs(j % 2) == 1) || (abs(i % 2) == 1 && abs(j % 2) == 0)){
//     fill(159,201,84)
//   } else {
//     fill(180,214,97)
//   }
//   push();

//   beginShape();
//   vertex(-tw, 0);
//   vertex(0, th);
//   vertex(tw, 0);
//   vertex(0, -th);
//   endShape(CLOSE);
  
  //next - CHECK IF SNAKE body.
  snake_body.forEach((seg) => {
    //if the snake head is colliding with this segment, gameOver
    if (snake_head_posx == seg[0] && snake_head_posy == seg[1]) {
      //console.log("collided with self")
      window.gameOver()
    }
    if(seg[0] == i && seg[1] == j){
      fill(126,191,244)
      beginShape()
      vertex(-tw, -th);
      vertex(0, 0);
      vertex(tw, -th);
      vertex(0, -th*2);
      endShape(CLOSE);
      //leftside
      fill(116,181,234)
      beginShape()
      vertex(-tw,-th)
      vertex(-tw,0)
      vertex(0,th)
      vertex(0,0)
      endShape(CLOSE);
      //rightside
      fill(106,171,224)
      beginShape()
      vertex(0,th)
      vertex(0,0)
      vertex(tw, -th)
      vertex(tw, 0)
      endShape(CLOSE);
    }});

  //now check for snake head
  if(i == snake_head_posx && j == snake_head_posy){
    //code for making snake head here 
    //cant use actual 3d graphics because no webGL. so: faux cube using 3 squares.
    //topside first
    fill(56,81,104)
    beginShape()
    vertex(-tw, -th*1.5);
    vertex(0, -th*0.5);
    vertex(tw, -th*1.5);
    vertex(0, -th*2.5);
    endShape(CLOSE);
    //leftside
    fill(46,71,94)
    beginShape()
    vertex(-tw,-th*1.5)
    vertex(-tw,0)
    vertex(0,th)
    vertex(0,-th*0.5)
    endShape(CLOSE);
    //rightside
    fill(36,61,84)
    beginShape()
    vertex(0,th)
    vertex(0,-th*0.5)
    vertex(tw, -th*1.5)
    vertex(tw, 0)
    endShape(CLOSE);
  } 
  
   
  
 

  let n = clicks[[i, j]] | 0;
  let m = noise(i, j)
  //truth table:
  //(!A&B) & C & !D
  let A = n > 0 //clicking only clears, it does not place back.
  let B = m > 0.65 //noise is higher than og - want rarer since we can't clear
  let C = !(abs(i) < 3 && abs(j) < 3) //its not within the starting area.
  let D = m > 0.8
  
  if ( (!A&&B)   && C && !D) {
    Math.floor(m)
    m*= 4
    m = m ** m
    let h = abs(  (millis()/60+noise(i,j,millis()/5000)*20) % 20 -10)
    
    fill(226+m/4, 234+m/4, 236+m/4, 100);
    beginShape()
    vertex(-tw, -th-m+h);
    vertex(0, 0-m+h);
    vertex(tw, -th-m+h);
    vertex(0, -th*2-m+h);
    endShape(CLOSE);
    //leftside
    fill(216+m/4, 224+m/4, 226+m/4, 100);
    beginShape()
    vertex(-tw,-th-m+h)
    vertex(-tw,0+h)
    vertex(0,th+h)
    vertex(0,-m+h)
    endShape(CLOSE);
    //rightside
    fill(206+m/4, 214+m/4, 216+m/4, 80);
    beginShape()
    vertex(0,th+h)
    vertex(0,-m+h)
    vertex(tw, -th-m+h)
    vertex(tw, 0+h)
    endShape(CLOSE);
    
    if (snake_head_posx == i && snake_head_posy == j) {
      //console.log("collided with wall")
      //window.gameOver()
      window.cloudSpeed(true)
    } else {
      window.cloudSpeed(false)
    }
    
    
  } else if (D && collected[[i,j]] != "pluh"){ //want to draw a power-up if we haven't collected.
    //check for collision?
    //we already know there is an uncollected power-up at this spot.
    if (snake_head_posx == i && snake_head_posy == j) {
      //console.log("on top of powerup")
      p3_collectPowerup(i, j)
    }
    fill(40,40,40);
    ellipse(0, 0, 10, 5);
    translate(0, -10);
    fill(9, 78, 103, 140);
    ellipse(0, 0-abs(millis()/100%10 -5), 10, 10);
    
  }
  
  

  //pop();
}

function p3_drawSelectedTile(i, j) {
//   noFill();
//   stroke(0, 255, 0, 128);

//   beginShape();
//   vertex(-tw, 0);
//   vertex(0, th);
//   vertex(tw, 0);
//   vertex(0, -th);
//   endShape(CLOSE);

//   noStroke();
//   fill(0);
//   text("tile " + [i, j], 0, 0);
}

function p3_drawAfter(snake_direction) {
  //text(snake_direction + " ", 0, 0)
  fill(0)
  text("Score:" + window.getScore(), width / 2, 10)
}
