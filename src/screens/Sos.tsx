import { useRef, useState } from 'react'
import { PhoneIcon } from '../Icons'
import { go } from '../lib/router'
import { addSosNote, deleteSosNote, useData } from '../lib/store'
import Breathing from './Breathing'

export const HELPLINES = [
  { num: '107', name: 'Télé-Accueil', info: 'Belgique · gratuit · anonyme · 24h/24' },
  { num: '3114', name: 'Prévention suicide', info: 'France · gratuit · 24h/24' },
  { num: '112', name: 'Urgences', info: 'Si tu es en danger maintenant' },
]

function Helplines() {
  return (
    <section className="stack tight">
      {HELPLINES.map((h) => (
        <a key={h.num} className="helpline" href={`tel:${h.num}`}>
          <span className="helpline-num">{h.num}</span>
          <span className="helpline-txt">
            <b>{h.name}</b>
            <small>{h.info}</small>
          </span>
          <PhoneIcon />
        </a>
      ))}
    </section>
  )
}

function Write() {
  const { sosNotes } = useData()
  const [text, setText] = useState('')
  const [after, setAfter] = useState<'kept' | 'released' | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const has = text.trim().length > 0

  return (
    <section className="card" id="ecrire">
      <h3>Écris ce que tu ressens</h3>
      <p className="muted small">
        Sans filtre, sans faute à corriger. Personne ne le lira. Rien ne quitte ce téléphone.
      </p>
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          setAfter(null)
        }}
        placeholder="Là, maintenant, je ressens…"
        rows={6}
      />
      {has && (
        <div className="btn-row">
          <button
            className="btn secondary"
            onClick={() => {
              setText('')
              setAfter('released')
            }}
          >
            Effacer, c’est sorti
          </button>
          <button
            className="btn primary"
            onClick={() => {
              addSosNote(text.trim())
              setText('')
              setAfter('kept')
            }}
          >
            Garder
          </button>
        </div>
      )}
      {after === 'released' && <p className="muted small">C’est sorti de ta tête. C’est déjà ça.</p>}
      {after === 'kept' && <p className="muted small">Gardé ici, rien que pour toi.</p>}

      {sosNotes.length > 0 && (
        <details className="help">
          <summary>
            Ce que tu as gardé ({sosNotes.length})
          </summary>
          <div className="stack tight notes">
            {sosNotes.map((n) => (
              <article key={n.id} className="proof-item">
                <small>
                  {new Date(n.at).toLocaleString('fr-BE', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                </small>
                <p className="note-text">{n.text}</p>
                {confirmId === n.id ? (
                  <div className="btn-row">
                    <button className="btn ghost small-btn" onClick={() => setConfirmId(null)}>
                      Annuler
                    </button>
                    <button className="btn danger small-btn" onClick={() => deleteSosNote(n.id)}>
                      Supprimer
                    </button>
                  </div>
                ) : (
                  <button className="link" onClick={() => setConfirmId(n.id)}>
                    Supprimer
                  </button>
                )}
              </article>
            ))}
          </div>
        </details>
      )}
    </section>
  )
}

export default function Sos() {
  const writeRef = useRef<HTMLDivElement>(null)

  return (
    <div className="stack">
      <section className="hero">
        <h2>Tu n'es pas seul.</h2>
        <p className="muted">
          Si c'est trop lourd en ce moment, appelle. Des gens sont là pour écouter, sans juger.
        </p>
      </section>

      <Helplines />

      <Breathing onWrite={() => writeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })} />

      <div ref={writeRef} className="scroll-target">
        <Write />
      </div>

      <section className="card">
        <h3>Parler au Confident</h3>
        <p className="muted small">Il t'écoute et t'aide à y voir plus clair. Ce n'est pas un psy, mais il est là.</p>
        <button className="btn secondary" onClick={() => go('confident')}>
          Ouvrir le Confident
        </button>
      </section>

      <p className="muted small center">
        En danger maintenant ? Appelle le <a className="inline-tel" href="tel:112">112</a>. Besoin de parler ?
        Le <a className="inline-tel" href="tel:107">107</a>, gratuit et anonyme.
      </p>
    </div>
  )
}
