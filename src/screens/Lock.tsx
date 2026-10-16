import { useState } from 'react'
import { checkPin } from '../lib/pin'
import { eraseAll, useData } from '../lib/store'
import PinPad from './PinPad'

export default function Lock({ onUnlock }: { onUnlock: () => void }) {
  const { settings } = useData()
  const [error, setError] = useState<string | undefined>()
  const [tries, setTries] = useState(0)
  const [forgot, setForgot] = useState(false)

  if (forgot) {
    return (
      <div className="lock">
        <div className="pinpad">
          <h2>Code oublié ?</h2>
          <p className="muted">
            Ton code protège tes données, alors personne ne peut le retrouver, même pas moi. La seule
            solution : tout effacer et recommencer à zéro. Tes missions, bilans et preuves seront perdus.
          </p>
          <button className="btn secondary big" onClick={() => setForgot(false)}>
            Réessayer mon code
          </button>
          <button className="btn danger-outline" onClick={() => eraseAll()}>
            Tout effacer et recommencer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="lock">
      <div className="welcome-mark small-mark" aria-hidden>
        <span />
      </div>
      <PinPad
        key={tries}
        title="Point Zéro"
        subtitle="Entre ton code."
        error={error}
        onComplete={async (pin) => {
          if (await checkPin(pin, settings.pinHash, settings.pinSalt)) {
            setError(undefined)
            onUnlock()
          } else {
            setTries((t) => t + 1)
            setError(`Ce n’est pas le bon code.${tries >= 2 ? ' Prends ton temps.' : ''}`)
          }
        }}
      />
      <button className="link center" onClick={() => setForgot(true)}>
        Code oublié ?
      </button>
    </div>
  )
}
