"use strict";

/* global p5 */
/* exported preload, setup, draw, mouseClicked */

// Project base code provided by {amsmith,ikarth}@ucsc.edu

let tile_width_step_main; // A width step is half a tile's width
let tile_height_step_main; // A height step is half a tile's height

// Global variables. These will mostly be overwritten in setup().
let tile_rows, tile_columns;
let camera_offset;
let camera_velocity;

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

    if (window.p3_setup) {
        window.p3_setup();
    }

    let label = createP();
    label.html("World key: ");
    label.parent("splash-container");

    let input = createInput("cool town bro");
    input.parent(label);
    input.input(() => {
        rebuildWorld(input.value());
    });

    createP("Arrow keys scroll. Clicking cycles tiles.").parent("splash-container");

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

function draw() {
    // Keyboard controls!
    if (keyIsDown(LEFT_ARROW)) {
        camera_velocity.x -= 1;
    }
    if (keyIsDown(RIGHT_ARROW)) {
        camera_velocity.x += 1;
    }
    if (keyIsDown(DOWN_ARROW)) {
        camera_velocity.y -= 1;
    }
    if (keyIsDown(UP_ARROW)) {
        camera_velocity.y += 1;
    }

    let camera_delta = new p5.Vector(0, 0);
    camera_velocity.add(camera_delta);
    camera_offset.add(camera_velocity);
    camera_velocity.mult(0.95); // cheap easing
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
                camera_offset.y
            ]); // odd row
        }
        for (let x = x0; x < x1; x++) {
            drawTile(
                tileRenderingOrder([
                    x + 0.5 + world_offset.x,
                    y + 0.5 - world_offset.y
                ]),
                [camera_offset.x, camera_offset.y]
            ); // even rows are offset horizontally
        }
    }

    describeMouseTile(world_pos, [camera_offset.x, camera_offset.y]);

    if (window.p3_drawAfter) {
        window.p3_drawAfter();
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
        window.p3_drawTile(world_x, world_y, -screen_x, screen_y);
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

function p3_preload() { }

function p3_setup() { }

let worldSeed;

let base_color = {};
let road_type,
    road_spacing_x, road_spacing_y,
    road_offset = {};

function p3_worldKeyChanged(key) {
    worldSeed = XXH.h32(key, 0);
    noiseSeed(worldSeed);
    randomSeed(worldSeed);
    genCityParams(worldSeed);
}

function genCityParams(_worldSeed) {
    base_color.r = (_worldSeed << 13) % 255;
    base_color.g = (_worldSeed >> 7) % 255;
    base_color.b = (_worldSeed << 5) % 255;

    road_type = 0; //0 = blacktop  1 = dirt //got rid of random bc dirt was ugly

    road_spacing_x = Math.abs(Math.floor(((worldSeed << 3) % 5))) + 4; //between 3 and 8 spaces in the middle
    road_spacing_y = Math.abs(Math.floor(((worldSeed >> 3) % 5))) + 4; //between 3 and 8 spaces in the middle
    //console.log(road_spacing_x, road_spacing_y)
    road_offset.x = (worldSeed << 7) % 13; //exists so there isn't always an intersection at 0,0
    road_offset.y = (worldSeed >> 3) % 13; //exists so there isn't always an intersection at 0,0
}

function p3_tileWidth() {
    return 32;
}
function p3_tileHeight() {
    return 16;
}

let [tw, th] = [p3_tileWidth(), p3_tileHeight()];

let clicks = {};

function p3_tileClicked(i, j) {
    let key = [i, j];
    clicks[key] = 1 + (clicks[key] | 0);
    if (clicks[key] > 2) {
        delete clicks[key];
    }
}

function p3_drawBefore() { }

function p3_drawTile(i, j) {
    noStroke();
    fill(
        (base_color.r / 2 + noise(i / 10, j / 10) * 60) % 255,
        255 - noise(i / 10, j / 10) * 60,
        base_color.b + noise(i / 10, j / 10) * 20
    );
    //push();

    beginShape();
    vertex(-tw, 0);
    vertex(0, th);
    vertex(tw, 0);
    vertex(0, -th);
    endShape(CLOSE);
    if (i % road_spacing_x == 0 || j % road_spacing_y == 0 || clicks[[i, j]] == 1) {
        //code for drawing road here
        if (road_type == 0) {
            fill(120);
            //push();
            beginShape();
            vertex(-tw, 0);
            vertex(0, th);
            vertex(tw, 0);
            vertex(0, -th);
            endShape(CLOSE);
            drawRoadContext(i, j);
        } else {
            fill(180, 120, 40);
            //push();
            beginShape();
            vertex(-tw, 0);
            vertex(0, th);
            vertex(tw, 0);
            vertex(0, -th);
            endShape(CLOSE);
        }
    } else if (
        (clicks[[i, j]] && clicks[[i, j]] == 2) ||
        noise(i / 4, j / 4) > 0.55
    ) {
        let r = (base_color.r + abs(i + j) + noise(i) * 200 - 100) % 255;
        let g = (base_color.g + abs(i + j) + noise(j) * 200 - 100) % 255;
        let b = (base_color.b + abs(i + j) + noise(i, j) * 200 - 100) % 255;

        let m = noise(i, j) * 100;
        fill(r, g, b);
        beginShape();
        vertex(-tw + tw / 16, -th - m);
        vertex(0, 0 - m + th / 16);
        vertex(tw - tw / 16, -th - m);
        vertex(0, -th * 2 - m + th / 16);
        endShape(CLOSE);
        //leftside
        fill(r - 10, g - 10, b - 10);
        beginShape();
        vertex(-tw + tw / 16, -th - m);
        vertex(-tw + tw / 16, th / 16);
        vertex(0, (th * 15) / 16);
        vertex(0, -m + th / 16);
        endShape(CLOSE);
        //rightside
        fill(r - 20, g - 20, b - 20);
        beginShape();
        vertex(0, (th * 15) / 16);
        vertex(0, -m + th / 16);
        vertex((tw * 15) / 16, -th - m);
        vertex((tw * 15) / 16, 0);
        endShape(CLOSE);
    }

    //now do buildings

    //pop();
}

function p3_drawSelectedTile(i, j) {
    noFill();
    stroke(0, 255, 0, 128);

    beginShape();
    vertex(-tw, 0);
    vertex(0, th);
    vertex(tw, 0);
    vertex(0, -th);
    endShape(CLOSE);

    noStroke();
    fill(0);
    text("tile " + [i, j], 0, 0);
}

function p3_drawAfter() { }

function drawRoadContext(i, j) {
    //four cases we need to check for:
    //for each neighboring road, we draw a dash originating in the center & going to the
    // edge that that road is touching.

    let abv =
        i % road_spacing_x == 0 ||
        (j + 1) % road_spacing_y == 0 ||
        clicks[[i, j + 1]] == 1;
    let below =
        i % road_spacing_x == 0 ||
        (j - 1) % road_spacing_y == 0 ||
        clicks[[i, j - 1]] == 1;
    let left =
        (i - 1) % road_spacing_x == 0 ||
        j % road_spacing_y == 0 ||
        clicks[[i - 1, j]] == 1;
    let right =
        (i + 1) % road_spacing_x == 0 ||
        j % road_spacing_y == 0 ||
        clicks[[i + 1, j]] == 1;

    if (abv && below && left && right) {
        return;
    }

    if (abv) {
        fill(255, 255, 0);
        beginShape();
        vertex((tw * 7) / 16, (th * 5) / 16);
        vertex((tw * 9) / 16, (th * 7) / 16);

        vertex((tw * 7) / 16, (th * 9) / 16);
        vertex((tw * 5) / 16, (th * 7) / 16);
        endShape(CLOSE);
        noFill();
    }
    if (below) {
        fill(255, 255, 0);
        beginShape();
        vertex((-tw * 7) / 16, (-th * 5) / 16);
        vertex((-tw * 9) / 16, (-th * 7) / 16);

        vertex((-tw * 7) / 16, (-th * 9) / 16);
        vertex((-tw * 5) / 16, (-th * 7) / 16);
        endShape(CLOSE);
        noFill();
    }
    if (left) {
        fill(255, 255, 0);
        beginShape();
        vertex((tw * 7) / 16, (-th * 5) / 16);
        vertex((tw * 9) / 16, (-th * 7) / 16);

        vertex((tw * 7) / 16, (-th * 9) / 16);
        vertex((tw * 5) / 16, (-th * 7) / 16);
        endShape(CLOSE);
        noFill();
    }
    if (right) {
        fill(255, 255, 0);
        beginShape();
        vertex((-tw * 7) / 16, (th * 5) / 16);
        vertex((-tw * 9) / 16, (th * 7) / 16);

        vertex((-tw * 7) / 16, (th * 9) / 16);
        vertex((-tw * 5) / 16, (th * 7) / 16);
        endShape(CLOSE);
        noFill();
    }
}
