import type { AppData } from './store'
import { parseDay } from './day'
import { missionTitle, PHASES } from './missions'
import { challengeFor } from './challenges'

function formatDay(key: string): string {
  return parseDay(key).toLocaleDateString('fr-BE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function stamp(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Tout, lisible par un humain. La clé API et le code PIN n'y sont jamais. */
export function textExport(data: AppData): string {
  const s = data.settings
  const L: string[] = []
  L.push(`POINT ZÉRO · export du ${formatDay(stamp())}`)
  L.push('Ce fichier contient tout ce que tu as écrit dans l’appli. Garde-le pour toi.')
  L.push('')
  L.push(`Prénom : ${s.firstName}`)
  L.push(`Jour 1 : ${formatDay(data.startDate)}`)
  L.push(`Phase actuelle : ${data.phase} (${PHASES[data.phase].name}), depuis le ${formatDay(data.phaseStartDate)}`)
  L.push(`Coucher ${s.bedtime} · Lever ${s.wakeTime}`)
  L.push('')

  L.push('== MES MISSIONS ==')
  for (const p of [1, 2, 3] as const) {
    L.push(`Phase ${p} · ${PHASES[p].name}`)
    for (const m of data.missions.filter((x) => x.phase === p)) {
      L.push(`  - ${missionTitle(m, s.bedtime)}${m.perWeek ? ` (${m.perWeek}×/semaine)` : ''}`)
    }
  }
  L.push('')

  const days = Object.keys(data.days).sort().reverse()
  L.push('== CARNET DE PREUVES ==')
  const proofs = days.filter((d) => data.days[d].checkin?.win)
  if (proofs.length === 0) L.push('(vide pour l’instant)')
  for (const d of proofs) L.push(`${formatDay(d)} : ${data.days[d].checkin!.win}`)
  L.push('')

  L.push('== MES JOURS ==')
  const names = new Map(data.missions.map((m) => [m.id, missionTitle(m, s.bedtime)]))
  for (const d of days) {
    const log = data.days[d]
    L.push(formatDay(d))
    if (log.done.length) L.push(`  Missions tenues : ${log.done.map((id) => names.get(id) ?? 'mission supprimée').join(', ')}`)
    if (log.checkin) {
      L.push(`  Humeur ${log.checkin.mood}/10 · Énergie ${log.checkin.energy}/10 · Stress ${log.checkin.stress}/10`)
      L.push(`  Réussite : ${log.checkin.win}`)
    }
    if (log.challenge?.done) L.push(`  Défi fait : ${challengeFor(d, log.challenge.rerolls).text}`)
  }
  L.push('')

  L.push('== ÉCRITS SOS GARDÉS ==')
  if (data.sosNotes.length === 0) L.push('(aucun)')
  for (const n of data.sosNotes) {
    L.push(new Date(n.at).toLocaleString('fr-BE'))
    L.push(n.text)
    L.push('')
  }
  return L.join('\n')
}

/** Sauvegarde complète, pour restaurer plus tard. Sans la clé API ni le code PIN. */
export function jsonBackup(data: AppData): string {
  const { apiKey: _a, pinHash: _h, pinSalt: _s, ...settings } = data.settings
  return JSON.stringify({ app: 'point-zero', exportedAt: new Date().toISOString(), data: { ...data, settings } }, null, 1)
}

export function parseBackup(text: string): Partial<AppData> {
  const parsed = JSON.parse(text)
  const data = parsed?.app === 'point-zero' ? parsed.data : null
  if (!data || typeof data !== 'object' || !data.startDate || typeof data.days !== 'object') {
    throw new Error('Ce fichier n’est pas une sauvegarde de Point Zéro.')
  }
  return data
}

/**
 * Donne le fichier à l'utilisateur. Sur iPhone : la feuille de partage
 * (« Enregistrer dans Fichiers », AirDrop, Mail…). Sinon : un téléchargement.
 */
export async function saveFile(name: string, content: string, type: string): Promise<'shared' | 'downloaded' | 'cancelled'> {
  const file = new File([content], name, { type })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: name })
      return 'shared'
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return 'cancelled'
      // Partage impossible : on tente le téléchargement.
    }
  }
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
  return 'downloaded'
}

export const exportNames = {
  text: () => `point-zero-${stamp()}.txt`,
  json: () => `point-zero-sauvegarde-${stamp()}.json`,
}
