class Player extends Vehicle {
  constructor(x, y) {
    super(x, y, {
      maxSpeed: config.player.maxSpeed,
      maxForce: config.player.maxForce,
      r: 18,
      initialVelocity: createVector(1, 0)
    });
    this.behaviorManager = new BehaviorManager(this);
    this.lastAim = createVector(1, 0);
    this.nitro = config.player.nitroMax;
    this.armorHealth = 0;

    this.behaviorManager.addBehavior("avoid", (owner, ctx) => owner.avoidObstacles(ctx.obstacles, 60), { weight: 0.7 });
    this.behaviorManager.addBehavior("bounds", (owner, ctx) => owner.stayInBounds(ctx.widthRef, ctx.heightRef, 36), { weight: 1.6 });
  }

  applyControls(keys, mouseTarget) {
    if (mouseTarget) {
      const toMouse = p5.Vector.sub(mouseTarget, this.pos);
      const dist = toMouse.mag();
      const mouseForce = (dist > 170 ? this.seek(mouseTarget) : this.arrive(mouseTarget, 120)).mult(1.35);
      this.applyForce(mouseForce);
      const aim = p5.Vector.sub(mouseTarget, this.pos);
      if (aim.magSq() > 0.01) {
        this.lastAim = aim.normalize();
      }
    }

    const axis = createVector(0, 0);
    if (keys.has("ArrowUp")) axis.y -= 1;
    if (keys.has("ArrowDown")) axis.y += 1;
    if (keys.has("ArrowLeft")) axis.x -= 1;
    if (keys.has("ArrowRight")) axis.x += 1;

    if (axis.magSq() > 0) {
      axis.normalize().mult(this.maxSpeed);
      const steering = p5.Vector.sub(axis, this.vel);
      steering.limit(this.maxForce * 1.8);
      this.applyForce(steering);
    }

    if (this.vel.magSq() > 0.05) {
      this.lastAim = this.vel.copy().normalize();
    }
  }

  update(keys, obstacles, mouseTarget) {
    this.maxSpeed = config.player.maxSpeed;
    this.maxForce = config.player.maxForce;

    const nitroPressed = keys.has(" ");
    if (nitroPressed && this.nitro > 0) {
      this.maxSpeed *= config.player.nitroSpeedMultiplier;
      this.nitro = max(0, this.nitro - (config.player.nitroDrainPerSec * deltaTime) / 1000);
    } else {
      this.nitro = min(config.player.nitroMax, this.nitro + (config.player.nitroRegenPerSec * deltaTime) / 1000);
    }

    this.applyControls(keys, mouseTarget);
    this.behaviorManager.setWeight("avoid", config.weights.avoid * 0.7);
    const shared = this.behaviorManager.run({ obstacles, widthRef: width, heightRef: height });

    this.applyForce(shared);
    this.integrate();
  }

  addArmor() {
    this.armorHealth = config.player.armorMaxHealth;
  }

  absorbHit() {
    if (this.armorHealth > 0) {
      this.armorHealth = max(0, this.armorHealth - config.player.armorHitDamage);
      return true;
    }
    return false;
  }

  show(invulnerable, shockReady = false) {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());

    const alpha = invulnerable ? 120 + sin(frameCount * 0.35) * 120 : 255;
    const shockPulse = shockReady ? 150 + sin(frameCount * 0.55) * 105 : 0;
    noStroke();

    if (shockReady) {
      fill(255, 236, 120, shockPulse);
      circle(0, 0, this.r * 3.8);
      fill(255, 214, 68, shockPulse * 0.85);
      triangle(-this.r * 0.4, -this.r * 1.45, this.r * 0.02, -this.r * 2.0, this.r * 0.42, -this.r * 1.45);
      triangle(-this.r * 0.95, -this.r * 0.1, -this.r * 1.55, 0, -this.r * 0.95, this.r * 0.1);
      triangle(this.r * 0.95, -this.r * 0.1, this.r * 1.55, 0, this.r * 0.95, this.r * 0.1);
    }

    fill(220, 236, 247, alpha);
    triangle(-this.r, -this.r * 0.7, -this.r, this.r * 0.7, this.r * 1.1, 0);

    fill(87, 213, 255, alpha);
    triangle(-this.r * 0.9, -this.r * 0.4, -this.r * 0.9, this.r * 0.4, this.r * 0.2, 0);

    fill(255, 150, 43, alpha);
    triangle(-this.r * 1.2, -this.r * 0.28, -this.r * 1.2, this.r * 0.28, -this.r * 1.7, 0);

    if (this.armorHealth > 0) {
      noFill();
      stroke(90, 220, 255, 180);
      strokeWeight(2);
      circle(0, 0, this.r * 3.2);
    }

    pop();
  }
}
