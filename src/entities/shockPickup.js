class ShockPickup extends Vehicle {
  constructor(x, y) {
    super(x, y, { maxSpeed: 0, maxForce: 0, r: config.shock.radius });
    this.behaviorManager = new BehaviorManager(this);
    this.vel.mult(0);
    this.acc.mult(0);
    this.pulse = random(TWO_PI);
  }

  update() {
    this.pulse += 0.08;
  }

  show() {
    const glow = this.r * 2.3 + sin(this.pulse) * 3;
    push();
    translate(this.pos.x, this.pos.y);

    noStroke();
    fill(255, 220, 70, 120);
    circle(0, 0, glow * 1.7);

    fill(255, 238, 130);
    beginShape();
    vertex(-this.r * 0.2, -this.r * 1.2);
    vertex(this.r * 0.05, -this.r * 0.28);
    vertex(-this.r * 0.65, -this.r * 0.28);
    vertex(this.r * 0.2, this.r * 1.2);
    vertex(-this.r * 0.02, this.r * 0.2);
    vertex(this.r * 0.62, this.r * 0.2);
    endShape(CLOSE);

    pop();
  }
}
