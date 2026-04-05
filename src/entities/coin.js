class Coin extends Vehicle {
  constructor(x, y) {
    super(x, y, { maxSpeed: 0, maxForce: 0, r: config.coins.radius });
    this.behaviorManager = new BehaviorManager(this);
    this.vel.mult(0);
    this.acc.mult(0);
    this.pulse = random(TWO_PI);
  }

  update() {
    this.pulse += 0.06;
  }

  show() {
    push();
    noStroke();
    fill(255, 208, 64);
    circle(this.pos.x, this.pos.y, this.r * 2 + sin(this.pulse) * 3);
    fill(255, 244, 150, 180);
    circle(this.pos.x - 2, this.pos.y - 2, this.r * 0.9);
    pop();
  }
}