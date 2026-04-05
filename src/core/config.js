const defaultConfig = {
  debug: false,
  world: {
    obstacleCount: 8,
    safeMargin: 120
  },
  weights: {
    avoid: 1.5,
    seek: 1.0,
    wander: 0.5,
    arrive: 1.2,
    separation: 0.8
  },
  enemy: {
    baseMaxSpeed: 2.5,
    maxSpeed: 2.5,
    maxForce: 0.2,
    detectionRadius: 150,
    arriveRadius: 80,
    maxCount: 5,
    spawnDelayMs: 2500,
    shotCooldownMs: 1350,
    shotSpeed: 5.6,
    shotLifeMs: 1400,
    shotDamage: 1
  },
  missiles: {
    speed: 8,
    maxLifeMs: 1200,
    cooldownMs: 220,
    damage: 25,
    machinegun: {
      maxCharge: 100,
      shotCost: 8,
      regenPerSec: 22,
      fireCooldownMs: 95
    }
  },
  coins: {
    spawnDelayMs: 3000,
    maxCount: 6,
    radius: 10,
    value: 1,
    armorThreshold: 6
  },
  obstacles: {
    maxHealth: 120,
    hitDamage: 40,
    specialSpeedMin: 0.9,
    specialSpeedMax: 1.5
  },
  medkit: {
    maxCount: 1,
    healAmount: 2,
    radius: 11
  },
  shock: {
    spawnDelayMs: 6500,
    maxCount: 1,
    radius: 11,
    contactDamageRatio: 0.34
  },
  player: {
    maxSpeed: 4.0,
    maxForce: 0.35,
    lives: 6,
    hitCooldownMs: 1200,
    nitroMax: 100,
    nitroRegenPerSec: 18,
    nitroDrainPerSec: 28,
    nitroSpeedMultiplier: 1.7,
    armorMaxHealth: 100,
    armorHitDamage: 34
  },
  levels: [
    {
      label: "Niveau 1",
      theme: "Bleu nuit",
      difficulty: "Facile",
      enemyCount: 2,
      goalKills: 2,
      palette: {
        base: [2, 16, 34],
        blob: [12, 45, 72]
      }
    },
    {
      label: "Niveau 2",
      theme: "Brun roche",
      difficulty: "Moyen",
      enemyCount: 3,
      goalKills: 3,
      palette: {
        base: [42, 27, 18],
        blob: [96, 62, 37]
      }
    },
    {
      label: "Niveau 3",
      theme: "Rouge alerte",
      difficulty: "Difficile",
      enemyCount: 2,
      bossCount: 1,
      goalKills: 3,
      palette: {
        base: [58, 10, 12],
        blob: [128, 26, 22]
      }
    }
  ],
  difficulty: {
    speedGrowthPerMin: 0.7,
    maxCountGrowthPerMin: 2
  }
};

globalThis.defaultConfig = defaultConfig;
globalThis.config = JSON.parse(JSON.stringify(defaultConfig));
