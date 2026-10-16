// Les défis du jour : 5 minutes maximum, faisables partout, sans matériel.
export interface Challenge {
  id: string
  text: string
}

const LIST = [
  ['pompes', '10 pompes. Sur les genoux, ça compte aussi.'],
  ['marche', 'Marcher 10 minutes sans ton téléphone.'],
  ['ecrire', 'Écrire 3 lignes sur ce que tu ressens aujourd’hui.'],
  ['gentil', 'Envoyer un message gentil à quelqu’un.'],
  ['eau', 'Boire un grand verre d’eau dès le réveil.'],
  ['album', 'Écouter un album en entier, sans scroller.'],
  ['squats', '20 squats, tranquille.'],
  ['gainage', '30 secondes de gainage. Puis encore 30 si tu peux.'],
  ['lit', 'Faire ton lit en rentrant ou en te levant.'],
  ['fenetre', 'Ouvrir la fenêtre et respirer 10 grandes fois.'],
  ['merci', 'Dire merci à quelqu’un, en vrai, en le regardant.'],
  ['gratitude', 'Noter 3 choses qui se sont bien passées, même petites.'],
  ['notifs', 'Couper les notifications d’une appli qui te vole du temps.'],
  ['tiktok', 'Une heure sans TikTok, Insta ni Snap. Juste une.'],
  ['ecran', 'Mettre ton écran en noir et blanc pour la soirée.'],
  ['sac', 'Préparer ton sac pour demain, ce soir.'],
  ['habits', 'Sortir tes habits de demain avant de dormir.'],
  ['rangement', 'Ranger 5 objets qui traînent.'],
  ['lecture', 'Lire 5 pages d’un livre (ou d’un article sérieux).'],
  ['podcast', 'Écouter 10 minutes d’un podcast sur l’entrepreneuriat.'],
  ['idee', 'Noter une idée de business, même nulle. Surtout si elle est nulle.'],
  ['probleme', 'Repérer un problème autour de toi que quelqu’un paierait pour régler.'],
  ['etirements', '5 minutes d’étirements.'],
  ['dribble', '5 minutes de dribble ou de tirs, si tu as un ballon sous la main.'],
  ['escaliers', 'Prendre les escaliers partout aujourd’hui.'],
  ['soleil', 'Aller dehors 5 minutes à la lumière du jour, sans écouteurs.'],
  ['fruit', 'Manger un fruit aujourd’hui.'],
  ['legumes', 'Mettre des légumes dans un de tes repas.'],
  ['douche', 'Finir ta douche par 15 secondes d’eau froide.'],
  ['ami', 'Prendre des nouvelles d’un pote que tu n’as pas vu depuis longtemps.'],
  ['famille', 'Poser une vraie question à quelqu’un de ta famille, et écouter.'],
  ['aide', 'Aider quelqu’un sans qu’il te le demande.'],
  ['respiration', '2 minutes de respiration lente : 4 secondes inspire, 6 expire.'],
  ['silence', '5 minutes assis sans rien faire. Juste regarder.'],
  ['playlist', 'Faire une playlist de 5 sons qui te donnent de l’énergie.'],
  ['photo', 'Prendre une photo d’un truc beau que tu vois aujourd’hui.'],
  ['cours', 'Relire tes notes du dernier cours pendant 5 minutes.'],
  ['question', 'Poser une question à un prof, même une petite.'],
  ['agenda', 'Écrire les 3 choses importantes de demain.'],
  ['desabonne', 'Te désabonner de 5 comptes qui te font te sentir nul.'],
  ['compliment', 'Te dire une chose que tu as bien faite cette semaine.'],
  ['ecran-avant', 'Pas de téléphone dans les 15 premières minutes après le réveil.'],
  ['citation', 'Écrire une phrase qui te motive et la mettre en fond d’écran.'],
  ['budget', 'Noter ce que tu as dépensé cette semaine.'],
  ['competence', 'Regarder un tuto de 5 minutes sur une compétence utile.'],
  ['posture', 'Te tenir droit, épaules en arrière, pendant 2 minutes. Respire.'],
  ['rire', 'Regarder un truc qui te fait vraiment rire, puis couper.'],
] as const

export const CHALLENGES: Challenge[] = LIST.map(([id, text]) => ({ id, text }))

function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Le défi d'un jour : toujours le même pour une date donnée, sauf si tu en demandes un autre. */
export function challengeFor(day: string, rerolls = 0): Challenge {
  return CHALLENGES[(hash(day) + rerolls * 17) % CHALLENGES.length]
}
