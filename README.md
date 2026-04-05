# Galaxy Wars

Galaxy Wars est un jeu d'arcade realise avec p5.js, base sur les steering behaviors.

## Lien de test et demo

- Jeu jouable en ligne: https://matheobalazuc.github.io/galaxy-wars-game/
- Une video de demonstration du gameplay est egalement disponible avec le projet: [DEMO_GalaxyWarsGame.mp4](DEMO_GalaxyWarsGame.mp4)

## Fonctionnalites principales

- 3 niveaux avec themes visuels differents et progression de difficulte.
- Ennemis autonomes avec poursuite, errance, separation, evitement d'obstacles et barre de vie.
- Boss final au niveau 3 avec comportement et visuel dedies.
- Tir en mode mitraillette (clic gauche maintenu) avec jauge de ressource.
- Nitro (Espace maintenu) avec jauge et regeneration.
- Pieces a collecter et armure qui absorbe les degats avant la vie.
- Pouvoir eclair avec pickup, impact de contact puissant et feedback visuel sur le joueur.
- Obstacle special mobile destructible pouvant faire apparaitre un medkit.
- HUD complet avec aides contextuelles cliquables via des icones "?".
- Sliders live pendant la partie pour ajuster les parametres IA et gameplay.

## Architecture du projet

- `lib/core/vehicules.js`: classe moteur de base (non modifiable).
- `src/core/behaviorManager.js`: gestionnaire de composition de comportements.
- `src/entities/player.js`, `src/entities/enemy.js`, `src/entities/missile.js`, `src/entities/enemyProjectile.js`, `src/entities/coin.js`, `src/entities/shockPickup.js`, `src/entities/medkitPickup.js`, `src/entities/obstacle.js`: entites animees (sous-classes de `Vehicle`).
- `src/systems/game.js`: orchestration des etats, spawns, collisions et logique globale.
- `src/systems/ui.js`: menus, overlays, pause, progression, sliders live.
- `src/systems/hud.js`: affichage des jauges et infos de partie.
- `src/systems/debug.js`: affichage debug des vecteurs, zones et etats.

## Contraintes techniques respectees

- `lib/core/vehicules.js` n'a pas ete modifie.
- p5.js est bien integre au jeu (`index.html`) et utilise comme moteur principal de rendu/simulation.
- Tous les objets animes sont des sous-classes de `Vehicle`.
- Les comportements de base restent dans `Vehicle`.
- Les comportements personnalises/composes sont geres dans les sous-classes et via `BehaviorManager`.
- Le `BehaviorManager` sert a ajouter/supprimer, activer/desactiver, ponderer et executer des comportements combines.

## Controles

- Souris + fleches: deplacement.
- Clic gauche maintenu: tir mitraillette.
- Espace maintenu: nitro.
- P: pause / reprise.
- R: relancer le niveau courant.
- H: retour menu principal.
- D: activer/desactiver debug.
- ESC: retour menu depuis les ecrans overlay.

## Mon expérience

J'ai choisi de faire ce jeu parce que le format arcade m'a permis de tester rapidement les comportements, tout en gardant un objectif de gameplay assez simple.

Les comportements que j'ai privilegies sont `seek`, `arrive`, `wander`, `avoidObstacles`. Ce choix m'a semble le plus pertinent pour obtenir un mouvement lisible mais dynamique, les ennemis poursuivent le joueur sans se coller entre eux, evitent les obstacles, et restent dans l'espace jouable.

Pour le reglage, j'ai travaille par iterations courtes avec les sliders live. J'ai ajuste les poids des forces, les vitesses ennemies, les rayons de detection et les limites de spawn jusqu'a obtenir un equilibre entre challenge et jouabilite. Le fait de pouvoir modifier les parametres en direct a vraiment aide a affiner la difficulte sans casser le rythme de test.

Les principales difficultes ont ete:
- maintenir une architecture propre tout en ajoutant plusieurs mecaniques (nitro, armure, eclair, medkit, boss);
- eviter les regressions quand on modifie le HUD et les interactions;
- conserver des comportements emergents credibles sans transformer la logique en scripts rigides.

Pour resoudre ces points, j'ai garde une separation stricte entre orchestration (`src/systems/game.js`), presentation (`src/systems/ui.js`/`src/systems/hud.js`) et comportements (`Vehicle` + `BehaviorManager` + sous-classes). Cette organisation m'a permis d'ajouter des features sans perdre la coherence globale du projet.

## IDE et IA

- IDE utilise: Visual Studio Code
- Assistant IA utilise: GitHub Copilot (modele GPT-5.3-Codex)

## Fichiers Markdown utilises pour l'assistance IA

- `instruction.md`
