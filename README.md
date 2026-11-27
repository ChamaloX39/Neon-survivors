# NEON SURVIVORS — RPG Roguelite 3D (prototype v0.1)

Prototype mobile jouable en navigateur, prévu pour être publié sur GitHub Pages et ajouté à l'écran d'accueil d'un iPhone.

## Fonctionnalités du prototype
- Scène 3D procédurale Three.js : arène industrielle, couloirs, caisses, éclairages et robot assemblé en géométrie.
- Joystick tactile, déplacement, esquive et compétence d'impulsion.
- Attaque automatique sur la cible la plus proche, projectiles, dégâts flottants et ennemis.
- XP, niveaux et choix d'améliorations.
- Butin aléatoire avec cinq raretés, inventaire, emplacements d'équipement et statistiques.
- Sauvegarde locale de la progression via localStorage.

## Lancer
Le jeu utilise Three.js depuis jsDelivr. Il doit être servi en HTTP(S), pas ouvert comme un fichier local.

1. Publier les fichiers à la racine d'un dépôt GitHub.
2. Settings → Pages → Deploy from a branch → `main` → `/ (root)`.
3. Ouvrir l'URL GitHub Pages dans Safari.
4. Partager → Sur l'écran d'accueil pour l'installer comme web app.

## Contrôles
- Joystick gauche : déplacement.
- Attaque : automatique vers l'ennemi le plus proche.
- ⚡ : esquive.
- ✦ : impulsion de zone.
- Icône en haut : inventaire et équipement.

## Limites connues de v0.1
Ceci est un prototype de validation technique, pas un jeu commercial fini. Les personnages et décors sont provisoirement construits avec des formes procédurales ; les animations, collisions avancées, navigation de donjon, vrais modèles GLB, audio, sauvegarde cloud, boutique et achats intégrés restent à développer. Le rendu 3D dépend du chargement de Three.js depuis le CDN.

## Feuille de route
- v0.2 : contrôles et caméra mobiles affinés, collisions, salles/couloirs connectés, interface inventaire améliorée.
- v0.3 : modèles GLB originaux, animations, VFX, sons et boss.
- v0.4 : génération de donjons, tables de loot, affixes, sets d'équipement et arbre de compétences.
- v0.5 : sauvegarde cloud, équilibrage, analytics respectueux de la vie privée et tests appareils.
- v1.0 : monétisation éthique, conformité stores, QA et publication native éventuelle.

## Budget
Le prototype n'utilise pas de service payant. Pour une version commerciale, prévoir ultérieurement des coûts éventuels de création/achat d'assets, hébergement/backend, comptes développeur Apple/Google, tests et conformité.


## Publication iPhone simplifiée
Tous les fichiers de cette archive sont à la racine du dépôt : téléversez les fichiers sans créer de sous-dossiers. Remplacez index.html, manifest.webmanifest et sw.js existants, puis ajoutez les trois PNG.
