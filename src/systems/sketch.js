function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("Trebuchet MS");
  frameRate(60);
  
  game = new GalaxyWarsGame();
  noLoop();
}

function draw() {
  game.update();
  game.draw();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  if (game) {
    game.handleMousePressed();
  }
}
