class Missile extends Vehicle {
  constructor(x, y, direction) {
    super(x, y, {
      maxSpeed: config.missiles.speed,
      maxForce: 0.8,
      r: 5,
      initialVelocity: direction.copy().setMag(config.missiles.speed)
    });
    this.behaviorManager = new BehaviorManager(this);
    this.createdAt = millis();
    this.dead = false;
  }

  update() {
    if (this.dead) return;
    this.maxSpeed = config.missiles.speed;
    this.integrate();
    if (millis() - this.createdAt > config.missiles.maxLifeMs) {
      this.dead = true;
    }
    if (this.pos.x < -20 || this.pos.x > width + 20 || this.pos.y < -20 || this.pos.y > height + 20) {
      this.dead = true;
    }
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());
    noStroke();
    fill(255, 240, 120);
    ellipse(0, 0, this.r * 3.2, this.r * 1.4);
    fill(255, 150, 40, 200);
    triangle(-this.r * 1.8, -this.r * 0.4, -this.r * 1.8, this.r * 0.4, -this.r * 3, 0);
    pop();
  }
}