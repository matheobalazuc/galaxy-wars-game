const GameState = {
  MENU: "MENU",
  INTRO: "INTRO",
  PLAYING: "PLAYING",
  PAUSED: "PAUSED",
  LEVELCLEAR: "LEVELCLEAR",
  VICTORY: "VICTORY",
  GAMEOVER: "GAMEOVER"
};

class GalaxyWarsGame {
  constructor() {
    this.state = GameState.MENU;
    this.ui = new UIManager();

    this.hud = new Hud();
    this.debugRenderer = new DebugRenderer();

    this.keys = new Set();

    this.player = null;
    this.enemies = [];
    this.obstacles = [];
    this.coins = [];
    this.medkits = [];
    this.shockPickups = [];
    this.missiles = [];
    this.enemyProjectiles = [];
    this.explosions = [];

    this.score = 0;
    this.startMs = 0;
    this.lastHitMs = -9999;
    this.lastCoinSpawnMs = 0;
    this.lastShockSpawnMs = 0;
    this.lastShotMs = -9999;
    this.machinegunCharge = config.missiles.machinegun.maxCharge;
    this.lives = config.player.lives;
    this.coinsCollected = 0;
    this.kills = 0;
    this.levelKills = 0;
    this.enemyHits = 0;
    this.maxEnemiesOnScreen = 0;
    this.shockReady = false;
    this.shockContactGrace = false;
    this.hudHelpKey = null;

    this.currentLevelIndex = 0;
    this.levelGoalKills = config.levels[0].goalKills;
    this.currentLevelLabel = config.levels[0].label;
    this.currentTheme = this.getLevelTheme(0);
    this.progressStorageKey = "galaxywars.levelProgress.v1";
    this.levelProgress = this.loadLevelProgress();

    this.ui.bind(this);
    this.applyLevelTheme(0);
    this.bindKeys();
    this.ui.showMenu(this.getMenuLevelData());
  }

  getLevelTheme(levelIndex) {
    const level = config.levels[constrain(levelIndex, 0, config.levels.length - 1)] || {};
    const palette = level.palette || { base: [2, 16, 34], blob: [12, 45, 72] };

    const accent = palette.blob.map((c) => constrain(c + 96, 0, 255));
    const accentStrong = palette.blob.map((c) => constrain(c + 56, 0, 255));
    const hudBg = palette.base.map((c) => constrain(c + 8, 0, 255));
    const text = palette.base[0] + palette.base[1] + palette.base[2] < 130 ? [238, 246, 255] : [255, 245, 236];

    return {
      palette,
      accent,
      accentStrong,
      hudBg,
      text
    };
  }

  applyLevelTheme(levelIndex) {
    this.currentTheme = this.getLevelTheme(levelIndex);
    const root = document.documentElement;
    const { palette, accent, accentStrong } = this.currentTheme;

    root.style.setProperty("--bg-a", `rgb(${palette.base[0]}, ${palette.base[1]}, ${palette.base[2]})`);
    root.style.setProperty("--bg-b", `rgb(${palette.blob[0]}, ${palette.blob[1]}, ${palette.blob[2]})`);
    root.style.setProperty("--accent", `rgb(${accent[0]}, ${accent[1]}, ${accent[2]})`);
    root.style.setProperty("--btn-a", `rgb(${accent[0]}, ${accent[1]}, ${accent[2]})`);
    root.style.setProperty("--btn-b", `rgb(${accentStrong[0]}, ${accentStrong[1]}, ${accentStrong[2]})`);
  }

  makeDefaultLevelProgress() {
    return {
      unlockedLevels: 1,
      bestScores: config.levels.map(() => 0)
    };
  }

  loadLevelProgress() {
    const fallback = this.makeDefaultLevelProgress();
    try {
      const raw = localStorage.getItem(this.progressStorageKey);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);

      const unlockedLevels = constrain(
        Math.floor(parsed.unlockedLevels ?? 1),
        1,
        config.levels.length
      );

      const bestScores = config.levels.map((_, i) => {
        const value = parsed.bestScores && parsed.bestScores[i] != null ? parsed.bestScores[i] : 0;
        return Math.max(0, Number(value) || 0);
      });

      return { unlockedLevels, bestScores };
    } catch (_err) {
      return fallback;
    }
  }

  saveLevelProgress() {
    try {
      localStorage.setItem(this.progressStorageKey, JSON.stringify(this.levelProgress));
    } catch (_err) {
    }
  }

  isLevelUnlocked(levelIndex) {
    return levelIndex < this.levelProgress.unlockedLevels;
  }

  getMenuLevelData() {
    return config.levels.map((level, index) => ({
      index,
      label: level.label,
      theme: level.theme || "Zone",
      difficulty: level.difficulty || "Standard",
      hasBoss: (level.bossCount || 0) > 0,
      goalKills: level.goalKills,
      palette: level.palette || { base: [2, 16, 34], blob: [12, 45, 72] },
      bestScore: this.levelProgress.bestScores[index] || 0,
      locked: false
    }));
  }

  completeCurrentLevelForProgress() {
    const currentBest = this.levelProgress.bestScores[this.currentLevelIndex] || 0;
    if (this.score > currentBest) {
      this.levelProgress.bestScores[this.currentLevelIndex] = this.score;
    }

    const unlockTarget = this.currentLevelIndex + 2;
    this.levelProgress.unlockedLevels = min(config.levels.length, max(this.levelProgress.unlockedLevels, unlockTarget));
    this.saveLevelProgress();
  }

  bindKeys() {
    window.addEventListener("keydown", (e) => {
      this.keys.add(e.key);
      this.handleKeyPress(e.key);
    });

    window.addEventListener("keyup", (e) => {
      this.keys.delete(e.key);
    });
  }

  handleKeyPress(key) {
    if (key === "d" || key === "D") {
      config.debug = !config.debug;
      this.ui.debugToggle.checked = config.debug;
    }

    if (key === "p" || key === "P") {
      this.togglePause();
    }

    if (key === "r" || key === "R") {
      this.reloadCurrentLevel();
    }

    if ((key === "h" || key === "H") && this.state !== GameState.MENU) {
      this.backToMenu();
    }

    if (
      key === "Escape" &&
      (this.state === GameState.PAUSED ||
        this.state === GameState.LEVELCLEAR ||
        this.state === GameState.VICTORY ||
        this.state === GameState.GAMEOVER)
    ) {
      this.backToMenu();
    }
  }

  handleMousePressed() {
    if (this.state === GameState.PLAYING && this.hud?.hitHelpBox) {
      const hudHit = this.hud.hitHelpBox(mouseX, mouseY);
      if (hudHit) {
        this.hudHelpKey = this.hudHelpKey === hudHit.key ? null : hudHit.key;
        return;
      }
      this.hudHelpKey = null;
    }

    this.tryShoot(millis(), true);
  }

  tryShoot(nowMs, consumeMachinegun = true) {
    if (this.state !== GameState.PLAYING || !this.player) return;
    if (consumeMachinegun && this.machinegunCharge < config.missiles.machinegun.shotCost) return false;

    const fireCooldownMs = config.missiles.machinegun.fireCooldownMs;
    if (nowMs - this.lastShotMs < fireCooldownMs) return false;

    const target = createVector(mouseX, mouseY);
    const dir = p5.Vector.sub(target, this.player.pos);
    if (dir.magSq() < 0.001) return false;

    const spawnPos = this.player.pos.copy().add(dir.copy().setMag(this.player.r + 6));
    this.missiles.push(new Missile(spawnPos.x, spawnPos.y, dir));
    this.lastShotMs = nowMs;

    if (consumeMachinegun) {
      this.machinegunCharge = max(0, this.machinegunCharge - config.missiles.machinegun.shotCost);
    }
    return true;
  }

  updateMachinegun(nowMs, dtMs) {
    if (this.state !== GameState.PLAYING) return;

    if (mouseIsPressed) {
      this.tryShoot(nowMs, true);
    } else {
      const regen = config.missiles.machinegun.regenPerSec * (dtMs / 1000);
      this.machinegunCharge = min(config.missiles.machinegun.maxCharge, this.machinegunCharge + regen);
    }
  }

  togglePause() {
    if (this.state === GameState.PLAYING) {
      this.pauseGame();
    } else if (this.state === GameState.PAUSED) {
      this.resume();
    }
  }

  pauseGame() {
    if (this.state !== GameState.PLAYING) return;
    this.state = GameState.PAUSED;
    this.ui.showPause();
    this.ui.setPauseButton(true);
    noLoop();
  }

  resume() {
    if (this.state !== GameState.PAUSED) return;
    this.state = GameState.PLAYING;
    this.ui.hidePause();
    this.ui.setPauseButton(false);
    loop();
  }

  randomSpawnOutside() {
    const side = floor(random(4));
    if (side === 0) return createVector(-40, random(height));
    if (side === 1) return createVector(width + 40, random(height));
    if (side === 2) return createVector(random(width), -40);
    return createVector(random(width), height + 40);
  }

  makeObstacles() {
    this.obstacles.length = 0;
    for (let i = 0; i < config.world.obstacleCount; i += 1) {
      let attempts = 0;
      let pos;
      let valid = false;
      const r = random(24, 48);

      while (!valid && attempts < 80) {
        attempts += 1;
        pos = createVector(random(r + 20, width - r - 20), random(r + 80, height - r - 20));
        valid = this.player.pos.dist(pos) > config.world.safeMargin;
        for (const o of this.obstacles) {
          if (o.pos.dist(pos) < o.r + r + 24) {
            valid = false;
            break;
          }
        }
      }

      if (valid) {
        this.obstacles.push(new Obstacle(pos.x, pos.y, r));
      }
    }

    this.ensureSingleSpecialObstacle();
  }

  syncObstaclesToConfig() {
    while (this.obstacles.length < config.world.obstacleCount) {
      const r = random(24, 48);
      let attempts = 0;
      let pos = null;
      let valid = false;
      while (!valid && attempts < 60) {
        attempts += 1;
        pos = createVector(random(r + 20, width - r - 20), random(r + 80, height - r - 20));
        valid = this.player ? this.player.pos.dist(pos) > config.world.safeMargin : true;
        for (const o of this.obstacles) {
          if (o.pos.dist(pos) < o.r + r + 24) {
            valid = false;
            break;
          }
        }
      }
      if (valid) {
        this.obstacles.push(new Obstacle(pos.x, pos.y, r));
      } else {
        break;
      }
    }
    while (this.obstacles.length > config.world.obstacleCount) {
      this.obstacles.pop();
    }

    this.ensureSingleSpecialObstacle();
  }

  ensureSingleSpecialObstacle() {
    if (this.obstacles.length === 0) return;

    const specials = this.obstacles.filter((o) => o.isSpecial);
    if (specials.length === 0) {
      this.obstacles[floor(random(this.obstacles.length))].setSpecial(true);
      return;
    }

    for (let i = 1; i < specials.length; i += 1) {
      specials[i].setSpecial(false);
    }
  }

  prepareLevel(levelIndex, resetRun) {
    const level = config.levels[levelIndex];
    this.currentLevelIndex = levelIndex;
    this.applyLevelTheme(levelIndex);
    this.levelGoalKills = level.goalKills;
    this.currentLevelLabel = level.label;
    config.enemy.maxCount = level.enemyCount;

    if (resetRun || !this.player) {
      this.score = 0;
      this.startMs = millis();
      this.lives = config.player.lives;
      this.coinsCollected = 0;
      this.kills = 0;
      this.enemyHits = 0;
      this.maxEnemiesOnScreen = 0;
      this.player = new Player(width * 0.5, height * 0.5);
    } else {
      this.player.pos.set(width * 0.5, height * 0.5);
      this.player.vel.mult(0);
      this.player.acc.mult(0);
    }

    this.levelKills = 0;
    this.lastHitMs = -9999;
    this.lastCoinSpawnMs = millis();
    this.lastShockSpawnMs = millis();
    this.lastShotMs = -9999;
    this.machinegunCharge = config.missiles.machinegun.maxCharge;

    this.enemies = [];
    this.coins = [];
    this.medkits = [];
    this.shockPickups = [];
    this.missiles = [];
    this.enemyProjectiles = [];
    this.explosions = [];
    this.makeObstacles();

    const enemyTier = min(3, levelIndex + 1);

    for (let i = 0; i < level.enemyCount; i += 1) {
      const spawn = this.randomSpawnOutside();
      const enemy = new Enemy(spawn.x, spawn.y, { tier: enemyTier });
      enemy.canShoot = levelIndex >= 1 && (levelIndex === 1 || i < 2);
      enemy.lastShotMs = -9999;
      this.enemies.push(enemy);
    }

    for (let i = 0; i < (level.bossCount || 0); i += 1) {
      const spawn = this.randomSpawnOutside();
      const boss = new Enemy(spawn.x, spawn.y, { tier: 3, isBoss: true });
      boss.canShoot = false;
      boss.lastShotMs = -9999;
      this.enemies.push(boss);
    }

    const introByLevel = [
      "🛰 Bienvenue pilote. Traverse la galaxie, esquive les obstacles et elimine les ennemis vaisseaux avant qu'ils ne te prennent de vitesse.",
      "Niveau 2: combat total. Les ennemis ripostent, alors recupere un eclair et percute un ennemi vaisseau pour infliger de gros degats.",
      "👑 Niveau 3: alerte maximale. Deux tireurs d'elite et un boss final te barrent la route. Garde ton eclair pour abattre le commandant ennemi."
    ];

    this.shockReady = false;
    this.shockContactGrace = false;

    this.state = GameState.INTRO;
    this.ui.hideMenu();
    this.ui.hidePause();
    this.ui.hideGameOver();
    this.ui.hideLevelClear();
    this.ui.hideVictory();
    this.ui.setPauseButton(false);
    this.ui.syncSlidersFromConfig();
    this.ui.showIntro({
      levelLabel: level.label,
      objectiveText: `Objectif: éliminer ${level.goalKills} ennemis • Difficulté: ${level.difficulty || "Standard"}${(level.bossCount || 0) > 0 ? " • Boss final" : ""}`,
      introText: introByLevel[min(levelIndex, introByLevel.length - 1)]
    });
    noLoop();
  }

  spawnEnemyShots(nowMs) {
    if (!this.player) return;

    for (const enemy of this.enemies) {
      if (!enemy.canShoot) continue;

      const dist = enemy.pos.dist(this.player.pos);
      if (dist > config.enemy.detectionRadius * 1.4) continue;

      const cooldown = config.enemy.shotCooldownMs * (enemy.tier >= 3 ? 0.85 : 1);
      if (nowMs - (enemy.lastShotMs || -9999) < cooldown) continue;

      const dir = p5.Vector.sub(this.player.pos, enemy.pos);
      if (dir.magSq() < 0.001) continue;

      const spawnPos = enemy.pos.copy().add(dir.copy().setMag(enemy.r + 6));
      this.enemyProjectiles.push(
        new EnemyProjectile(spawnPos.x, spawnPos.y, dir, {
          speed: config.enemy.shotSpeed * (enemy.tier >= 3 ? 1.12 : 1),
          lifeMs: config.enemy.shotLifeMs,
          damage: config.enemy.shotDamage,
          isBoss: enemy.isBoss
        })
      );
      enemy.lastShotMs = nowMs;
    }
  }

  start() {
    this.prepareLevel(0, true);
  }

  reloadCurrentLevel() {
    if (this.state === GameState.MENU) {
      this.start();
      return;
    }
    this.prepareLevel(this.currentLevelIndex, true);
  }

  startLevelFromMenu(levelIndex) {
    if (levelIndex < 0 || levelIndex >= config.levels.length) return;
    this.prepareLevel(levelIndex, true);
  }

  beginLevelFromIntro() {
    if (this.state !== GameState.INTRO) return;
    this.state = GameState.PLAYING;
    this.ui.hideIntro();
    this.ui.setPauseButton(false);
    loop();
  }

  nextLevel() {
    const nextIndex = this.currentLevelIndex + 1;
    if (nextIndex < config.levels.length) {
      this.prepareLevel(nextIndex, false);
    } else {
      this.completeVictory();
    }
  }

  backToMenu() {
    this.state = GameState.MENU;
    this.ui.showMenu(this.getMenuLevelData());
    this.ui.setPauseButton(false);
    noLoop();
  }

  spawnCoinIfNeeded(nowMs) {
    if (this.coins.length >= config.coins.maxCount) return;
    if (nowMs - this.lastCoinSpawnMs < config.coins.spawnDelayMs) return;

    const x = random(40, width - 40);
    const y = random(70, height - 40);
    this.coins.push(new Coin(x, y));
    this.lastCoinSpawnMs = nowMs;
  }

  spawnShockIfNeeded(nowMs) {
    if (this.shockReady) return;
    if (this.shockPickups.length >= config.shock.maxCount) return;
    if (nowMs - this.lastShockSpawnMs < config.shock.spawnDelayMs) return;

    const x = random(40, width - 40);
    const y = random(70, height - 40);
    this.shockPickups.push(new ShockPickup(x, y));
    this.lastShockSpawnMs = nowMs;
  }

  applyExplosion(x, y) {
    this.explosions.push(new Explosion(x, y));
  }

  handleCollisions(nowMs) {
    let overlappingEnemy = false;

    for (const enemy of this.enemies) {
      const d = this.player.pos.dist(enemy.pos);
      if (d < this.player.r + enemy.r * 0.65) {
        overlappingEnemy = true;

        if (this.shockReady) {
          const burst = max(1, Math.floor(enemy.maxHealth * config.shock.contactDamageRatio));
          const dead = enemy.takeDamage(burst);
          this.shockReady = false;
          this.shockContactGrace = true;
          this.lastHitMs = nowMs;
          this.applyExplosion(enemy.pos.x, enemy.pos.y);
          if (dead) {
            this.enemies = this.enemies.filter((e) => e !== enemy);
            this.kills += 1;
            this.levelKills += 1;
            this.score += 140;
            if (this.levelKills >= this.levelGoalKills) {
              this.completeLevel();
              return;
            }
          }
          break;
        }

        if (this.shockContactGrace) {
          break;
        }

        if (nowMs - this.lastHitMs < config.player.hitCooldownMs) {
          break;
        }
        this.lastHitMs = nowMs;
        if (!this.player.absorbHit()) {
          this.lives -= 1;
        }

        const knock = p5.Vector.sub(this.player.pos, enemy.pos).setMag(this.player.maxForce * 18);
        this.player.applyForce(knock);
        break;
      }
    }

    if (this.shockContactGrace && !overlappingEnemy) {
      this.shockContactGrace = false;
    }

    for (let i = this.shockPickups.length - 1; i >= 0; i -= 1) {
      const s = this.shockPickups[i];
      if (this.player.pos.dist(s.pos) < this.player.r + s.r) {
        this.shockReady = true;
        this.shockPickups.splice(i, 1);
      }
    }

    for (let i = this.medkits.length - 1; i >= 0; i -= 1) {
      const medkit = this.medkits[i];
      if (this.player.pos.dist(medkit.pos) < this.player.r + medkit.r) {
        this.lives = min(config.player.lives, this.lives + config.medkit.healAmount);
        this.medkits.splice(i, 1);
      }
    }

    for (let i = this.coins.length - 1; i >= 0; i -= 1) {
      const c = this.coins[i];
      if (this.player.pos.dist(c.pos) < this.player.r + c.r) {
        this.coinsCollected += config.coins.value;
        this.score += 50;
        this.coins.splice(i, 1);

        if (this.coinsCollected % config.coins.armorThreshold === 0) {
          this.player.addArmor();
        }
      }
    }

    for (let m = this.missiles.length - 1; m >= 0; m -= 1) {
      const missile = this.missiles[m];
      if (missile.dead) {
        this.missiles.splice(m, 1);
        continue;
      }

      for (let e = this.enemies.length - 1; e >= 0; e -= 1) {
        const enemy = this.enemies[e];
        const d = missile.pos.dist(enemy.pos);
        if (d < missile.r + enemy.r * 0.7) {
          missile.dead = true;
          this.enemyHits += 1;
          const dead = enemy.takeDamage(config.missiles.damage);
          if (dead) {
            this.enemies.splice(e, 1);
            this.kills += 1;
            this.levelKills += 1;
            this.score += 120;
            this.applyExplosion(enemy.pos.x, enemy.pos.y);
            if (this.levelKills >= this.levelGoalKills) {
              this.completeLevel();
              return;
            }
          }
          break;
        }
      }

      if (missile.dead) {
        continue;
      }

      for (let o = this.obstacles.length - 1; o >= 0; o -= 1) {
        const obstacle = this.obstacles[o];
        if (missile.pos.dist(obstacle.pos) < missile.r + obstacle.r) {
          missile.dead = true;
          if (!obstacle.isSpecial) {
            break;
          }

          const destroyed = obstacle.takeDamage(config.obstacles.hitDamage);
          if (destroyed) {
            const spawnPos = obstacle.pos.copy();
            this.obstacles.splice(o, 1);
            this.applyExplosion(spawnPos.x, spawnPos.y);

            if (this.medkits.length < config.medkit.maxCount) {
              this.medkits.push(new MedkitPickup(spawnPos.x, spawnPos.y));
            }

            this.ensureSingleSpecialObstacle();
          }
          break;
        }
      }
    }

    for (let p = this.enemyProjectiles.length - 1; p >= 0; p -= 1) {
      const projectile = this.enemyProjectiles[p];
      if (projectile.dead) {
        this.enemyProjectiles.splice(p, 1);
        continue;
      }

      if (this.player.pos.dist(projectile.pos) < this.player.r + projectile.r) {
        if (nowMs - this.lastHitMs >= config.player.hitCooldownMs) {
          this.lastHitMs = nowMs;
          if (!this.player.absorbHit()) {
            this.lives -= projectile.damage;
          }
        }
        projectile.dead = true;
      }
    }
  }

  completeLevel() {
    if (this.currentLevelIndex + 1 >= config.levels.length) {
      this.completeVictory();
      return;
    }

    this.completeCurrentLevelForProgress();

    this.state = GameState.LEVELCLEAR;
    this.ui.showLevelClear({
      levelLabel: this.currentLevelLabel,
      targetKills: this.levelGoalKills
    });
    this.ui.setPauseButton(false);
    noLoop();
  }

  completeVictory() {
    this.completeCurrentLevelForProgress();

    this.state = GameState.VICTORY;
    const sec = Math.floor((millis() - this.startMs) / 1000);
    const mm = String(Math.floor(sec / 60)).padStart(2, "0");
    const ss = String(sec % 60).padStart(2, "0");
    this.ui.showVictory(this.score, {
      timeText: `${mm}:${ss}`,
      kills: this.kills,
      hits: this.enemyHits,
      coins: this.coinsCollected
    });
    this.ui.setPauseButton(false);
    noLoop();
  }

  update() {
    if (this.state !== GameState.PLAYING) return;

    const nowMs = millis();
    const elapsedMs = nowMs - this.startMs;

    this.spawnCoinIfNeeded(nowMs);
    this.spawnShockIfNeeded(nowMs);
    this.syncObstaclesToConfig();

    this.player.update(this.keys, this.obstacles, createVector(mouseX, mouseY));
    this.updateMachinegun(nowMs, deltaTime);

    for (const enemy of this.enemies) {
      enemy.update(this.player, this.obstacles, this.enemies);
    }

    for (const obstacle of this.obstacles) {
      obstacle.update();
    }

    for (const coin of this.coins) {
      coin.update();
    }

    for (const medkit of this.medkits) {
      medkit.update();
    }

    for (const shock of this.shockPickups) {
      shock.update();
    }

    for (const missile of this.missiles) {
      missile.update();
    }

    for (const projectile of this.enemyProjectiles) {
      projectile.update();
    }

    this.spawnEnemyShots(nowMs);

    for (const explosion of this.explosions) {
      explosion.update();
    }

    this.handleCollisions(nowMs);
    this.score += deltaTime * 0.008;
    this.maxEnemiesOnScreen = max(this.maxEnemiesOnScreen, this.enemies.length);

    this.missiles = this.missiles.filter((missile) => !missile.dead);
    this.enemyProjectiles = this.enemyProjectiles.filter((projectile) => !projectile.dead);
    this.explosions = this.explosions.filter((explosion) => !explosion.dead);

    if (this.lives <= 0 && this.state === GameState.PLAYING) {
      const sec = Math.floor(elapsedMs / 1000);
      const mm = String(Math.floor(sec / 60)).padStart(2, "0");
      const ss = String(sec % 60).padStart(2, "0");
      this.state = GameState.GAMEOVER;
      this.ui.showGameOver(this.score, {
        timeText: `${mm}:${ss}`,
        kills: this.kills,
        hits: this.enemyHits,
        coins: this.coinsCollected,
        maxEnemiesOnScreen: this.maxEnemiesOnScreen
      });
      this.ui.setPauseButton(false);
      noLoop();
    }
  }

  renderBackground() {
    const level = config.levels[min(this.currentLevelIndex, config.levels.length - 1)] || {};
    const palette = level.palette || { base: [2, 16, 34], blob: [12, 45, 72] };

    background(palette.base[0], palette.base[1], palette.base[2]);

    noStroke();
    fill(palette.blob[0], palette.blob[1], palette.blob[2], 120);
    for (let i = 0; i < 8; i += 1) {
      const x = noise(i * 0.5, frameCount * 0.004) * width;
      const y = noise(i * 0.5 + 99, frameCount * 0.004) * height;
      circle(x, y, 120 + 60 * sin(frameCount * 0.01 + i));
    }
  }

  draw() {
    this.renderBackground();

    if (this.state !== GameState.MENU) {
      for (const obstacle of this.obstacles) obstacle.show();
      for (const coin of this.coins) coin.show();
      for (const medkit of this.medkits) medkit.show();
      for (const shock of this.shockPickups) shock.show();
      for (const enemy of this.enemies) enemy.show();
      for (const missile of this.missiles) missile.show();
      for (const projectile of this.enemyProjectiles) projectile.show();
      for (const explosion of this.explosions) explosion.show();

      const invulnerable = millis() - this.lastHitMs < config.player.hitCooldownMs;
      if (this.player) this.player.show(invulnerable, this.shockReady);

      const elapsedMs = max(0, millis() - this.startMs);
      this.hud.activeHelp = this.hudHelpKey;
      this.hud.draw({
        score: this.score,
        elapsedMs,
        lives: this.lives,
        enemyCount: this.enemies.length,
        coins: this.coinsCollected,
        nitro: this.player ? this.player.nitro : 0,
        armorHealth: this.player ? this.player.armorHealth : 0,
        enemyHits: this.enemyHits,
        levelLabel: this.currentLevelLabel,
        levelKills: this.levelKills,
        levelGoalKills: this.levelGoalKills,
        machinegunCharge: this.machinegunCharge,
        machinegunMax: config.missiles.machinegun.maxCharge,
        shockReady: this.shockReady,
        theme: this.currentTheme
      });

      if (config.debug) {
        this.debugRenderer.draw(this.obstacles, this.enemies);
      }
    }
  }
}

let game;
