class Enemy extends Vehicle {
  constructor(x, y, opts = {}) {
    const tier = opts.tier || 1;
    const isBoss = !!opts.isBoss;
    super(x, y, {
      maxSpeed: config.enemy.maxSpeed,
      maxForce: config.enemy.maxForce,
      r: isBoss ? 34 : (tier >= 3 ? 25 : (tier >= 2 ? 22 : 20)),
      initialVelocity: p5.Vector.random2D()
    });
    this.behaviorManager = new BehaviorManager(this);
    this.tier = tier;
    this.isBoss = isBoss;

    this.state = "WANDER";
    this.maxHealth = isBoss ? 380 : (tier >= 3 ? 180 : (tier >= 2 ? 135 : 100));
    this.health = this.maxHealth;
    this.flashUntil = 0;
    this.lastForces = {
      seek: createVector(0, 0),
      avoid: createVector(0, 0),
      wander: createVector(0, 0),
      total: createVector(0, 0)
    };

    this.behaviorManager.addBehavior("seek", (owner, ctx) => {
      if (!ctx.detected) return createVector(0, 0);
      if (ctx.distPlayer < config.enemy.arriveRadius) {
        return owner.arrive(ctx.player.pos, config.enemy.arriveRadius);
      }
      return owner.seek(ctx.player.pos);
    });
    this.behaviorManager.addBehavior("wander", (owner, ctx) => (ctx.detected ? createVector(0, 0) : owner.wander()));
    this.behaviorManager.addBehavior("avoid", (owner, ctx) => owner.avoidObstacles(ctx.obstacles, 82));
    this.behaviorManager.addBehavior("separation", (owner, ctx) => owner.separation(ctx.enemies));
    this.behaviorManager.addBehavior("bounds", (owner) => owner.stayInBounds(width, height, 42), { weight: 1.3 });
  }

  takeDamage(amount) {
    this.health -= amount;
    this.flashUntil = millis() + 120;
    return this.health <= 0;
  }

  separation(others) {
    let steer = createVector(0, 0);
    let count = 0;
    for (const other of others) {
      if (other === this) continue;
      const d = this.pos.dist(other.pos);
      if (d > 0 && d < this.r * 2) {
        const diff = p5.Vector.sub(this.pos, other.pos).normalize().div(d);
        steer.add(diff);
        count += 1;
      }
    }

    if (count > 0) {
      steer.div(count).setMag(this.maxSpeed).sub(this.vel).limit(this.maxForce);
      return steer;
    }
    return createVector(0, 0);
  }

  update(player, obstacles, enemies) {
    const speedMul = this.isBoss ? 1.22 : (this.tier >= 3 ? 1.12 : (this.tier >= 2 ? 1.06 : 1));
    const forceMul = this.isBoss ? 1.28 : (this.tier >= 3 ? 1.14 : (this.tier >= 2 ? 1.08 : 1));
    this.maxSpeed = config.enemy.maxSpeed * speedMul;
    this.maxForce = config.enemy.maxForce * forceMul;

    const detected = this.detect(player, config.enemy.detectionRadius);
    const distPlayer = this.pos.dist(player.pos);

    const seek = this.behaviorManager.behaviors.get("seek").fn(this, { detected, distPlayer, player });
    const wander = this.behaviorManager.behaviors.get("wander").fn(this, { detected });
    const avoid = this.behaviorManager.behaviors.get("avoid").fn(this, { obstacles });
    const separation = this.behaviorManager.behaviors.get("separation").fn(this, { enemies });
    const bounds = this.behaviorManager.behaviors.get("bounds").fn(this, {});

    this.state = !detected ? "WANDER" : (distPlayer < config.enemy.arriveRadius ? "ARRIVE" : "SEEK");

    const seekWeight = config.weights.seek * (this.isBoss ? 1.45 : (this.tier >= 2 ? 1.2 : 1));
    const wanderWeight = config.weights.wander * (this.isBoss ? 0.55 : (this.tier >= 2 ? 0.75 : 1));
    const avoidWeight = config.weights.avoid * (this.isBoss ? 1.35 : (this.tier >= 2 ? 1.12 : 1));
    const separationWeight = config.weights.separation * (this.isBoss ? 1.35 : (this.tier >= 2 ? 1.15 : 1));

    seek.mult(seekWeight);
    wander.mult(wanderWeight);
    avoid.mult(avoidWeight);
    separation.mult(separationWeight);

    this.applyForce(seek);
    this.applyForce(wander);
    this.applyForce(avoid);
    this.applyForce(separation);
    this.applyForce(bounds.mult(1.3));

    this.lastForces.seek = seek.copy();
    this.lastForces.wander = wander.copy();
    this.lastForces.avoid = avoid.copy();
    this.lastForces.total = p5.Vector.add(p5.Vector.add(seek, wander), p5.Vector.add(avoid, separation));

    this.integrate();
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());

    if (this.tier <= 1 && !this.isBoss) {
      noStroke();
      fill(62, 76, 98);
      triangle(-this.r * 1.15, -this.r * 0.7, -this.r * 1.15, this.r * 0.7, this.r * 1.25, 0);

      fill(92, 118, 148);
      triangle(-this.r * 0.88, -this.r * 0.45, -this.r * 0.88, this.r * 0.45, this.r * 0.68, 0);

      fill(45, 58, 78);
      triangle(-this.r * 1.38, -this.r * 0.95, -this.r * 0.65, -this.r * 0.32, -this.r * 1.25, -this.r * 0.18);
      triangle(-this.r * 1.38, this.r * 0.95, -this.r * 0.65, this.r * 0.32, -this.r * 1.25, this.r * 0.18);

      fill(245, 92, 92);
      ellipse(this.r * 0.45, 0, this.r * 0.48, this.r * 0.32);

      fill(255, 170, 60);
      triangle(-this.r * 1.2, -this.r * 0.2, -this.r * 1.2, this.r * 0.2, -this.r * 1.65, 0);
    } else if (this.isBoss) {
      noStroke();
      fill(72, 20, 28);
      triangle(-this.r * 1.2, -this.r * 0.78, -this.r * 1.2, this.r * 0.78, this.r * 1.28, 0);

      fill(126, 34, 42);
      triangle(-this.r * 0.9, -this.r * 0.56, -this.r * 0.9, this.r * 0.56, this.r * 0.76, 0);

      fill(42, 8, 14);
      triangle(-this.r * 1.55, -this.r * 1.02, -this.r * 0.78, -this.r * 0.25, -this.r * 1.4, -this.r * 0.12);
      triangle(-this.r * 1.55, this.r * 1.02, -this.r * 0.78, this.r * 0.25, -this.r * 1.4, this.r * 0.12);

      fill(255, 95, 95);
      ellipse(this.r * 0.5, 0, this.r * 0.56, this.r * 0.34);

      fill(255, 180, 70);
      triangle(-this.r * 1.22, -this.r * 0.24, -this.r * 1.22, this.r * 0.24, -this.r * 1.85, 0);
      fill(255, 120, 70, 160);
      triangle(-this.r * 1.07, -this.r * 0.95, -this.r * 0.42, -this.r * 0.25, -this.r * 1.1, -this.r * 0.25);
      triangle(-this.r * 1.07, this.r * 0.95, -this.r * 0.42, this.r * 0.25, -this.r * 1.1, this.r * 0.25);
    } else {
      noStroke();
      fill(71, 62, 55);
      triangle(-this.r * 1.16, -this.r * 0.74, -this.r * 1.16, this.r * 0.74, this.r * 1.25, 0);

      fill(120, 95, 74);
      triangle(-this.r * 0.9, -this.r * 0.5, -this.r * 0.9, this.r * 0.5, this.r * 0.71, 0);

      fill(44, 33, 28);
      triangle(-this.r * 1.46, -this.r * 0.96, -this.r * 0.68, -this.r * 0.22, -this.r * 1.28, -this.r * 0.12);
      triangle(-this.r * 1.46, this.r * 0.96, -this.r * 0.68, this.r * 0.22, -this.r * 1.28, this.r * 0.12);

      fill(250, 120, 88);
      ellipse(this.r * 0.45, 0, this.r * 0.5, this.r * 0.32);

      fill(255, 175, 82);
      triangle(-this.r * 1.18, -this.r * 0.2, -this.r * 1.18, this.r * 0.2, -this.r * 1.72, 0);

      fill(255, 90, 68, 130);
      triangle(-this.r * 1.0, -this.r * 0.84, -this.r * 0.52, -this.r * 0.2, -this.r * 1.03, -this.r * 0.2);
      triangle(-this.r * 1.0, this.r * 0.84, -this.r * 0.52, this.r * 0.2, -this.r * 1.03, this.r * 0.2);
    }

    if (millis() < this.flashUntil) {
      fill(255, 60, 60, 180);
      ellipse(0, 0, this.r * 3, this.r * 1.7);
    }

    // Barre de vie
    const w = this.r * 2;
    const h = 4;
    const ratio = constrain(this.health / this.maxHealth, 0, 1);
    noStroke();
    fill(20, 20, 20, 180);
    rect(-w * 0.5, -this.r - 10, w, h, 2);
    fill(this.isBoss ? 245 : 80, this.isBoss ? 125 : 230, this.isBoss ? 95 : 120);
    rect(-w * 0.5, -this.r - 10, w * ratio, h, 2);

    if (this.isBoss) {
      push();
      rotate(-this.vel.heading());
      textAlign(CENTER, CENTER);
      textSize(11);
      fill(255, 198, 108);
      text("BOSS", 0, -this.r - 20);
      pop();
    }

    pop();
  }
}
