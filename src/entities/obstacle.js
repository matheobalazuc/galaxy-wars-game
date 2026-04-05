class Obstacle extends Vehicle {
  constructor(x, y, r, options = {}) {
    super(x, y, { maxSpeed: 0, maxForce: 0, r });
    this.vel.mult(0);
    this.acc.mult(0);
    this.rotation = random(TWO_PI);
    this.rotationSpeed = random(-0.006, 0.006);
    this.points = this.makeAsteroidPoints();

    this.maxHealth = config.obstacles.maxHealth;
    this.health = this.maxHealth;
    this.isSpecial = false;
    this.setSpecial(Boolean(options.isSpecial));
  }

  makeAsteroidPoints() {
    const points = [];
    const count = floor(random(8, 12));
    for (let i = 0; i < count; i += 1) {
      const angle = (TWO_PI * i) / count;
      const spike = random(0.72, 1.14);
      points.push({
        x: cos(angle) * this.r * spike,
        y: sin(angle) * this.r * spike
      });
    }
    return points;
  }

  setSpecial(active) {
    this.isSpecial = active;
    if (this.isSpecial) {
      const speed = random(config.obstacles.specialSpeedMin, config.obstacles.specialSpeedMax);
      this.vel = p5.Vector.random2D().setMag(speed);
      this.health = this.maxHealth;
    } else {
      this.vel.mult(0);
      this.health = this.maxHealth;
    }
  }

  update() {
    if (!this.isSpecial) return;

    this.pos.add(this.vel);
    this.rotation += this.rotationSpeed;

    if (this.pos.x < this.r || this.pos.x > width - this.r) {
      this.vel.x *= -1;
      this.pos.x = constrain(this.pos.x, this.r, width - this.r);
    }
    if (this.pos.y < this.r + 60 || this.pos.y > height - this.r) {
      this.vel.y *= -1;
      this.pos.y = constrain(this.pos.y, this.r + 60, height - this.r);
    }
  }

  takeDamage(amount) {
    this.health = max(0, this.health - max(0, amount));
    return this.health <= 0;
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.rotation);

    stroke(12, 30, 45, 220);
    strokeWeight(2);
    fill(this.isSpecial ? color(206, 133, 72, 235) : color(72, 128, 158, 220));
    beginShape();
    for (const p of this.points) {
      vertex(p.x, p.y);
    }
    endShape(CLOSE);

    noStroke();
    fill(this.isSpecial ? color(255, 220, 120, 80) : color(160, 214, 240, 55));
    circle(-this.r * 0.15, -this.r * 0.2, this.r * 0.86);

    if (this.isSpecial) {
      const ratio = constrain(this.health / this.maxHealth, 0, 1);
      const w = this.r * 1.65;
      const h = 5;
      const x = -w * 0.5;
      const y = -this.r - 12;

      fill(16, 22, 30, 220);
      rect(x, y, w, h, 3);
      fill(255, 98, 98);
      rect(x, y, w * ratio, h, 3);
    }

    pop();
  }
}
