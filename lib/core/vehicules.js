class Vehicle {
  constructor(x, y, opts = {}) {
    this.pos = createVector(x, y);
    this.vel = opts.initialVelocity ? opts.initialVelocity.copy() : createVector(random(-1, 1), random(-1, 1));
    if (this.vel.magSq() < 0.01) {
      this.vel = createVector(1, 0);
    }
    this.acc = createVector(0, 0);
    this.maxSpeed = opts.maxSpeed ?? 3;
    this.maxForce = opts.maxForce ?? 0.2;
    this.r = opts.r ?? 14;

    this.distanceCercle = opts.distanceCercle ?? 70;
    this.wanderRadius = opts.wanderRadius ?? 28;
    this.wanderTheta = random(TWO_PI);
    this.displaceRange = opts.displaceRange ?? 0.22;
  }

  applyForce(force) {
    this.acc.add(force);
  }

  integrate() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  seek(target) {
    const desired = p5.Vector.sub(target, this.pos).setMag(this.maxSpeed);
    const steering = p5.Vector.sub(desired, this.vel);
    return steering.limit(this.maxForce);
  }

  flee(target) {
    return this.seek(target).mult(-1);
  }

  arrive(target, slowRadius = 100) {
    const toTarget = p5.Vector.sub(target, this.pos);
    const dist = toTarget.mag();
    const desiredSpeed = dist < slowRadius ? map(dist, 0, slowRadius, 0, this.maxSpeed) : this.maxSpeed;
    toTarget.setMag(desiredSpeed);
    const steering = p5.Vector.sub(toTarget, this.vel);
    return steering.limit(this.maxForce);
  }

  pursue(agent, predictionFrames = 16) {
    const future = p5.Vector.add(agent.pos, p5.Vector.mult(agent.vel, predictionFrames));
    return this.seek(future);
  }

  evade(agent, predictionFrames = 16) {
    return this.pursue(agent, predictionFrames).mult(-1);
  }

  wander() {
    const heading = this.vel.copy();
    heading.setMag(this.distanceCercle);
    const center = p5.Vector.add(this.pos, heading);

    const theta = this.wanderTheta + this.vel.heading();
    const displacement = createVector(
      cos(theta) * this.wanderRadius,
      sin(theta) * this.wanderRadius
    );

    this.wanderTheta += random(-this.displaceRange, this.displaceRange);

    const target = p5.Vector.add(center, displacement);
    const steering = p5.Vector.sub(target, this.pos);
    return steering.setMag(this.maxForce);
  }

  detect(agentOrPos, radius) {
    const targetPos = agentOrPos.pos ? agentOrPos.pos : agentOrPos;
    return this.pos.dist(targetPos) <= radius;
  }

  avoidObstacles(obstacles, lookAhead = 70, aheadScale = 0.5) {
    if (!obstacles || obstacles.length === 0 || this.vel.magSq() < 0.001) {
      return createVector(0, 0);
    }

    const ahead = this.vel.copy().setMag(lookAhead);
    const aheadPoint = p5.Vector.add(this.pos, ahead);
    const ahead2Point = p5.Vector.add(this.pos, ahead.copy().mult(aheadScale));

    let nearest = null;
    let bestDistance = Infinity;
    for (const obstacle of obstacles) {
      const d = this.pos.dist(obstacle.pos);
      if (d < bestDistance) {
        bestDistance = d;
        nearest = obstacle;
      }
    }

    if (!nearest) {
      return createVector(0, 0);
    }

    const dAhead = nearest.pos.dist(aheadPoint);
    const dAhead2 = nearest.pos.dist(ahead2Point);
    const dNow = nearest.pos.dist(this.pos);

    let closestPoint = aheadPoint;
    let minDist = dAhead;
    if (dAhead2 < minDist) {
      minDist = dAhead2;
      closestPoint = ahead2Point;
    }
    if (dNow < minDist) {
      minDist = dNow;
      closestPoint = this.pos;
    }

    const collisionDist = nearest.r + this.r * 0.6;
    if (minDist < collisionDist) {
      const steer = p5.Vector.sub(closestPoint, nearest.pos);
      return steer.setMag(this.maxForce);
    }

    return createVector(0, 0);
  }

  stayInBounds(widthRef, heightRef, margin = 40) {
    let desired = null;

    if (this.pos.x < margin) {
      desired = createVector(this.maxSpeed, this.vel.y);
    } else if (this.pos.x > widthRef - margin) {
      desired = createVector(-this.maxSpeed, this.vel.y);
    }

    if (this.pos.y < margin) {
      desired = createVector(this.vel.x, this.maxSpeed);
    } else if (this.pos.y > heightRef - margin) {
      desired = createVector(this.vel.x, -this.maxSpeed);
    }

    if (!desired) {
      return createVector(0, 0);
    }

    desired.setMag(this.maxSpeed);
    const steer = p5.Vector.sub(desired, this.vel);
    return steer.limit(this.maxForce);
  }
}
