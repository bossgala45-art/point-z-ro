import { useState } from 'react'
import { updateSettings, useData } from '../lib/store'
import { icsPath, REMINDERS, slot, type ReminderKind } from '../shared/reminders'

const KINDS: { kind: ReminderKind; key: 'morning' | 'noon' | 'evening' }[] = [
  { kind: 'matin', key: 'morning' },
  { kind: 'midi', key: 'noon' },
  { kind: 'soir', key: 'evening' },
]

const ALARM_LABEL = REMINDERS.matin.title

function pretty(time: string): string {
  return time.replace(':', ' h ')
}

export default function Reminders() {
  const { settings } = useData()
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(ALARM_LABEL)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Pas grave : le texte est affiché, il peut le recopier.
    }
  }

  const markAdded = (kind: ReminderKind, time: string) =>
    updateSettings({ calendar: { ...settings.calendar, [kind]: slot(time) } })

  return (
    <div className="stack">
      <section className="card">
        <h3>Comment ça marche</h3>
        <p className="muted small">
          Sur iPhone, une web app ne peut pas sonner toute seule à une heure précise. Alors on utilise ce
          qui marche à coup sûr : l'<b>Horloge</b> pour te réveiller, et le <b>Calendrier</b> pour les
          trois rappels. Une fois réglés, ils marchent même si Point Zéro est fermé.
        </p>
      </section>

      <section className={settings.alarmSet ? 'card done-card' : 'card'}>
        <div className="card-head">
          <h3>1. Ton réveil</h3>
          {settings.alarmSet && <span className="badge">Fait</span>}
        </div>
        <p className="muted small">Le plus important. Une alarme sonne même en mode silencieux.</p>
        <ol className="steps">
          <li>
            Ouvre l'appli <b>Horloge</b>, onglet <b>Alarmes</b>, puis touche <b>+</b>.
          </li>
          <li>
            Règle <b>{pretty(settings.reminders.morning)}</b>. Dans <b>Répéter</b>, choisis tes jours de cours.
          </li>
          <li>
            Dans <b>Libellé</b>, colle ce texte :
            <span className="quote">« {ALARM_LABEL} »</span>
            <button className="btn ghost small-btn" onClick={copy}>
              {copied ? 'Copié ✓' : 'Copier le texte'}
            </button>
          </li>
          <li>
            Touche <b>Enregistrer</b>.
          </li>
        </ol>
        <p className="muted small">
          Astuce : pose le téléphone loin du lit. Pour éteindre l'alarme, tu devras te lever. C'est déjà
          ta première mission.
        </p>
        <button className={settings.alarmSet ? 'btn secondary' : 'btn primary'} onClick={() => updateSettings({ alarmSet: !settings.alarmSet })}>
          {settings.alarmSet ? 'Alarme réglée ✓' : 'C’est fait, mon alarme est réglée'}
        </button>
      </section>

      <section className="card">
        <h3>2. Tes 3 rappels dans le Calendrier</h3>
        <p className="muted small">
          Touche <b>Ajouter</b> : ton iPhone ouvre le rappel. Touche <b>« Ajouter tout »</b> (ou « Ajouter
          au calendrier »), puis reviens ici avec <b>OK</b> ou <b>Terminé</b>.
        </p>

        <div className="stack tight">
          {KINDS.map(({ kind, key }) => {
            const time = settings.reminders[key]
            const added = settings.calendar[kind]
            const changed = added !== undefined && added !== slot(time)
            return (
              <div key={kind} className={added && !changed ? 'reminder-row added' : 'reminder-row'}>
                <div className="reminder-txt">
                  <span className="reminder-head">
                    <b>{REMINDERS[kind].label}</b> <span className="muted">· {pretty(time)}</span>
                  </span>
                  <small>{REMINDERS[kind].title}</small>
                  {changed && (
                    <small className="warn-txt">
                      Tu as changé l'heure. Supprime l'ancien rappel dans Calendrier, puis ajoute le nouveau.
                    </small>
                  )}
                </div>
                <a
                  className={added && !changed ? 'btn secondary' : 'btn primary'}
                  href={icsPath(kind, time)}
                  target="_blank"
                  rel="noopener"
                  onClick={() => markAdded(kind, time)}
                >
                  {added && !changed ? 'Ajouté ✓' : 'Ajouter'}
                </a>
              </div>
            )
          })}
        </div>

        <details className="help">
          <summary>Ça ne marche pas ?</summary>
          <ul>
            <li>
              Si rien ne s'ouvre, ouvre <b>bossgala45-art.github.io/point-z-ro</b> dans <b>Safari</b>, va dans
              Réglages → Mes rappels, et réessaie depuis là.
            </li>
            <li>
              Pas de notification ? Sur ton iPhone : <b>Réglages → Notifications → Calendrier</b>, active
              « Autoriser les notifications ».
            </li>
            <li>
              Le mode <b>Concentration Sommeil</b> peut cacher le rappel du soir. Règle son heure après
              ton rappel, ou autorise le Calendrier dedans.
            </li>
            <li>
              Pour supprimer un rappel : dans Calendrier, touche l'événement → <b>Supprimer l'événement</b> →
              « Supprimer tous les événements futurs ».
            </li>
          </ul>
        </details>
      </section>

      <section className="card">
        <h3>3. Dans l'appli</h3>
        <p className="muted small">
          Le soir, ton bilan passe en premier sur l'écran Aujourd'hui. Le rappel du soir ouvre directement
          ton bilan si tu touches le lien dans l'événement.
        </p>
      </section>

      <p className="fine center">
        Les heures se règlent dans Réglages → Rappels (par tranches de 5 minutes).
      </p>
    </div>
  )
}
