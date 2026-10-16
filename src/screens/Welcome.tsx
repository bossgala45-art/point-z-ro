import { useState } from 'react'
import { currentDay } from '../lib/day'
import { update } from '../lib/store'
import InstallHelp from './InstallHelp'
import { isStandalone } from '../lib/install'

export default function Welcome() {
  const [name, setName] = useState('')
  const ok = name.trim().length > 0

  const start = () => {
    if (!ok) return
    update((d) => ({
      ...d,
      startDate: currentDay(),
      phaseStartDate: currentDay(),
      settings: { ...d.settings, firstName: name.trim() },
    }))
  }

  return (
    <div className="welcome">
      <div className="welcome-mark" aria-hidden>
        <span />
      </div>
      <h1>Point Zéro</h1>
      <p className="lead">
        Ici, on repart de zéro. Pas de jugement, pas de compte, pas de pression.
        Juste toi, un jour après l'autre.
      </p>

      {!isStandalone() && <InstallHelp compact />}

      <label className="field">
        <span>Comment tu t'appelles ?</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && start()}
          placeholder="Ton prénom"
          autoComplete="given-name"
          maxLength={30}
        />
      </label>

      <button className="btn primary big" disabled={!ok} onClick={start}>
        On commence
      </button>

      <p className="fine">Tout ce que tu écris reste sur ce téléphone.</p>
    </div>
  )
}
