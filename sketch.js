let img;

const IMAGE_FILE       = "tree.png";
const CELL_SIZE        = 3;
const WHITE_THRESHOLD  = 245;
const DRAW_STROKE      = false;

let mode = 0;
const FAST_CELLS_PER_FRAME = 20;

const START_DATE = new Date(2005, 0, 23, 10, 0, 0);
const END_DATE   = new Date(2090, 0, 23, 10, 0, 0);

let totalDurationSeconds;

let allCells     = [];
let currentIndex = 0;
let fastFinished = false;

function preload() {
  img = loadImage(IMAGE_FILE);
}

function setup() {
  createCanvas(900, 900);
  background(255);
  smooth();

  img.resize(width, height);
  prepareCells();

  totalDurationSeconds =
    (END_DATE.getTime() - START_DATE.getTime()) / 1000;
}

function draw() {
  background(255);

  if (mode === 0) {
    drawEightyFiveYearMode();
  } else {
    drawFastMode();
  }

  drawInfoPanel();
}

function drawFastMode() {
  if (!fastFinished) {
    for (let i = 0; i < FAST_CELLS_PER_FRAME; i++) {
      if (currentIndex < allCells.length) {
        currentIndex++;
      } else {
        currentIndex = allCells.length;
        fastFinished = true;
        break;
      }
    }
  }

  for (let i = 0; i < currentIndex; i++) {
    allCells[i].display();
  }
}

function drawEightyFiveYearMode() {
  const visibleCount = getVisibleCountByRealTime();
  for (let i = 0; i < visibleCount; i++) {
    allCells[i].display();
  }
}

function getVisibleCountByRealTime() {
  const startEpoch = START_DATE.getTime() / 1000;
  const endEpoch   = END_DATE.getTime()   / 1000;
  const nowEpoch   = Date.now()           / 1000;

  if (nowEpoch <= startEpoch) return 0;
  if (nowEpoch >= endEpoch)   return allCells.length;

  const elapsed  = nowEpoch - startEpoch;
  const progress = elapsed / totalDurationSeconds;

  return constrain(floor(progress * allCells.length), 0, allCells.length);
}

function prepareCells() {
  img.loadPixels();
  allCells = [];

  for (let y = height - CELL_SIZE; y >= 0; y -= CELL_SIZE) {
    for (let x = 0; x < width; x += CELL_SIZE) {
      const c = getAverageColor(x, y, CELL_SIZE, CELL_SIZE);
      const b = brightness(c);

      if (b < WHITE_THRESHOLD) {
        allCells.push(new Cell(x, y, c));
      }
    }
  }
}

function getAverageColor(startX, startY, w, h) {
  let r = 0, g = 0, b = 0, count = 0;

  for (let y = startY; y < startY + h && y < img.height; y++) {
    for (let x = startX; x < startX + w && x < img.width; x++) {
      const idx = 4 * (y * img.width + x);
      r += img.pixels[idx];
      g += img.pixels[idx + 1];
      b += img.pixels[idx + 2];
      count++;
    }
  }

  if (count === 0) return color(255);
  return color(r / count, g / count, b / count);
}

function drawInfoPanel() {
  fill(80, 160);
  noStroke();
  rect(10, 10, 590, 110, 6);

  fill(255);
  noStroke();
  textSize(15);
  textFont('monospace');

  text("Image: " + IMAGE_FILE,            20, 30);
  text("Total cells: " + allCells.length,  20, 50);

  if (mode === 0) {
    const visibleCount = getVisibleCountByRealTime();
    const startEpoch   = START_DATE.getTime() / 1000;
    const elapsed      = max(0, Date.now() / 1000 - startEpoch);
    const progressPct  = constrain(elapsed / totalDurationSeconds, 0, 1) * 100;

    text("Mode: 85-YEAR REAL TIME",                           20, 72);
    text("Progress: " + nf(progressPct, 0, 8) + "%",        20, 112);
    text("Cells: " + visibleCount + " / " + allCells.length, 20, 92);
    text("[1] fast demo   [2] 85-year mode",                 300, 92);

  } else {
    const progressPct = map(currentIndex, 0, allCells.length, 0, 100);

    text("Mode: FAST DEMO",                                        20, 72);
    text("Cells: " + currentIndex + " / " + allCells.length,      20, 92);
    text("Progress: " + nf(progressPct, 0, 3) + "%",             300, 72);
    text("[1] replay   [2] 85-year mode",                         300, 92);
  }
}

class Cell {
  constructor(x, y, c) {
    this.x = x;
    this.y = y;
    this.c = c;
  }

  display() {
    if (DRAW_STROKE) {
      stroke(220);
      strokeWeight(0.35);
    } else {
      noStroke();
    }
    fill(this.c);
    rect(this.x, this.y, CELL_SIZE, CELL_SIZE);
  }
}

function keyPressed() {
  if (key === '1') {
    if (mode !== 1) {
      mode = 1;
    } else {
      if (fastFinished) {
        currentIndex = 0;
        fastFinished = false;
      }
    }
  }

  if (key === '2') {
    mode = 0;
  }
}