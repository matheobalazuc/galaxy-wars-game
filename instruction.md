# Galaxy Wars - Cahier de specifications

## 1. Objectif
Ce document definit les contraintes et specifications.

Le titre visible du jeu est Galaxy Wars.
Le projet repose sur p5.js, une architecture POO, et les steering behaviors.

## 2. Contraintes non negociables

1. Ne jamais modifier GAME/lib/core/vehicules.js.
2. Toujours reutiliser Vehicle pour les entites animees.
3. Tous les objets animes sont des sous-classes de Vehicle.
4. Tous les comportements de base restent dans Vehicle.
5. Les sous-classes ne doivent contenir que:
- comportements personnalises,
- compositions de comportements,
- regles gameplay specifiques.
6. Utiliser plusieurs steering behaviors combines (pas de logique monolithique).
7. Concevoir et utiliser un BehaviorManager avec au minimum:
- ajout/suppression de comportements,
- activation/desactivation de comportements,
- gestion des poids,
- execution et somme des forces,
- sauvegarde/chargement de profils complexes,
- et Vehicle doit avoir par defaut une propriete de ce type.
8. Ne pas introduire de moteur physique externe.
9. Ne pas casser les controles, ecrans UI et raccourcis clavier existants.
10. Ne pas supprimer de fonctionnalites sans demande explicite.

## 3. Stack

- p5.js
- JavaScript ES6+
- HTML/CSS

## 4. Arborescence cible

- GAME/index.html
- GAME/css/style.css
- GAME/lib/core/vehicules.js (fichier moteur immuable)
- GAME/lib/vendor/p5.min.js
- GAME/lib/vendor/p5.sound.min.js
- GAME/src/core/config.js
- GAME/src/core/behaviorManager.js
- GAME/src/entities/player.js
- GAME/src/entities/enemy.js
- GAME/src/entities/obstacle.js
- GAME/src/entities/coin.js
- GAME/src/entities/medkitPickup.js
- GAME/src/entities/shockPickup.js
- GAME/src/entities/missile.js
- GAME/src/entities/enemyProjectile.js
- GAME/src/entities/explosion.js
- GAME/src/systems/hud.js
- GAME/src/systems/debug.js
- GAME/src/systems/ui.js
- GAME/src/systems/game.js
- GAME/src/systems/sketch.js

## 5. Etats du jeu

Etats obligatoires:
- MENU
- INTRO
- PLAYING
- PAUSED
- LEVELCLEAR
- VICTORY
- GAMEOVER

## 6. Niveaux (etat actuel)

Le jeu a 3 niveaux avec themes visuels differents.

### Niveau 1
- label: Niveau 1
- difficulte: Facile
- ennemis: 2
- objectif kills: 2

### Niveau 2
- label: Niveau 2
- difficulte: Moyen
- ennemis: 3
- objectif kills: 3

### Niveau 3
- label: Niveau 3
- difficulte: Difficile
- ennemis: 2 + 1 boss
- objectif kills: 3
- badge menu: Boss final

## 7. Commandes obligatoires

- Deplacement: souris + fleches
- Tir: clic gauche maintenu (mitraillette)
- Nitro: Espace maintenu
- Pause/reprendre: P
- Relancer niveau courant: R
- Retour menu principal: H
- Debug on/off: D
- Retour menu depuis ecrans: ESC

## 8. Gameplay obligatoire

### 8.1 Joueur
- Vie max: 6
- Barre de vie coloree
- Nitro avec jauge et regen
- Armure avec barre separee
- Flash visuel quand l'eclair est actif

### 8.2 Mitraillette
- Tir en continu si clic maintenu
- Jauge jaune dediee
- consommation par balle + recharge dans le temps

### 8.3 Pieces et armure
- Pieces spawn aleatoirement
- collecte de pieces
- armure gagnee apres seuil (armorThreshold)
- armure absorbe les degats avant la vie

### 8.4 Eclair
- Eclair actif sur les 3 niveaux (y compris niveau 1)
- pickup eclair avec spawn limite
- effet au contact ennemi:
- gros degats proportionnels a la vie max ennemie,
- pas de perte de vie joueur,
- pouvoir consomme.
- protection anti-perte de vie immediate en chaines de contact

### 8.5 Ennemis
- steering compose (seek, arrive, wander, avoid, separation, bounds)
- detection, poursuite, evitement obstacles
- tiers de difficulte
- tirs ennemis sur niveaux avances
- barre de vie ennemis

### 8.6 Boss
- present au niveau 3
- stats/visuel differencies
- label BOSS au-dessus du boss

### 8.7 Obstacles et medkit
- obstacles style asteroides
- un seul obstacle special mobile a la fois
- seul obstacle special destructible
- destruction obstacle special -> spawn medkit (croix)
- medkit regenere la vie du joueur

## 9. HUD obligatoire

Le HUD affiche:
- score
- temps
- ennemis niveau / tues
- pieces
- vie
- nitro
- mitraillette
- armure
- statut eclair

Le HUD contient des icones ? cliquables pour:
- nitro
- mitraillette
- armure
- eclair

Chaque ? ouvre une aide courte (description + activation).

## 10. Interface et ecrans

### 10.1 Menu principal
- cartes de niveaux cliquables
- objectif par niveau
- difficulte par niveau
- meilleur score par niveau
- badge boss final niveau 3
- toggle debug

### 10.2 Intro niveau
- titre niveau
- texte mission
- texte objectif (avec difficulte et boss final si present)
- bouton commencer

### 10.3 Pause
- recap commandes en cartes visuelles
- boutons: reprendre, rejouer, menu

### 10.4 Fin de partie
- ecran level clear
- ecran victory
- ecran game over

## 11. Reglages live

Sliders en temps reel pendant la partie:
- vitesse ennemis
- rayon detection ennemis
- nombre obstacles
- poids evitement
- poids poursuite
- poids errance
- poids arrivee
- vitesse joueur

Les changements doivent s'appliquer en direct, sans restart.

## 12. Debug

Debug activable via touche D et toggle UI.
Le debug doit rester disponible pour le joueur et les ennemis.

## 13. Persistance

Conserver via localStorage:
- meilleurs scores par niveau
- progression de niveau

## 14. Ordre de chargement scripts

Ordre critique dans index.html:
1. lib/core/vehicules.js
2. src/core/config.js
3. src/core/behaviorManager.js
4. entites (src/entities/obstacle.js, coin.js, medkitPickup.js, shockPickup.js, player.js, enemy.js, enemyProjectile.js, missile.js, explosion.js)
5. systems (src/systems/hud.js, debug.js, ui.js)
6. src/systems/game.js
7. src/systems/sketch.js

## 15. Livrables docs obligatoires

Le projet final doit conserver:
- README.md
- section MON EXPERIENCE
- modele(s) IA utilises
- IDE utilise
- lien de demo (GitHub Pages ou itch.io)
- fichiers d'instructions IA (instruction.md, .github/copilot-instructions.md, etc.)

## 16. Checklist de validation finale

Le rendu est conforme seulement si:

1. vehicules.js est intact.
2. Toutes les entites animees derivent de Vehicle.
3. Steering behaviors multiples reels (pas scripts directs de position).
4. BehaviorManager present et operationnel (add/remove/enable/disable/weights/save/load).
5. Les 3 niveaux sont jouables avec leurs objectifs.
6. L'eclair fonctionne aussi au niveau 1.
7. Le boss final est present au niveau 3 avec label BOSS.
8. HUD complet + aides ? cliquables.
9. Sliders live fonctionnent en direct.
10. Raccourcis et controles clavier/souris sont respectes.
11. Pieces, armure, missiles, medkit, obstacle special fonctionnent.
12. Aucun contournement des contraintes POO et de Vehicle.

## 17. Interdictions explicites

- Interdit de modifier GAME/lib/core/vehicules.js.
- Interdit de remplacer les steering behaviors par du deplacement script direct.
- Interdit de fusionner toute la logique IA dans une fonction unique non reutilisable.
- Interdit de retirer des features existantes sans demande explicite.
