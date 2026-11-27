# NEON SURVIVORS — prototype mobile

## Publication depuis un iPhone
1. Ouvre https://github.com dans Safari et connecte-toi.
2. Crée un dépôt public nommé `neon-survivors`.
3. Dans le dépôt, choisis **Add file → Upload files**.
4. Décompresse `neon-survivors-iphone.zip` dans l’app Fichiers, puis téléverse le contenu du dossier (index.html, manifest.webmanifest, sw.js et icons).
5. Valide avec **Commit changes**.
6. Dans **Settings → Pages**, sélectionne **Deploy from a branch**, branche `main`, dossier `/ (root)`, puis Save.
7. Attends la publication. Le lien sera `https://TON-PSEUDO.github.io/neon-survivors/`.

## Installation sur iPhone
1. Ouvre le lien publié dans Safari (pas dans un navigateur intégré).
2. Touche Partager → Sur l’écran d’accueil.
3. Active « Ouvrir comme app » si l’option apparaît, puis Ajouter.

## Notes
- Prototype autonome en WebGL, sans bibliothèque externe.
- Les pièces et éliminations sont sauvegardées localement sur l’appareil.
- La progression d’une partie est en mémoire et repart à zéro à la fin.
- Pour publier une mise à jour, remplace les fichiers du dépôt puis recharge le jeu.
- Il s’agit d’un prototype de test, pas encore d’une version App Store.
