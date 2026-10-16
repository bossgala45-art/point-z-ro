// Partagé entre l'appli et la construction du site (vite.config.ts).
// Les fichiers .ics des rappels sont générés une fois pour toutes,
// toutes les 5 minutes de la journée, pour que l'iPhone puisse les ouvrir
// comme de vrais fichiers de calendrier.

export type ReminderKind = 'matin' | 'midi' | 'soir'

export const REMINDERS: Record<ReminderKind, { label: string; title: string; note: string; path: string }> = {
  matin: {
    label: 'Matin',
    title: 'Debout. Une seule chose : te lever.',
    note: 'Point Zéro · ta seule mission maintenant, c’est de sortir du lit.',
    path: 'aujourdhui',
  },
  midi: {
    label: 'Midi',
    title: 'Ton défi du jour t’attend. 5 minutes, c’est tout.',
    note: 'Point Zéro · ouvre l’appli pour voir ton défi.',
    path: 'aujourdhui',
  },
  soir: {
    label: 'Soir',
    title: 'Bientôt l’heure : téléphone loin du lit. Fais ton bilan avant.',
    note: 'Point Zéro · 2 minutes de bilan, puis le téléphone loin du lit (le réveil aussi).',
    path: 'bilan',
  },
}

/** Arrondit "HH:MM" aux 5 minutes, au format "HHMM". */
export function slot(time: string): string {
  const [h, m] = time.split(':').map(Number)
  let total = Math.round((h * 60 + m) / 5) * 5
  if (total >= 24 * 60) total -= 5
  return String(Math.floor(total / 60)).padStart(2, '0') + String(total % 60).padStart(2, '0')
}

export function icsPath(kind: ReminderKind, time: string): string {
  return `rappels/${kind}-${slot(time)}.ics`
}

function escape(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

/** Coupe les lignes trop longues comme le veut le format iCalendar (75 octets max). */
function fold(line: string): string {
  const enc = new TextEncoder()
  const out: string[] = []
  let cur = ''
  for (const ch of line) {
    if (enc.encode(cur + ch).length > (out.length ? 74 : 75)) {
      out.push(cur)
      cur = ''
    }
    cur += ch
  }
  out.push(cur)
  return out.join('\r\n ')
}

/** Un événement quotidien de 5 minutes, avec une alerte à l'heure pile. Heure locale du téléphone. */
export function buildIcs(kind: ReminderKind, hhmm: string, appUrl: string): string {
  const r = REMINDERS[kind]
  const end = (() => {
    const t = Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(2)) + 5
    const capped = Math.min(t, 23 * 60 + 59)
    return String(Math.floor(capped / 60)).padStart(2, '0') + String(capped % 60).padStart(2, '0')
  })()
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Point Zero//Rappels//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:pointzero-${kind}@point-zero`,
    'DTSTAMP:20260101T000000Z',
    `DTSTART:20260101T${hhmm}00`,
    `DTEND:20260101T${end}00`,
    'RRULE:FREQ=DAILY',
    `SUMMARY:${escape(r.title)}`,
    `DESCRIPTION:${escape(r.note)}`,
    `URL:${appUrl}#/${r.path}`,
    'TRANSP:TRANSPARENT',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escape(r.title)}`,
    'TRIGGER:PT0M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .map(fold)
    .join('\r\n') + '\r\n'
}
