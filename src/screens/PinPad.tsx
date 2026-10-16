import { useEffect, useState } from 'react'

export const PIN_LENGTH = 4

/** Clavier à gros boutons. Appelle onComplete quand les 4 chiffres sont tapés. */
export default function PinPad({
  title,
  subtitle,
  error,
  onComplete,
}: {
  title: string
  subtitle?: string
  error?: string
  onComplete: (pin: string) => void
}) {
  const [pin, setPin] = useState('')

  // On vide le code quand un message d'erreur arrive.
  useEffect(() => {
    if (error) setPin('')
  }, [error])

  const press = (d: string) => {
    if (pin.length >= PIN_LENGTH) return
    const next = pin + d
    setPin(next)
    if (next.length === PIN_LENGTH) {
      // Laisse le 4e point s'afficher une fraction de seconde.
      setTimeout(() => {
        onComplete(next)
        setPin('')
      }, 120)
    }
  }

  return (
    <div className="pinpad">
      <h2>{title}</h2>
      {subtitle && <p className="muted">{subtitle}</p>}
      <div className={error ? 'pin-dots shake' : 'pin-dots'} aria-label={`${pin.length} chiffres sur ${PIN_LENGTH}`}>
        {Array.from({ length: PIN_LENGTH }, (_, i) => (
          <span key={i} className={i < pin.length ? 'dot on' : 'dot'} />
        ))}
      </div>
      <p className="pin-error" role="alert">
        {error ?? ' '}
      </p>
      <div className="keys">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button key={d} className="key" onClick={() => press(d)}>
            {d}
          </button>
        ))}
        <span />
        <button className="key" onClick={() => press('0')}>
          0
        </button>
        <button className="key ghost-key" onClick={() => setPin(pin.slice(0, -1))} aria-label="Effacer un chiffre">
          ⌫
        </button>
      </div>
    </div>
  )
}
