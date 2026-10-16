import { useState } from 'react'
import { checkPin, clearPin, setPin } from '../lib/pin'
import { useData } from '../lib/store'
import PinPad from './PinPad'

type Mode = 'idle' | 'new' | 'confirm' | 'verify-off' | 'verify-change'

export default function PinSettings() {
  const { settings } = useData()
  const hasPin = Boolean(settings.pinHash)
  const [mode, setMode] = useState<Mode>('idle')
  const [first, setFirst] = useState('')
  const [error, setError] = useState<string | undefined>()
  const [tries, setTries] = useState(0)
  const [msg, setMsg] = useState('')

  const fail = (text: string) => {
    setError(text)
    setTries((t) => t + 1)
  }

  const reset = (m: Mode = 'idle', message = '') => {
    setMode(m)
    setFirst('')
    setError(undefined)
    setMsg(message)
  }

  if (mode !== 'idle') {
    const pad =
      mode === 'new' ? (
        <PinPad key={`n${tries}`} title="Choisis un code" subtitle="4 chiffres, faciles à retenir pour toi." error={error} onComplete={(p) => { setFirst(p); setError(undefined); setMode('confirm') }} />
      ) : mode === 'confirm' ? (
        <PinPad
          key={`c${tries}`}
          title="Encore une fois"
          subtitle="Pour être sûr."
          error={error}
          onComplete={async (p) => {
            if (p !== first) {
              setFirst('')
              setMode('new')
              fail('Les deux codes sont différents. On recommence.')
              return
            }
            await setPin(p)
            reset('idle', 'Code activé. L’appli le demandera à chaque ouverture.')
          }}
        />
      ) : (
        <PinPad
          key={`v${tries}`}
          title="Ton code actuel"
          error={error}
          onComplete={async (p) => {
            if (!(await checkPin(p, settings.pinHash, settings.pinSalt))) return fail('Ce n’est pas le bon code.')
            if (mode === 'verify-off') {
              clearPin()
              reset('idle', 'Code désactivé.')
            } else reset('new')
          }}
        />
      )
    return (
      <section className="card">
        {pad}
        <button className="btn ghost" onClick={() => reset()}>
          Annuler
        </button>
      </section>
    )
  }

  return (
    <section className="card">
      <div className="card-head">
        <h3>Code PIN</h3>
        {hasPin && <span className="badge">Activé</span>}
      </div>
      <p className="muted small">
        {hasPin
          ? 'L’appli demande ton code à l’ouverture, et après 30 secondes en arrière-plan.'
          : 'Un code à 4 chiffres à l’ouverture, pour que personne ne lise tes bilans.'}
      </p>
      {msg && <p className="ok-line small">{msg}</p>}
      {hasPin ? (
        <div className="btn-row">
          <button className="btn ghost" onClick={() => reset('verify-off')}>
            Désactiver
          </button>
          <button className="btn secondary" onClick={() => reset('verify-change')}>
            Changer
          </button>
        </div>
      ) : (
        <button className="btn secondary" onClick={() => reset('new')}>
          Activer un code
        </button>
      )}
      {hasPin && <p className="fine">Si tu l’oublies, la seule solution sera de tout effacer. Fais une sauvegarde.</p>}
    </section>
  )
}
