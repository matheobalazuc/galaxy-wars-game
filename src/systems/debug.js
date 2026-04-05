class DebugRenderer {
  drawEnemyDebug(enemy) {
    push();
    noFill();
    stroke(120, 200, 255, 120);
    drawingContext.setLineDash([5, 7]);
    circle(enemy.pos.x, enemy.pos.y, config.enemy.detectionRadius * 2);

    drawingContext.setLineDash([]);
    stroke(255, 230, 120, 110);
    circle(enemy.pos.x, enemy.pos.y, config.enemy.arriveRadius * 2);

    this.drawVector(enemy.pos, enemy.vel.copy().mult(12), color(255, 80, 80));
    this.drawVector(enemy.pos, enemy.lastForces.total.copy().mult(140), color(110, 255, 120));

    noStroke();
    fill(255);
    textSize(11);
    textAlign(CENTER, BOTTOM);
    text(enemy.state, enemy.pos.x, enemy.pos.y - enemy.r - 8);
    pop();
  }

  drawVector(origin, vec, col) {
    push();
    stroke(col);
    strokeWeight(2);
    line(origin.x, origin.y, origin.x + vec.x, origin.y + vec.y);
    pop();
  }

  draw(obstacles, enemies) {
    for (const obstacle of obstacles) {
      push();
      noFill();
      stroke(130, 230, 255, 45);
      circle(obstacle.pos.x, obstacle.pos.y, obstacle.r * 2 + 30);
      pop();
    }

    for (const enemy of enemies) {
      this.drawEnemyDebug(enemy);
    }
  }
}
