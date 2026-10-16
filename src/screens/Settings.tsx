import { useState } from 'react'
import { eraseAll, updateSettings, useData, type Settings } from '../lib/store'
import { go } from '../lib/router'
import InstallHelp from './InstallHelp'

function TimeField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="row-field">
      <span>{label}</span>
      <input type="time" value={value} onChange={(e) => e.target.value && onChange(e.target.value)} />
    </label>
  )
}

export default function SettingsScreen() {
  const { settings } = useData()
  const [showKey, setShowKey] = useState(false)
  const [confirmErase, setConfirmErase] = useState(false)

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
        <p className="muted small">Les rappels s'activent à l'étape 5.</p>
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

      <section className="card">
        <h3>Clé API du Confident</h3>
        <p className="muted small">
          Pour parler au Confident (étape 7). Ta clé reste sur ce téléphone et sert seulement à
          contacter Claude.
        </p>
        <div className="key-row">
          <input
            type={showKey ? 'text' : 'password'}
            value={settings.apiKey}
            onChange={(e) => updateSettings({ apiKey: e.target.value.trim() })}
            placeholder="sk-ant-…"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          <button className="btn ghost" onClick={() => setShowKey((s) => !s)}>
            {showKey ? 'Cacher' : 'Voir'}
          </button>
        </div>
      </section>

      <section className="card soon">
        <h3>Code PIN et export</h3>
        <p className="muted small">Arrivent à l'étape 8.</p>
      </section>

      <InstallHelp />

      <section className="card danger-zone">
        <h3>Tout effacer</h3>
        {!confirmErase ? (
          <>
            <p className="muted small">Supprime toutes tes données de ce téléphone.</p>
            <button className="btn danger-outline" onClick={() => setConfirmErase(true)}>
              Tout effacer…
            </button>
          </>
        ) : (
          <>
            <p>Sûr ? Ça ne peut pas être annulé.</p>
            <div className="btn-row">
              <button className="btn ghost" onClick={() => setConfirmErase(false)}>
                Annuler
              </button>
              <button
                className="btn danger"
                onClick={() => {
                  eraseAll()
                  go('aujourdhui')
                }}
              >
                Oui, tout effacer
              </button>
            </div>
          </>
        )}
      </section>

      <p className="fine center">Point Zéro · étape 2</p>
    </div>
  )
}
