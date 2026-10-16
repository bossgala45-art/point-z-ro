# Point Zéro

Appli personnelle de reconstruction (sommeil, école, sport, discipline, moral),
sous forme de web app installable (PWA) en React + TypeScript.

- Adresse : https://bossgala45-art.github.io/point-z-ro/
- Toutes les données restent dans le téléphone (stockage local du navigateur).
  Rien n'est envoyé sur Internet.
- Chaque modification poussée sur `main` est publiée automatiquement par GitHub Actions.

## Ce que fait l'appli

- **Aujourd'hui** : missions de la phase en cours, défi du jour (47 défis), série, joker, niveau.
- **Bilan du soir** : humeur, énergie, stress, missions tenues, une réussite du jour.
- **Progression** : phase et bons jours (2 missions sur 3, 10 jours sur 14 pour débloquer
  la suite), moi au jour 1 / moi aujourd'hui, missions par semaine, courbes sur 7 et 30 jours.
- **Carnet de preuves** : toutes les réussites, et une preuve au hasard pour les mauvais jours.
- **SOS** : numéros d'aide (107, 3114, 112), respiration 4-7-8, écriture privée.
- **Rappels** : alarme dans l'Horloge et 3 rappels quotidiens dans le Calendrier de l'iPhone
  (fichiers `.ics` générés à la construction dans `rappels/`).
- **Réglages** : prénom, horaires, missions, code PIN, sauvegarde / restauration, export texte,
  tout effacer.

La journée se termine à 4 h du matin : un bilan fait à 0 h 30 compte pour la veille.

## Développement

```sh
npm install
npm run dev        # serveur local
npm run typecheck  # vérification TypeScript
npm run build      # version de production dans dist/
```

## Étapes

1. ✅ Structure, navigation, design et Réglages
2. ✅ Aujourd'hui, missions et bilan du soir
3. ✅ Progression et graphiques
4. ✅ Carnet de preuves, défis, XP, séries et jokers
5. ✅ Rappels
6. ✅ SOS
7. ⏸️ Le Confident (reporté)
8. ✅ Code PIN, export, finitions
