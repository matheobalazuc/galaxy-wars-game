class Hud {
  draw({ score, elapsedMs, lives, enemyCount, coins, nitro, enemyHits, armorHealth, levelLabel, levelKills, levelGoalKills, machinegunCharge, machinegunMax, shockReady, theme }) {
    const sec = Math.floor(elapsedMs / 1000);
    const mm = String(Math.floor(sec / 60)).padStart(2, "0");
    const ss = String(sec % 60).padStart(2, "0");

    const hudBg = theme?.hudBg || [4, 15, 35];
    const textColor = theme?.text || [230, 246, 255];
    const nitroColor = [178, 86, 255];
    const machinegunColor = [255, 214, 68];
    const armorColor = [72, 165, 255];

    this.helpBoxes = [];

    push();
    noStroke();
    const panelWidth = min(width - 24, 920);
    const panelX = 12;
    const panelY = 12;
    const panelHeight = 102;
    const left = panelX + 12;

    fill(hudBg[0], hudBg[1], hudBg[2], 170);
    rect(panelX, panelY, panelWidth, panelHeight, 10);

    fill(textColor[0], textColor[1], textColor[2]);
    textSize(14);
    textAlign(LEFT, CENTER);
    const topY = 30;
    const infoCol = panelWidth / 5;
    const xScore = left;
    const xTime = left + infoCol;
    const xFight = left + infoCol * 2;
    const xCoins = left + infoCol * 3;
    const xLife = left + infoCol * 4;

    text(`SCORE ${Math.floor(score)}`, xScore, topY);
    text(`TEMPS ${mm}:${ss}`, xTime, topY);
    text(`ENNEMIS ${levelGoalKills} | TUES ${levelKills}`, xFight, topY);
    text(`PIECES ${coins}`, xCoins, topY);
    text("VIE", xLife, topY);

    const maxLife = max(1, config.player.lives);
    const lifeRatio = constrain(lives / maxLife, 0, 1);
    const lifeBarX = xLife + 36;
    const lifeBarY = 30;
    const lifeBarW = constrain(panelWidth * 0.11, 64, 92);
    const lifeBarH = 11;

    fill(25, 35, 45, 200);
    rect(lifeBarX, lifeBarY - lifeBarH / 2, lifeBarW, lifeBarH, 4);

    if (lifeRatio <= 1 / 3) {
      fill(240, 72, 64);
    } else if (lifeRatio <= 0.5) {
      fill(255, 208, 72);
    } else {
      fill(80, 220, 120);
    }
    rect(lifeBarX, lifeBarY - lifeBarH / 2, lifeBarW * lifeRatio, lifeBarH, 4);

    fill(255);
    textSize(12);
    const barWidth = constrain(panelWidth * 0.11, 72, 102);
    const barY = 78;
    const labelY = 58;

    const gaugeGap = panelWidth * 0.31;
    const nitroLabelX = left;
    const mgLabelX = left + gaugeGap;
    const armorLabelX = left + gaugeGap * 2;

    text("NITRO", nitroLabelX, labelY);
    fill(25, 35, 45, 200);
    const nitroBarX = nitroLabelX + 52;
    rect(nitroBarX, barY - 6, barWidth, 10, 4);
    fill(nitroColor[0], nitroColor[1], nitroColor[2]);
    rect(nitroBarX, barY - 6, barWidth * constrain(nitro / config.player.nitroMax, 0, 1), 10, 4);
    this.drawHelpIcon(nitroBarX + barWidth + 10, labelY, "nitro", {
      title: "Nitro",
      body: "Te fait aller plus vite pour esquiver ou poursuivre une cible.",
      action: "Activation: maintiens Espace"
    });

    fill(255);
    text("MITRAILLETTE", mgLabelX, labelY);
    fill(25, 35, 45, 200);
    const mgBarX = mgLabelX + 86;
    rect(mgBarX, barY - 6, barWidth, 10, 4);
    fill(machinegunColor[0], machinegunColor[1], machinegunColor[2]);
    rect(mgBarX, barY - 6, barWidth * constrain(machinegunCharge / max(1, machinegunMax), 0, 1), 10, 4);
    this.drawHelpIcon(mgBarX + barWidth + 10, labelY, "machinegun", {
      title: "Mitraillette",
      body: "Permet de tirer plusieurs balles rapidement tant que la jauge jaune est remplie.",
      action: "Activation: maintiens le clic gauche"
    });

    fill(255);
    text("ARMURE", armorLabelX, labelY);
    fill(25, 35, 45, 200);
    const armorBarX = armorLabelX + 62;
    rect(armorBarX, barY - 6, barWidth, 10, 4);
    fill(armorColor[0], armorColor[1], armorColor[2]);
    rect(armorBarX, barY - 6, barWidth * constrain(armorHealth / config.player.armorMaxHealth, 0, 1), 10, 4);
    this.drawHelpIcon(armorBarX + barWidth + 10, labelY, "armor", {
      title: "Armure",
      body: "Protège contre les ennemis et absorbe plusieurs dégâts.",
      action: "Activation: ramasse plus de 5 pièces"
    });

    const shockText = shockReady ? "ECLAIR Actif" : "ECLAIR Inactif";
    const shockX = panelX + panelWidth - textWidth(shockText) - 36;
    if (shockReady) {
      fill(255, 245, 120);
      text(shockText, shockX, labelY);
    } else {
      fill(180, 190, 210);
      text(shockText, shockX, labelY);
    }
    this.drawHelpIcon(panelX + panelWidth - 18, labelY, "shock", {
      title: "Éclair",
      body: "Donne un contact puissant qui inflige des gros dégâts sans te faire perdre de vie.",
      action: "Activation: ramasse l'éclair puis touche un ennemi vaisseau"
    });

    if (this.activeHelp) {
      const box = this.helpBoxes.find((entry) => entry.key === this.activeHelp);
      if (box) {
        const tooltipW = min(270, width - 36);
        const tooltipX = constrain(box.x, 18, width - tooltipW - 18);
        const tooltipY = panelY + panelHeight + 8;

        push();
        noStroke();
        fill(6, 14, 28, 240);
        rect(tooltipX, tooltipY, tooltipW, 90, 10);
        fill(255, 255, 255);
        textAlign(LEFT, TOP);
        textSize(12);
        text(box.title, tooltipX + 10, tooltipY + 8);
        textSize(11);
        fill(214, 232, 245);
        text(box.body, tooltipX + 10, tooltipY + 29, tooltipW - 20, 30);
        fill(255, 226, 140);
        text(box.action, tooltipX + 10, tooltipY + 60, tooltipW - 20, 24);
        pop();
      }
    }
    pop();
  }

  drawHelpIcon(x, y, key, copy) {
    const radius = 8;
    const cx = constrain(x, 22, width - 22);
    this.helpBoxes.push({ key, x: cx - radius, y: y - radius, w: radius * 2, h: radius * 2, ...copy });

    push();
    noStroke();
    fill(255, 255, 255, 42);
    circle(cx, y, radius * 2);
    fill(255, 255, 255);
    textAlign(CENTER, CENTER);
    textSize(11);
    text("?", cx, y - 0.5);
    pop();
  }

  hitHelpBox(mx, my) {
    return this.helpBoxes.find((box) => mx >= box.x && mx <= box.x + box.w && my >= box.y && my <= box.y + box.h) || null;
  }
}
