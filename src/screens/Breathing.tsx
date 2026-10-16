import { useEffect, useRef, useState } from 'react'

// Respiration 4-7-8 : inspirer 4 s, retenir 7 s, expirer 8 s.
const PHASES = [
  { name: 'Inspire', hint: 'par le nez, doucement', seconds: 4, scale: 1 },
  { name: 'Retiens', hint: 'garde l’air, sans forcer', seconds: 7, scale: 1 },
  { name: 'Expire', hint: 'lentement, par la bouche', seconds: 8, scale: 0.55 },
] as const

const CYCLES = 4

export default function Breathing({ onWrite }: { onWrite: () => void }) {
  const [running, setRunning] = useState(false)
  const [phase, setPhase] = useState(0)
  const [left, setLeft] = useState<number>(PHASES[0].seconds)
  const [cycle, setCycle] = useState(1)
  const [finished, setFinished] = useState(false)
  const cardRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!running) return
    const t = window.setTimeout(() => {
      if (left > 1) {
        setLeft(left - 1)
        return
      }
      const next = (phase + 1) % PHASES.length
      if (next === 0) {
        if (cycle >= CYCLES) {
          setRunning(false)
          setFinished(true)
          setPhase(0)
          setLeft(PHASES[0].seconds)
          return
        }
        setCycle(cycle + 1)
      }
      setPhase(next)
      setLeft(PHASES[next].seconds)
    }, 1000)
    return () => window.clearTimeout(t)
  }, [running, phase, left, cycle])

  const start = () => {
    setPhase(0)
    setLeft(PHASES[0].seconds)
    setCycle(1)
    setFinished(false)
    setRunning(true)
    // Le cercle entier à l'écran pendant l'exercice.
    cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const stop = () => {
    setRunning(false)
    setPhase(0)
    setLeft(PHASES[0].seconds)
  }

  const p = PHASES[phase]
  // Le cercle grandit pendant l'inspiration, reste plein pendant la rétention, rétrécit à l'expiration.
  const scale = running ? p.scale : 0.55
  const duration = running && phase !== 1 ? p.seconds : 0.6

  return (
    <section className="card breathing" ref={cardRef}>
      <div className="card-head">
        <h3>Respirer · 4-7-8</h3>
        {running && (
          <span className="muted small">
            Cycle {cycle}/{CYCLES}
          </span>
        )}
      </div>

      <div className="breath-stage" aria-live="polite">
        <div
          className="breath-circle"
          style={{ transform: `scale(${scale})`, transitionDuration: `${duration}s` }}
          aria-hidden
        />
        <div className="breath-label">
          {running ? (
            <>
              <b>{p.name}</b>
              <span className="breath-count">{left}</span>
              <small>{p.hint}</small>
            </>
          ) : finished ? (
            <>
              <b>Bien.</b>
              <small>Comment tu te sens ?</small>
            </>
          ) : (
            <>
              <b>Prêt ?</b>
              <small>4 cycles · environ 1 min 20</small>
            </>
          )}
        </div>
      </div>

      {running ? (
        <button className="btn ghost" onClick={stop}>
          Arrêter
        </button>
      ) : finished ? (
        <div className="btn-row">
          <button className="btn secondary" onClick={start}>
            Encore 4 cycles
          </button>
          <button className="btn primary" onClick={onWrite}>
            Écrire
          </button>
        </div>
      ) : (
        <button className="btn primary big" onClick={start}>
          Commencer
        </button>
      )}
      <p className="fine">Si retenir 7 secondes est trop long, retiens moins. Pas de pression.</p>
    </section>
  )
}
