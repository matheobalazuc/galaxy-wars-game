class MedkitPickup extends Vehicle {
  constructor(x, y) {
    super(x, y, {
      maxSpeed: 0,
      maxForce: 0,
      r: config.medkit.radius
    });
    this.vel.mult(0);
    this.acc.mult(0);
    this.phase = random(TWO_PI);
  }

  update() {
    this.phase += 0.05;
  }

  show() {
    const pulse = 1 + 0.08 * sin(this.phase);

    push();
    translate(this.pos.x, this.pos.y);
    scale(pulse);
    noStroke();

    fill(255, 70, 70, 220);
    circle(0, 0, this.r * 2.2);

    fill(255);
    rectMode(CENTER);
    rect(0, 0, this.r * 1.2, this.r * 0.44, 2);
    rect(0, 0, this.r * 0.44, this.r * 1.2, 2);

    pop();
  }
}
