class Explosion extends Vehicle {
  constructor(x, y) {
    super(x, y, {
      maxSpeed: 0,
      maxForce: 0,
      r: 8,
      initialVelocity: createVector(0, 0)
    });
    this.ageMs = 0;
    this.lifeMs = 280;
    this.dead = false;
  }

  update() {
    this.ageMs += deltaTime;
    if (this.ageMs >= this.lifeMs) {
      this.dead = true;
    }
  }

  show() {
    if (this.dead) return;
    const t = constrain(this.ageMs / this.lifeMs, 0, 1);
    const radius = lerp(8, 46, t);
    const alpha = lerp(230, 0, t);

    push();
    noFill();
    stroke(255, 90, 40, alpha);
    strokeWeight(3);
    circle(this.pos.x, this.pos.y, radius);
    stroke(255, 190, 70, alpha * 0.9);
    circle(this.pos.x, this.pos.y, radius * 0.62);
    pop();
  }
}
