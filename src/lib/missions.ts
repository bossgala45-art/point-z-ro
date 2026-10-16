export type Phase = 1 | 2 | 3

export interface Mission {
  id: string
  title: string
  hint?: string
  phase: Phase
  /** Absent = tous les jours. Sinon, nombre de fois par semaine. */
  perWeek?: number
}

export const PHASES: Record<Phase, { name: string; tagline: string }> = {
  1: { name: 'Fondations', tagline: 'Dormir, te lever, manger. La base.' },
  2: { name: 'Construire', tagline: 'Tu ajoutes du sport, des révisions, de l’ordre.' },
  3: { name: 'Accélérer', tagline: 'Tu prépares la suite : job, projet, liberté.' },
}

// « {coucher} » est remplacé par ton heure de coucher (Réglages).
export const DEFAULT_MISSIONS: Mission[] = [
  { id: 'phone', phase: 1, title: 'Téléphone loin du lit à {coucher}', hint: 'Le réveil aussi.' },
  { id: 'school', phase: 1, title: 'Me lever et aller en cours' },
  { id: 'breakfast', phase: 1, title: 'Manger quelque chose le matin', hint: 'Même dans le bus.' },
  { id: 'gym', phase: 2, title: 'Salle de sport', hint: 'En plus du basket.', perWeek: 2 },
  { id: 'revise', phase: 2, title: '20 min de révision' },
  { id: 'tidy', phase: 2, title: 'Ranger mon coin de chambre', hint: '5 minutes, pas plus.' },
  { id: 'puff', phase: 3, title: 'Réduire la puff', hint: 'À ton rythme. Tu choisis.' },
  { id: 'job', phase: 3, title: 'Une étape pour le job étudiant', hint: 'CV, puis 1 candidature.', perWeek: 1 },
  { id: 'business', phase: 3, title: '30 min sur mon projet business' },
]

export function missionTitle(m: Mission, bedtime: string): string {
  return m.title.replace('{coucher}', bedtime.replace(':', '\u00a0h\u00a0'))
}

/** Les missions actives : celles de ta phase et des phases d'avant. */
export function activeMissions(missions: Mission[], phase: Phase): Mission[] {
  return missions.filter((m) => m.phase <= phase)
}

export function newMissionId(): string {
  return 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}
