class UIManager {
  constructor() {
    this.menuLevels = document.getElementById("menu-levels");
    this.pauseInGameBtn = document.getElementById("pause-in-game-btn");
    this.toggleSlidersBtn = document.getElementById("toggle-sliders-btn");
    this.liveControlsShown = true;

    this.resumeBtn = document.getElementById("resume-btn");
    this.restartBtnPause = document.getElementById("restart-btn");
    this.restartBtnGameover = document.getElementById("restart-btn-gameover");
    this.restartBtnVictory = document.getElementById("restart-btn-victory");
    this.restartBtnLevel = document.getElementById("restart-btn-level");

    this.backMenuBtn = document.getElementById("back-menu-btn");
    this.backMenuBtnGameover = document.getElementById("back-menu-btn-gameover");
    this.backMenuBtnVictory = document.getElementById("back-menu-btn-victory");
    this.backMenuBtnLevel = document.getElementById("back-menu-btn-level");

    this.introScreen = document.getElementById("intro-screen");
    this.introTitle = document.getElementById("intro-title");
    this.introBody = document.getElementById("intro-body");
    this.introObjective = document.getElementById("intro-objective");
    this.introContinueBtn = document.getElementById("intro-continue-btn");

    this.levelClearScreen = document.getElementById("levelclear-screen");
    this.levelInfo = document.getElementById("level-info");
    this.levelGoal = document.getElementById("level-goal");
    this.nextLevelBtn = document.getElementById("next-level-btn");

    this.victoryScreen = document.getElementById("victory-screen");
    this.victoryScore = document.getElementById("victory-score");
    this.victoryRecap = document.getElementById("victory-recap");

    this.debugToggle = document.getElementById("debug-toggle");
    this.finalScore = document.getElementById("final-score");
    this.finalRecap = document.getElementById("final-recap");

    this.liveControls = document.getElementById("live-controls");
    this.sliderContainer = this.liveControls;
    this.liveEnemySpeed = document.getElementById("live-enemy-speed");
    this.liveDetectRadius = document.getElementById("live-detect-radius");
    this.liveObstacleCount = document.getElementById("live-obstacle-count");
    this.liveEnemySpeedVal = document.getElementById("live-enemy-speed-val");
    this.liveDetectRadiusVal = document.getElementById("live-detect-radius-val");
    this.liveObstacleCountVal = document.getElementById("live-obstacle-count-val");

    this.createSliders();

    this.debugToggle.addEventListener("change", (e) => {
      config.debug = e.target.checked;
    });
  }

  bind(game) {
    this.game = game;

    this.menuLevels.addEventListener("click", (e) => {
      const card = e.target.closest(".level-card");
      if (!card || card.disabled) return;
      const levelIndex = parseInt(card.dataset.levelIndex, 10);
      if (!Number.isNaN(levelIndex)) {
        game.startLevelFromMenu(levelIndex);
      }
    });

    this.introContinueBtn.addEventListener("click", () => game.beginLevelFromIntro());
    this.pauseInGameBtn.addEventListener("click", () => game.togglePause());
    this.toggleSlidersBtn.addEventListener("click", () => this.toggleLiveControls());
    this.resumeBtn.addEventListener("click", () => game.resume());
    this.nextLevelBtn.addEventListener("click", () => game.nextLevel());

    this.restartBtnPause.addEventListener("click", () => game.reloadCurrentLevel());
    this.restartBtnGameover.addEventListener("click", () => game.reloadCurrentLevel());
    this.restartBtnVictory.addEventListener("click", () => game.reloadCurrentLevel());
    this.restartBtnLevel.addEventListener("click", () => game.reloadCurrentLevel());

    this.backMenuBtn.addEventListener("click", () => game.backToMenu());
    this.backMenuBtnGameover.addEventListener("click", () => game.backToMenu());
    this.backMenuBtnVictory.addEventListener("click", () => game.backToMenu());
    this.backMenuBtnLevel.addEventListener("click", () => game.backToMenu());

    this.liveEnemySpeed.addEventListener("input", (e) => {
      config.enemy.maxSpeed = parseFloat(e.target.value);
      this.liveEnemySpeedVal.textContent = config.enemy.maxSpeed.toFixed(1);
    });
    this.liveDetectRadius.addEventListener("input", (e) => {
      config.enemy.detectionRadius = Math.round(parseFloat(e.target.value));
      this.liveDetectRadiusVal.textContent = String(config.enemy.detectionRadius);
    });
    this.liveObstacleCount.addEventListener("input", (e) => {
      config.world.obstacleCount = Math.round(parseFloat(e.target.value));
      this.liveObstacleCountVal.textContent = String(config.world.obstacleCount);
      if (game && game.state === "PLAYING") game.syncObstaclesToConfig();
    });

    this.renderMenuLevels(game.getMenuLevelData());
  }

  renderMenuLevels(levels) {
    if (!this.menuLevels) return;
    this.menuLevels.innerHTML = "";

    for (const level of levels) {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "level-card";
      card.disabled = false;
      card.dataset.levelIndex = String(level.index);
      card.style.setProperty("--level-bg-rgb", level.palette.base.join(","));
      card.style.setProperty("--level-blob-rgb", level.palette.blob.join(","));

      const difficultyClass = level.difficulty === "Facile" ? "easy" : level.difficulty === "Moyen" ? "medium" : "hard";
      const bossLine = level.hasBoss ? '<div class="meta"><span class="meta-badge boss">👑 Boss final</span></div>' : "";
      card.innerHTML = `
        <div class="title">
          <span>${level.label}</span>
        </div>
        <div class="meta">Objectif: ${level.goalKills} éliminations</div>
        <div class="meta">Difficulté: <span class="meta-badge ${difficultyClass}">${level.difficulty}</span></div>
        ${bossLine}
        <div class="meta">Meilleur score: ${Math.floor(level.bestScore)}</div>
      `;

      this.menuLevels.appendChild(card);
    }
  }

  createSlider(name, min, max, step, getter, setter) {
    const row = document.createElement("div");
    row.className = "slider-row";

    const label = document.createElement("label");
    const spanName = document.createElement("span");
    spanName.textContent = name;
    const spanVal = document.createElement("span");
    spanVal.textContent = getter().toFixed(2);

    label.append(spanName, spanVal);

    const input = document.createElement("input");
    input.type = "range";
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
    input.value = String(getter());
    input.addEventListener("input", () => {
      const value = parseFloat(input.value);
      setter(value);
      spanVal.textContent = value.toFixed(2);
    });

    row.append(label, input);
    this.sliderContainer.appendChild(row);
    return { input, spanVal, getter };
  }

  createSliders() {
    this.sliderDefs = [
      this.createSlider("Poids Évitement", 0, 3, 0.05, () => config.weights.avoid, (v) => (config.weights.avoid = v)),
      this.createSlider("Poids Poursuite", 0, 3, 0.05, () => config.weights.seek, (v) => (config.weights.seek = v)),
      this.createSlider("Poids Errance", 0, 2, 0.05, () => config.weights.wander, (v) => (config.weights.wander = v)),
      this.createSlider("Poids Arrivée", 0, 3, 0.05, () => config.weights.arrive, (v) => (config.weights.arrive = v)),
      this.createSlider("Vitesse Joueur", 1, 8, 0.1, () => config.player.maxSpeed, (v) => (config.player.maxSpeed = v))
    ];
  }

  syncSlidersFromConfig() {
    for (const def of this.sliderDefs) {
      const value = def.getter();
      def.input.value = String(value);
      def.spanVal.textContent = Number(value).toFixed(2);
    }
    this.liveEnemySpeed.value = String(config.enemy.maxSpeed);
    this.liveDetectRadius.value = String(config.enemy.detectionRadius);
    this.liveObstacleCount.value = String(config.world.obstacleCount);
    this.liveEnemySpeedVal.textContent = config.enemy.maxSpeed.toFixed(1);
    this.liveDetectRadiusVal.textContent = String(config.enemy.detectionRadius);
    this.liveObstacleCountVal.textContent = String(config.world.obstacleCount);
  }

  toggleLiveControls() {
    this.liveControlsShown = !this.liveControlsShown;
    this.setLiveControlsVisible(this.liveControlsShown);
  }

  setLiveControlsVisible(visible) {
    this.liveControls.classList.toggle("visible", visible);
    this.toggleSlidersBtn.textContent = visible ? "🎚" : "🎚";
    this.toggleSlidersBtn.setAttribute("aria-label", visible ? "Masquer curseurs" : "Afficher curseurs");
  }

  setPauseButton(isPaused) {
    this.pauseInGameBtn.textContent = isPaused ? "▶" : "⏸";
    this.pauseInGameBtn.setAttribute("aria-label", isPaused ? "Reprendre" : "Pause");
  }

  showMenu(levels = []) {
    if (levels.length > 0) this.renderMenuLevels(levels);
    document.getElementById("menu-screen").classList.add("visible");
    document.getElementById("pause-screen").classList.remove("visible");
    document.getElementById("gameover-screen").classList.remove("visible");
    this.introScreen.classList.remove("visible");
    this.levelClearScreen.classList.remove("visible");
    this.victoryScreen.classList.remove("visible");
    this.pauseInGameBtn.classList.remove("visible");
    this.toggleSlidersBtn.classList.remove("visible");
    this.liveControls.classList.remove("visible");
  }

  hideMenu() {
    document.getElementById("menu-screen").classList.remove("visible");
    this.pauseInGameBtn.classList.add("visible");
    this.toggleSlidersBtn.classList.add("visible");
    this.setLiveControlsVisible(this.liveControlsShown);
  }

  showIntro({ levelLabel, objectiveText, introText }) {
    this.introTitle.textContent = levelLabel;
    this.introBody.innerHTML = `<span class="intro-tag">MISSION</span> ${introText || "Dans la galaxie tu devras te defendre a travers la galaxie et les obstacles pour te debarrasser des ennemis en leur tirant dessus. Tu pourras recuperer des pieces afin d'obtenir une armure qui te servira de protection."}`;
    this.introObjective.innerHTML = `<span class="intro-tag objective">OBJECTIF</span> ${objectiveText}`;
    this.introScreen.classList.add("visible");
    this.pauseInGameBtn.classList.remove("visible");
    this.toggleSlidersBtn.classList.remove("visible");
    this.liveControls.classList.remove("visible");
  }

  hideIntro() {
    this.introScreen.classList.remove("visible");
    this.pauseInGameBtn.classList.add("visible");
    this.toggleSlidersBtn.classList.add("visible");
    this.setLiveControlsVisible(this.liveControlsShown);
  }

  showPause() {
    document.getElementById("pause-screen").classList.add("visible");
    this.liveControls.classList.remove("visible");
  }

  hidePause() {
    document.getElementById("pause-screen").classList.remove("visible");
    this.liveControls.classList.add("visible");
  }

  showLevelClear({ levelLabel, targetKills }) {
    this.levelInfo.textContent = `${levelLabel} terminé`;
    this.levelGoal.textContent = `Objectif atteint: ${targetKills} ennemis éliminés.`;
    this.levelClearScreen.classList.add("visible");
    this.pauseInGameBtn.classList.remove("visible");
    this.toggleSlidersBtn.classList.remove("visible");
    this.liveControls.classList.remove("visible");
  }

  hideLevelClear() {
    this.levelClearScreen.classList.remove("visible");
  }

  showVictory(score, recap) {
    this.victoryScore.textContent = `Score final: ${Math.floor(score)}`;
    this.victoryRecap.innerHTML = [
      `Temps total: ${recap.timeText}`,
      `Ennemis éliminés: ${recap.kills}`,
      `Ennemis touchés: ${recap.hits}`,
      `Pièces récupérées: ${recap.coins}`
    ].join("<br>");
    this.victoryScreen.classList.add("visible");
    this.pauseInGameBtn.classList.remove("visible");
    this.toggleSlidersBtn.classList.remove("visible");
    this.liveControls.classList.remove("visible");
  }

  hideVictory() {
    this.victoryScreen.classList.remove("visible");
  }

  showGameOver(score, recap) {
    document.getElementById("gameover-screen").classList.add("visible");
    this.finalScore.textContent = `Score: ${Math.floor(score)}`;
    this.finalRecap.innerHTML = [
      `Temps survécu: ${recap.timeText}`,
      `Ennemis éliminés: ${recap.kills}`,
      `Ennemis touchés: ${recap.hits}`,
      `Pièces récupérées: ${recap.coins}`,
      `Ennemis max simultanés: ${recap.maxEnemiesOnScreen}`
    ].join("<br>");
    this.pauseInGameBtn.classList.remove("visible");
    this.toggleSlidersBtn.classList.remove("visible");
    this.liveControls.classList.remove("visible");
  }

  hideGameOver() {
    document.getElementById("gameover-screen").classList.remove("visible");
  }
}
