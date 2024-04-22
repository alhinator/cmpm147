// project.js - Alternate Worlds
// Author: Alex Leghart
// Date: 4/21/24


let canvasContainer;
var centerHorz, centerVert;


const w1 = (sketch) => {



  sketch.setup = () => {
    sketch.seed = 0;
    sketch.tilesetImage;
    sketch.currentGrid = [];
    sketch.numRows, sketch.numCols;

    sketch.numCols = sketch.select("#asciiBoxDungeon").attribute("rows") | 0;
    sketch.numRows = sketch.select("#asciiBoxDungeon").attribute("cols") | 0;
    // place our canvas, making it fit our container
    canvasContainer = $("#canvasContainer-2");
    sketch.canvas = sketch.createCanvas(16 * sketch.numCols, 16 * sketch.numRows);
    sketch.canvas.parent("canvasContainer-2");



    sketch.select("canvas").elt.getContext("2d").imageSmoothingEnabled = false;

    sketch.select("#reseedButtonDungeon").mousePressed(sketch.reseed);
    sketch.select("#asciiBoxDungeon").input(sketch.reparseGrid);

    sketch.reseed();
  }

  sketch.preload = () => {
    sketch.tilesetImage = sketch.loadImage(
      "https://cdn.glitch.com/25101045-29e2-407a-894c-e0243cd8c7c6%2FtilesetP8.png?v=1611654020438"
    );
  }

  sketch.reseed = () => {
    console.log(sketch.seed)
    sketch.seed = (sketch.seed | 0) + 420;
    sketch.randomSeed(sketch.seed);
    sketch.noiseSeed(sketch.seed);
    sketch.select("#seedReportDungeon").html("seed " + sketch.seed);
    sketch.regenerateGrid();
  }

  sketch.regenerateGrid = () => {
    console.log("making grid")
    sketch.select("#asciiBoxDungeon").value(sketch.gridToString(sketch.generateGrid(sketch.numCols, sketch.numRows)));
    sketch.reparseGrid();
  }
  sketch.reDisplay = () => {
    sketch.select("#asciiBoxDungeon").value(sketch.gridToString(sketch.currentGrid));
  }

  sketch.reparseGrid = () => {
    sketch.currentGrid = sketch.stringToGrid(sketch.select("#asciiBoxDungeon").value());
  }

  sketch.gridToString = (grid) => {
    let rows = [];
    for (let i = 0; i < grid.length; i++) {
      rows.push(grid[i].join(""));
    }
    return rows.join("\n");
  }

  sketch.stringToGrid = (str) => {
    let grid = [];
    let lines = str.split("\n");
    for (let i = 0; i < lines.length; i++) {
      let row = [];
      let chars = lines[i].split("");
      for (let j = 0; j < chars.length; j++) {
        row.push(chars[j]);
      }
      grid.push(row);
    }
    return grid;
  }


  sketch.draw = () => {
    //console.log(sketch.currentGrid)
    sketch.randomSeed(sketch.seed);
    sketch.drawGrid(sketch.currentGrid);
    sketch.mouseToTileSelect(sketch.currentGrid)
  }

  sketch.placeTile = (i, j, ti, tj) => {
    sketch.image(sketch.tilesetImage, 16 * j, 16 * i, 16, 16, 8 * ti, 8 * tj, 8, 8);
  }

  sketch.mousePressed = () => {
    console.log("hi")
    let mX = Math.floor(sketch.mouseX / sketch.width * sketch.currentGrid[0].length)
    let mY = Math.floor(sketch.mouseY / sketch.height * sketch.currentGrid.length)
    if (sketch.currentGrid[mY] != undefined && sketch.currentGrid[mY][mX]) { if (sketch.currentGrid[mY][mX] == ",") { sketch.currentGrid[mY][mX] = "." } else { sketch.currentGrid[mY][mX] = "," } }
    sketch.reDisplay()

  }


  //now we get into solution.js
  let numRooms

  sketch.generateGrid = (numCols, numRows) => {
    console.log("in gg! hi", numCols, numRows)
    //first, set basic bg tile.
    let grid = [];
    for (let i = 0; i < numRows; i++) {
      let row = [];
      for (let j = 0; j < numCols; j++) {
        row.push(".");
      }
      //console.log(row)
      grid.push(row);
    }
    //console.log(grid[0])
    // "." is unfilled background.

    //create basic room outline given numRooms
    numRooms = Math.floor(sketch.random(8)) + 3
    let rX = Math.floor(sketch.random() * (numRows - 2)) + 1 //ensures a border
    let rY = Math.floor(sketch.random() * (numCols - 2)) + 1 //ensures a border
    let rX2 = rX < numCols / 2 ? rX + (Math.floor(sketch.random() * numCols / 4) + 2) : rX - (Math.floor(sketch.random() * numCols / 4) + 2)
    let rY2 = rY < numRows / 2 ? rY + (Math.floor(sketch.random() * numRows / 4) + 2) : rY - (Math.floor(sketch.random() * numRows / 4) + 2)
    if (rX2 < rX) { [rX, rX2] = sketch.swap(rX, rX2) }
    if (rY2 < rY) { [rY, rY2] = sketch.swap(rY, rY2) } //this ensures we can just count up in our for loops
    //we do initial randomization outside because subsequent will ensure the next room shares a wall.
    for (let i = 0; i < numRooms; i++) {
      console.log("the corners of this room are:", rX, rY, rX2, rY2)
      for (let cCol = rX; cCol <= rX2; cCol++) {
        for (let cRow = rY; cRow <= rY2; cRow++) {
          grid[cRow][cCol] = ","
        }
      }
      //now re-randomize but keep a bordering wall.
      let b = Math.floor(sketch.random(4))
      switch (b) {
        case 0: //shared upper wall
          rX = Math.floor(sketch.random() * (rX2 - rX)) + rX //creates xpos along rect's L/R
          rY;
          rX2 = rX < numCols / 2 ? rX + (Math.floor(sketch.random() * numCols / 4) + 2) : rX - (Math.floor(sketch.random() * numCols / 4) + 2)
          rY2 = rY < numRows / 2 ? rY + (Math.floor(sketch.random() * numRows / 4) + 2) : rY - (Math.floor(sketch.random() * numRows / 4) + 2)
          break;
        case 1: //shared lower wall
          rX = Math.floor(sketch.random() * (rX2 - rX)) + rX //creates xpos along rect's L/R
          rY = rY2
          rX2 = rX < numCols / 2 ? rX + (Math.floor(sketch.random() * numCols / 4) + 2) : rX - (Math.floor(sketch.random() * numCols / 4) + 2)
          rY2 = rY < numRows / 2 ? rY + (Math.floor(sketch.random() * numRows / 4) + 2) : rY - (Math.floor(sketch.random() * numRows / 4) + 2)
          break;
        case 2: //shared right wall
          rX = rX2
          rY = Math.floor(sketch.random() * (rY2 - rY)) + rY //creates ypos along rect's up/dn
          rX2 = rX < numCols / 2 ? rX + (Math.floor(sketch.random() * numCols / 4) + 2) : rX - (Math.floor(sketch.random() * numCols / 4) + 2)
          rY2 = rY < numRows / 2 ? rY + (Math.floor(sketch.random() * numRows / 4) + 2) : rY - (Math.floor(sketch.random() * numRows / 4) + 2)
          break;
        case 3: //shared left wall
          rX;
          rY = Math.floor(sketch.random() * (rY2 - rY)) + rY //creates ypos along rect's up/dn
          rX2 = rX < numCols / 2 ? rX + (Math.floor(sketch.random() * numCols / 4) + 2) : rX - (Math.floor(sketch.random() * numCols / 4) + 2)
          rY2 = rY < numRows / 2 ? rY + (Math.floor(sketch.random() * numRows / 4) + 2) : rY - (Math.floor(sketch.random() * numRows / 4) + 2)
          break;
      }
      if (rX2 < rX) { [rX, rX2] = sketch.swap(rX, rX2) }
      if (rY2 < rY) { [rY, rY2] = sketch.swap(rY, rY2) } //this ensures we can just count up in our for loops
      rX = rX < 0 ? 0 : rX
      rX2 = rX2 >= numCols ? numCols - 1 : rX2
      rY = rY < 0 ? 0 : rY
      rY2 = rY2 >= numCols ? numCols - 1 : rY2
      //make sure they don't go out of bounds

    }

    console.log(grid)

    return grid;

  }

  sketch.drawGrid = (grid) => {
    sketch.background(128);

    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        //placeTile(i, j, /*Math.floor(random(4))*/0, 1); //we want dark grass "under" everything

        switch (grid[i][j]) {
          case '.': //background wall.
            if (sketch.noise(i / 10, j / 10) > 0.46) { //cracked bricks pattern
              sketch.placeTile(i, j, 11, 23)
            } else {
              sketch.placeTile(i, j, 11, 24)
            }
            break;
          case ',':
            sketch.placeTile(i, j, sketch.random(4) | 0 + 21, sketch.random(4) | 0 + 21)
            sketch.drawContext(grid, i, j, ".", 11, 22)

            //if empty area, 
            if (sketch.gridCode(grid, i, j, ".") == 0) {
              if (sketch.random() < 0.001) { //golden chest 1/1000
                sketch.placeTile(i, j, 5, 28 + sketch.random(2) | 0)
              } else if (sketch.random() < 0.003) { //reg chest
                sketch.placeTile(i, j, 0, 28 + sketch.random(2) | 0)
              }
            }
            break;
        }
      }
    }
  }


  sketch.gridCheck = (grid, i, j, target) => {
    if (i < 0 || i >= grid.length || j < 0 || j >= grid[i].length) { return 0 }

    return grid[i][j] == target ? 1 : 0
  }

  sketch.gridCode = (grid, i, j, target) => {
    let nb = sketch.gridCheck(grid, i - 1, j, target) << 0 //1
    let sb = sketch.gridCheck(grid, i + 1, j, target) << 1 //2
    let eb = sketch.gridCheck(grid, i, j + 1, target) << 2 //4
    let wb = sketch.gridCheck(grid, i, j - 1, target) << 3 //8
    let retVal = nb + sb + eb + wb
    //console.log(i, j, nb, sb, eb, wb, retVal)

    return retVal
  }

  sketch.drawContext = (grid, i, j, target, ti, tj) => {
    let gc = sketch.gridCode(grid, i, j, target)
    let [tiOffset, tjOffset] = sketch.lookup[gc];
    let rng = 0
    //if(tiOffset == 0 && tjOffset == 0) {rng = random(4) | 0}
    sketch.placeTile(i, j, ti + tiOffset + rng, tj + tjOffset);
    switch (gc) { //we do, in fact, need to handle special cases - some codes require multiple placing b/c of this tileset.
      case 3:
        [tiOffset, tjOffset] = sketch.lookup[2];
        sketch.placeTile(i, j, ti + tiOffset, tj + tjOffset);
        break;
      case 12:
        [tiOffset, tjOffset] = sketch.lookup[4];
        sketch.placeTile(i, j, ti + tiOffset, tj + tjOffset);
        break;
    }
  }

  sketch.lookup = [ //this is looking at a dark tile compared to light tiles.
    [5, 0], //0 none surr
    [5, -1],  //1 up
    [5, 1],  //2 down
    [5, -1],  //3 up and down //need to also place c2
    [6, 0],  //4 right
    [6, -1],  //5 up and right
    [6, 1],  //6 down and right
    [6, 1],  //7 up down and right 
    [4, 0],  //8 left
    [4, -1],  //9 up and left
    [4, 1],  //10 down and left
    [4, -1],  //11 up down and left  
    [4, 0],  //12 left and right  //also place c4
    [4, -1],  //13 up left and right
    [4, 1],  //14 down left and right
    [4, -1],  //15 surrounded
  ]



  sketch.swap = (a, b) => {
    return [b, a]
  }

  sketch.mouseToTileSelect = (grid) => { //basically, will hover a red square over the highlighted tile, and place a red circle when clicked to indicate an enemy placement.
    sketch.fill(0, 0, 255, 80)
    let mX = Math.floor(sketch.mouseX / sketch.width * grid[0].length)
    let mY = Math.floor(sketch.mouseY / sketch.height * grid.length)
    //console.log(mX, mY)
    if (mX >= 0 && mX < grid[0].length && mY >= 0 && mY < grid.length && grid[mY][mX] == ",") { sketch.fill(0, 255, 0, 80) }
    sketch.rect(Math.floor(sketch.mouseX / 16) * 16, Math.floor(sketch.mouseY / 16) * 16, 16, 16);

  }

}
let world1 = new p5(w1)




const w2 = (sketch) => {
  sketch.seed = 0;
  sketch.tilesetImage;
  sketch.currentGrid = [];
  sketch.numRows, sketch.numCols;

  sketch.preload = () => {
    sketch.tilesetImage = sketch.loadImage(
      "https://cdn.glitch.com/25101045-29e2-407a-894c-e0243cd8c7c6%2FtilesetP8.png?v=1611654020438"
    );
  }

  sketch.reseed = () => {
    console.log(sketch.seed)
    sketch.seed = (sketch.seed | 0) + 420;
    sketch.randomSeed(sketch.seed);
    sketch.noiseSeed(sketch.seed);
    sketch.select("#seedReportOverworld").html("seed " + sketch.seed);
    sketch.regenerateGrid();
  }

  sketch.regenerateGrid = () => {
    sketch.select("#asciiBoxOverworld").value(sketch.gridToString(sketch.generateGrid(sketch.numCols, sketch.numRows)));
    sketch.reparseGrid();
  }

  sketch.reparseGrid = () => {
    sketch.currentGrid = sketch.stringToGrid(sketch.select("#asciiBoxOverworld").value());
  }

  sketch.gridToString = (grid) => {
    let rows = [];
    for (let i = 0; i < grid.length; i++) {
      rows.push(grid[i].join(""));
    }
    return rows.join("\n");
  }

  sketch.stringToGrid = (str) => {
    let grid = [];
    let lines = str.split("\n");
    for (let i = 0; i < lines.length; i++) {
      let row = [];
      let chars = lines[i].split("");
      for (let j = 0; j < chars.length; j++) {
        row.push(chars[j]);
      }
      grid.push(row);
    }
    return grid;
  }

  sketch.setup = () => {
    sketch.numCols = sketch.select("#asciiBoxOverworld").attribute("rows") | 0;
    sketch.numRows = sketch.select("#asciiBoxOverworld").attribute("cols") | 0;

    sketch.createCanvas(16 * sketch.numCols, 16 * sketch.numRows).parent("canvasContainerOverworld");
    sketch.select("canvas").elt.getContext("2d").imageSmoothingEnabled = false;

    sketch.select("#reseedButtonOverworld").mousePressed(sketch.reseed);
    sketch.select("#asciiBoxOverworld").input(sketch.reparseGrid);

    sketch.reseed();
  }


  sketch.draw = () => {
    sketch.randomSeed(sketch.seed);
    sketch.drawGrid(sketch.currentGrid);
  }

  sketch.placeTile = (i, j, ti, tj) => {
    sketch.image(sketch.tilesetImage, 16 * j, 16 * i, 16, 16, 8 * ti, 8 * tj, 8, 8);
  }

  //now we're in solution.js
  sketch.cloudX = [], sketch.cloudY = [], sketch.cloudW = [], sketch.cloudH = [], sketch.cloudV = []
  sketch.numClouds

  sketch.generateGrid = (numCols, numRows) => {
    //first, pregenerate landscape features.
    let grid = [];
    for (let i = 0; i < numRows; i++) {
      let row = [];
      for (let j = 0; j < numCols; j++) {
        row.push(".");
      }
      grid.push(row);
    }
    //okay, it's basic. now fill it.

    //I want to have a hill that spans the left side.
    /*pseudo: 
      pick a starting point between one and six tiles away from left wall.
      pick a distance one to five, to go downwards until the wall depth increases or decreases by one.
      continue until hill has reached bottom of grid.
    */
    let xOff = Math.floor(sketch.random() * numRows / 4) + numRows / 10
    let vertLen = Math.floor(sketch.random() * numCols / 6) + numCols / 10
    let yOff = 0
    let dir
    while (yOff < numRows) {
      if (yOff < vertLen && xOff >= 0 && xOff < numRows) { //haven't reached l/r adjust yet && good positioning.
        //console.log("in I place")
        grid[yOff][xOff] = ","
      }
      if (yOff >= vertLen) { //have reached adjust
        dir = sketch.random() > 0.5 ? 1 : -1
        xOff += dir
        grid[yOff][xOff] = ","

        vertLen += Math.floor(sketch.random() * 4) + 2
      }
      for (let z = xOff; z >= 0; z--) {
        grid[yOff][z] = grid[yOff][z] == '.' ? "," : grid[yOff][z]
      }

      yOff++
    }

    //ok, now go over the grid again to create tree clumps.
    for (let i = 0; i < numRows; i++) {
      for (let j = 0; j < numCols; j++) {
        if (sketch.noise(i / 4, j / 4) > 0.5) {
          grid[i][j] = grid[i][j] == ',' ? "W" : "T"
        }
      }
    }

    //cloud pre-set
    sketch.numClouds = Math.floor(sketch.random(5)) + 3
    for (let i = 0; i < sketch.numClouds; i++) {
      sketch.cloudX[i] = sketch.random() * (sketch.width + sketch.width / 4) - sketch.width / 6
      sketch.cloudY[i] = sketch.random() * (sketch.height + sketch.height / 4) - sketch.height / 6
      sketch.cloudW[i] = sketch.random() * 110 + 60
      sketch.cloudH[i] = sketch.random() * 70 + 30
      sketch.cloudV[i] = [sketch.noise(sketch.millis() * i), sketch.noise(sketch.millis() * i)]
    }

    return grid;

  }

  sketch.drawGrid = (grid) => {
    sketch.background(128);

    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        sketch.placeTile(i, j, Math.floor(sketch.random(4)), sketch.noise(i / 10, j / 10, sketch.millis() / 100000) >= 0.5 ? 13 : 1); //we want dark or snowy grass "under" everything

        let tX, tY //used for snow noise
        switch (grid[i][j]) {
          case '.': //darker grass. check surrounding areas for lighter grass
            tY = sketch.noise(i / 10, j / 10, sketch.millis() / 100000) >= 0.5 ? 13 : 1
            sketch.drawContextDK(grid, i, j, ",", 0, tY, sketch.lookupDK)
            sketch.drawContextDK(grid, i, j, "W", 0, tY, sketch.ldk2)
            if (sketch.random() > 0.98) { //deco house
              sketch.placeTile(i, j, 26, sketch.random(4) | 0)
            }
            break;
          case ',':
            tY = sketch.noise(i / 10, j / 10, sketch.millis() / 100000) >= 0.5 ? 12 : 0
            sketch.placeTile(i, j, sketch.random(4) | 0, tY)
            break;
          case 'W': //light-grass tree.
            tY = sketch.noise(i / 10, j / 10, sketch.millis() / 100000) >= 0.5 ? 12 : 0
            tX = sketch.noise(i / 10, j / 10, sketch.millis() / 100000) >= 0.5 ? 12 : 6
            sketch.placeTile(i, j, sketch.random(4) | 0, tY)
            sketch.drawContextTree(grid, i, j, "W", 14, tX)
            break;
          case 'T': //dark-grass tree.
            sketch.drawContextDK(grid, i, j, ",", 0, 1, sketch.lookupDK)
            sketch.drawContextDK(grid, i, j, "W", 0, 1, sketch.ldk2)
            tX = sketch.noise(i / 10, j / 10, sketch.millis() / 100000) >= 0.5 ? 12 : 0
            sketch.drawContextTree(grid, i, j, "T", 14, tX)
            break;
        }

      }
    }

    //cloud
    sketch.noStroke()
    sketch.fill(0, 0, 0, 70)
    for (let i = 0; i < sketch.numClouds; i++) {
      sketch.rect(sketch.cloudX[i], sketch.cloudY[i], sketch.cloudW[i], sketch.cloudH[i])
      sketch.cloudX[i] += sketch.cloudV[i][0] / 5
      sketch.cloudY[i] += sketch.cloudV[i][1] / 6
      if (sketch.cloudX[i] > sketch.width || sketch.cloudY[i] > sketch.height) {
        sketch.cloudY[i] = sketch.noise(sketch.millis()) * (sketch.height + sketch.height / 4) - sketch.height / 2
        sketch.cloudW[i] = sketch.noise(sketch.millis()) * 110 + 60
        sketch.cloudH[i] = sketch.noise(sketch.millis()) * 70 + 30
        sketch.cloudX[i] = 0 - sketch.cloudW[i]
        sketch.cloudV[i] = [sketch.noise(sketch.millis() * i), sketch.noise(sketch.millis() * i)]
      }
    }

  }



  sketch.gridCheck = (grid, i, j, target) => {
    if (i < 0 || i >= grid.length || j < 0 || j >= grid[i].length) { return 0 }

    return grid[i][j] == target ? 1 : 0
  }

  sketch.gridCode = (grid, i, j, target) => {
    let nb = sketch.gridCheck(grid, i - 1, j, target) << 0 //1
    let sb = sketch.gridCheck(grid, i + 1, j, target) << 1 //2
    let eb = sketch.gridCheck(grid, i, j + 1, target) << 2 //4
    let wb = sketch.gridCheck(grid, i, j - 1, target) << 3 //8
    let retVal = nb + sb + eb + wb
    //console.log(i, j, nb, sb, eb, wb, retVal)

    return retVal
  }

  sketch.drawContextDK = (grid, i, j, target, ti, tj, lookup) => {
    let gc = sketch.gridCode(grid, i, j, target)
    let [tiOffset, tjOffset] = lookup[gc];
    let rng = 0
    if (tiOffset == 0 && tjOffset == 0) { rng = sketch.random(4) | 0 }
    //snow noise

    sketch.placeTile(i, j, ti + tiOffset + rng, tj + tjOffset);
    switch (gc) { //we do, in fact, need to handle special cases - some codes require multiple placing b/c of this tileset.
      case 3:
        [tiOffset, tjOffset] = lookup[2];
        placeTile(i, j, ti + tiOffset, tj + tjOffset);
        break;
      case 7:
        [tiOffset, tjOffset] = lookup[5];
        placeTile(i, j, ti + tiOffset, tj + tjOffset);
        break;
      case 11:
        [tiOffset, tjOffset] = lookup[10];
        placeTile(i, j, ti + tiOffset, tj + tjOffset);
        break;
      case 12:
        [tiOffset, tjOffset] = lookup[4];
        placeTile(i, j, ti + tiOffset, tj + tjOffset);
        break;
      case 13:
        [tiOffset, tjOffset] = lookup[5];
        placeTile(i, j, ti + tiOffset, tj + tjOffset);
        break;
      case 14:
        [tiOffset, tjOffset] = lookup[6];
        placeTile(i, j, ti + tiOffset, tj + tjOffset);
        break;
    }
  }

  sketch.drawContextTree = (grid, i, j, target, ti, tj) => {
    let gc = sketch.gridCode(grid, i, j, target)
    let [tiOffset, tjOffset] = sketch.lookupTr[gc];
    sketch.placeTile(i, j, ti + tiOffset, tj + tjOffset);

  }

  sketch.lookupDK = [ //this is looking at a dark tile compared to light tiles.
    [0, 0], //0 none surr
    [10, -1],  //1 up
    [10, 1],  //2 down
    [10, -1],  //3 up and down //need to also place c2
    [11, 0],  //4 right
    [11, -1],  //5 up and right
    [11, 1],  //6 down and right
    [11, 1],  //7 up down and right //need to also place c5
    [9, 0],  //8 left
    [9, -1],  //9 up and left
    [9, 1],  //10 down and left
    [9, -1],  //11 up down and left  //NEED TO ALSO PLACE c10
    [9, 0],  //12 left and right  //also place c4
    [9, -1],  //13 up left and right //also place c5
    [9, 1],  //14 down left and right //also place c6
    [0, -1],  //15 surrounded just make it lite
  ]
  sketch.ldk2 = [ //this is looking at a dark tile compared to light tiles. (upper)
    [5, 0], //0 none surr
    [10, -1],  //1 up
    [10, 1],  //2 down
    [10, -1],  //3 up and down //need to also place c2
    [11, 0],  //4 right
    [11, -1],  //5 up and right
    [11, 1],  //6 down and right
    [11, 1],  //7 up down and right //need to also place c5
    [9, 0],  //8 left
    [9, -1],  //9 up and left
    [9, 1],  //10 down and left
    [9, -1],  //11 up down and left  //NEED TO ALSO PLACE c10
    [9, 0],  //12 left and right  //also place c4
    [9, -1],  //13 up left and right //also place c5
    [9, 1],  //14 down left and right //also place c6
    [0, -1],  //15 surrounded just make it lite
  ]

  sketch.lookupTr = [ //this is looking at a tree tile compared to other tree tiles.
    [0, 0], //0 none surr
    [0, 0],  //1 up
    [0, 0],  //2 down
    [0, 0],  //3 up and down
    [0, 0],  //4 right
    [1, 2],  //5 up and right
    [1, 0],  //6 down and right
    [1, 1],  //7 up down and right
    [0, 0],  //8 left
    [3, 2],  //9 up and left
    [3, 0],  //10 down and left
    [3, 2],  //11 up down and left
    [0, 0],  //12 left and right  
    [2, 2],  //13 up left and right 
    [2, 0],  //14 down left and right //also place c6
    [2, 1],  //15 surrounded just make it lite
  ]
}
let world2 = new p5(w2)
