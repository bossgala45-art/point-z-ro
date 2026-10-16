import { updateSettings, useData, type Settings } from '../lib/store'
import { go } from '../lib/router'
import InstallHelp from './InstallHelp'
import PinSettings from './PinSettings'
import DataSettings from './DataSettings'

function TimeField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="row-field">
      <span>{label}</span>
      <input type="time" step={300} value={value} onChange={(e) => e.target.value && onChange(e.target.value)} />
    </label>
  )
}

export default function SettingsScreen() {
  const { settings } = useData()

  const setReminder = (k: keyof Settings['reminders'], v: string) =>
    updateSettings({ reminders: { ...settings.reminders, [k]: v } })

  return (
    <div className="stack">
      <p className="muted small">Tout s'enregistre automatiquement, sur ce téléphone uniquement.</p>

      <section className="card">
        <h3>Toi</h3>
        <label className="field">
          <span>Prénom</span>
          <input
            value={settings.firstName}
            onChange={(e) => updateSettings({ firstName: e.target.value })}
            onBlur={(e) => !e.target.value.trim() && updateSettings({ firstName: 'toi' })}
            maxLength={30}
          />
        </label>
      </section>

      <section className="card">
        <h3>Ton rythme</h3>
        <TimeField label="Coucher" value={settings.bedtime} onChange={(v) => updateSettings({ bedtime: v })} />
        <TimeField label="Lever" value={settings.wakeTime} onChange={(v) => updateSettings({ wakeTime: v })} />
      </section>

      <section className="card">
        <h3>Rappels</h3>
        <TimeField label="Matin" value={settings.reminders.morning} onChange={(v) => setReminder('morning', v)} />
        <TimeField label="Midi" value={settings.reminders.noon} onChange={(v) => setReminder('noon', v)} />
        <TimeField label="Soir" value={settings.reminders.evening} onChange={(v) => setReminder('evening', v)} />
        <button className="btn secondary" onClick={() => go('rappels')}>
          Activer mes rappels sur l'iPhone ›
        </button>
      </section>

      <button className="card nav-card" onClick={() => go('missions')}>
        <span>
          <h3>Missions</h3>
          <span className="muted small">Modifier, ajouter ou retirer tes missions.</span>
        </span>
        <span className="muted" aria-hidden>
          ›
        </span>
      </button>

      <PinSettings />

      <section className="card soon">
        <h3>Le Confident</h3>
        <p className="muted small">
          Pas encore activé. Quand on le construira, c'est ici que tu mettras ta clé API.
        </p>
      </section>

      <InstallHelp />

      <DataSettings />

      <p className="fine center">Point Zéro · v1.0</p>
    </div>
  )
}
