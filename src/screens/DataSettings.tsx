import { useRef, useState } from 'react'
import { eraseAll, restore, snapshot, updateSettings, useData, type AppData } from '../lib/store'
import { exportNames, jsonBackup, parseBackup, saveFile, textExport } from '../lib/backup'
import { go } from '../lib/router'
import { formatDay, currentDay } from '../lib/day'

export default function DataSettings() {
  const { settings } = useData()
  const [confirmErase, setConfirmErase] = useState(false)
  const [pending, setPending] = useState<Partial<AppData> | null>(null)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const exportText = async () => {
    const r = await saveFile(exportNames.text(), textExport(snapshot()), 'text/plain')
    if (r !== 'cancelled') setMsg({ ok: true, text: 'Fichier texte prêt.' })
  }

  const exportJson = async () => {
    const r = await saveFile(exportNames.json(), jsonBackup(snapshot()), 'application/json')
    if (r !== 'cancelled') {
      updateSettings({ lastBackup: new Date().toISOString() })
      setMsg({ ok: true, text: 'Sauvegarde prête. Range-la dans Fichiers (iCloud Drive).' })
    }
  }

  const onFile = async (f: File | undefined) => {
    if (!f) return
    try {
      setPending(parseBackup(await f.text()))
      setMsg(null)
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error && e.message.includes('Point Zéro') ? e.message : 'Impossible de lire ce fichier.' })
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  const daysSince = settings.lastBackup
    ? Math.floor((Date.now() - new Date(settings.lastBackup).getTime()) / 86_400_000)
    : null

  return (
    <>
      <section className="card">
        <h3>Mes données</h3>
        <p className="muted small">
          Tout est dans ce téléphone. Si tu supprimes l'icône de l'écran d'accueil, tes données partent avec.
          Une sauvegarde de temps en temps, c'est une assurance.
        </p>
        <p className="small">
          Dernière sauvegarde :{' '}
          <b>
            {settings.lastBackup
              ? `${formatDay(currentDay(new Date(settings.lastBackup)))}${daysSince && daysSince > 14 ? ' · il serait temps d’en refaire une' : ''}`
              : 'jamais'}
          </b>
        </p>

        <button className="btn primary" onClick={exportJson}>
          Faire une sauvegarde
        </button>
        <button className="btn secondary" onClick={exportText}>
          Exporter en texte lisible
        </button>
        <button className="btn ghost" onClick={() => fileRef.current?.click()}>
          Restaurer une sauvegarde…
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          hidden
          onChange={(e) => onFile(e.target.files?.[0])}
        />

        {pending && (
          <div className="edit-box">
            <p>
              Restaurer la sauvegarde qui commence le <b>{formatDay(pending.startDate!)}</b> ? Elle remplacera tout ce
              qu'il y a dans l'appli maintenant. Ton code PIN reste le même.
            </p>
            <div className="btn-row">
              <button className="btn ghost" onClick={() => setPending(null)}>
                Annuler
              </button>
              <button
                className="btn primary"
                onClick={() => {
                  restore(pending)
                  setPending(null)
                  setMsg({ ok: true, text: 'Sauvegarde restaurée.' })
                }}
              >
                Restaurer
              </button>
            </div>
          </div>
        )}

        {msg && <p className={msg.ok ? 'ok-line small' : 'warn-line small'}>{msg.text}</p>}
        <p className="fine">Les fichiers ne contiennent jamais ton code PIN ni ta clé API.</p>
      </section>

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
            <p>Sûr ? Ça ne peut pas être annulé. Fais une sauvegarde avant si tu veux pouvoir revenir.</p>
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
    </>
  )
}
