class EnemyProjectile extends Vehicle {
  constructor(x, y, direction, opts = {}) {
    super(x, y, {
      maxSpeed: opts.speed || config.enemy.shotSpeed,
      maxForce: 0.8,
      r: opts.isBoss ? 7 : 5,
      initialVelocity: direction.copy().setMag(opts.speed || config.enemy.shotSpeed)
    });

    this.createdAt = millis();
    this.lifeMs = opts.lifeMs || config.enemy.shotLifeMs;
    this.damage = opts.damage || config.enemy.shotDamage;
    this.dead = false;
    this.isBoss = !!opts.isBoss;
  }

  update() {
    if (this.dead) return;
    this.integrate();

    if (millis() - this.createdAt > this.lifeMs) {
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
    if (this.isBoss) {
      fill(255, 95, 85);
      ellipse(0, 0, this.r * 3.3, this.r * 1.7);
      fill(255, 170, 90, 210);
      triangle(-this.r * 1.9, -this.r * 0.5, -this.r * 1.9, this.r * 0.5, -this.r * 3.1, 0);
    } else {
      fill(255, 120, 95);
      ellipse(0, 0, this.r * 3.1, this.r * 1.5);
      fill(255, 185, 105, 210);
      triangle(-this.r * 1.8, -this.r * 0.45, -this.r * 1.8, this.r * 0.45, -this.r * 2.8, 0);
    }

    pop();
  }
}
