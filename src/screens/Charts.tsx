import { useState, type PointerEvent } from 'react'
import { parseDay } from '../lib/day'

// Petits graphiques faits main en SVG : légers, lisibles en sombre, et sans librairie.

const W = 320
const H = 132
const PAD = { left: 32, right: 30, top: 16, bottom: 24 }
const PLOT_W = W - PAD.left - PAD.right
const PLOT_H = H - PAD.top - PAD.bottom

export function shortDate(day: string): string {
  return parseDay(day).toLocaleDateString('fr-BE', { day: 'numeric', month: 'numeric' })
}

export function longDate(day: string): string {
  return parseDay(day).toLocaleDateString('fr-BE', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function fmtNum(n: number): string {
  return n.toLocaleString('fr-BE', { maximumFractionDigits: 1 })
}

function indexFromPointer(e: PointerEvent<SVGSVGElement>, n: number, xOf: (i: number) => number): number {
  const rect = e.currentTarget.getBoundingClientRect()
  const x = ((e.clientX - rect.left) / rect.width) * W
  let best = 0
  for (let i = 1; i < n; i++) if (Math.abs(xOf(i) - x) < Math.abs(xOf(best) - x)) best = i
  return best
}

export interface LinePoint {
  day: string
  value: number | null
}

/** Courbe d'une seule mesure de 1 à 10. Les jours sans bilan laissent un trou. */
export function LineChart({ points, label }: { points: LinePoint[]; label: string }) {
  const [hover, setHover] = useState<number | null>(null)
  const n = points.length
  const xOf = (i: number) => PAD.left + (n <= 1 ? PLOT_W / 2 : (i / (n - 1)) * PLOT_W)
  const yOf = (v: number) => PAD.top + PLOT_H - ((v - 1) / 9) * PLOT_H

  // Segments continus (on coupe la ligne là où il manque un bilan).
  const segments: string[] = []
  let cur: string[] = []
  points.forEach((p, i) => {
    if (p.value == null) {
      if (cur.length) segments.push(cur.join(' '))
      cur = []
    } else cur.push(`${cur.length ? 'L' : 'M'}${xOf(i).toFixed(1)},${yOf(p.value).toFixed(1)}`)
  })
  if (cur.length) segments.push(cur.join(' '))

  const isolated = (i: number) => points[i].value != null && points[i - 1]?.value == null && points[i + 1]?.value == null
  const lastIdx = points.map((p) => p.value != null).lastIndexOf(true)
  const showAllDots = n <= 10
  const h = hover != null ? points[hover] : null

  return (
    <div className="chart">
      <p className="chart-readout" aria-live="polite">
        {h ? (
          <>
            {h.value != null ? <b>{h.value}</b> : <span className="muted">Pas de bilan</span>}{' '}
            <span className="muted">· {longDate(h.day)}</span>
          </>
        ) : (
          <span className="muted">Touche la courbe pour voir un jour.</span>
        )}
      </p>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="chart-svg"
        role="img"
        aria-label={`${label}, ${n} derniers jours`}
        onPointerMove={(e) => setHover(indexFromPointer(e, n, xOf))}
        onPointerDown={(e) => setHover(indexFromPointer(e, n, xOf))}
        onPointerLeave={() => setHover(null)}
      >
        {[1, 5, 10].map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={yOf(t)} y2={yOf(t)} className="grid" />
            <text x={PAD.left - 8} y={yOf(t) + 4} className="tick" textAnchor="end">
              {t}
            </text>
          </g>
        ))}
        {n > 0 && (
          <>
            <text x={xOf(0)} y={H - 6} className="tick" textAnchor="start">
              {shortDate(points[0].day)}
            </text>
            {n > 1 && (
              <text x={xOf(n - 1)} y={H - 6} className="tick" textAnchor="end">
                {shortDate(points[n - 1].day)}
              </text>
            )}
          </>
        )}

        {hover != null && <line x1={xOf(hover)} x2={xOf(hover)} y1={PAD.top} y2={PAD.top + PLOT_H} className="crosshair" />}

        {segments.map((d, i) => (
          <path key={i} d={d} className="viz-line" />
        ))}

        {points.map((p, i) =>
          p.value != null && (showAllDots || isolated(i) || i === lastIdx || i === hover) ? (
            <circle key={i} cx={xOf(i)} cy={yOf(p.value)} r={i === hover ? 5.5 : 4} className="viz-dot" />
          ) : null,
        )}

        {lastIdx >= 0 && hover == null && (
          <text x={xOf(lastIdx) + 9} y={yOf(points[lastIdx].value!) + 4} className="end-label">
            {points[lastIdx].value}
          </text>
        )}
      </svg>
    </div>
  )
}

export interface Bar {
  key: string
  label: string
  value: number // 0 à 1
  tag?: string
}

/** Colonnes en pourcentage (taux de missions tenues par semaine). */
export function BarChart({ bars, ariaLabel }: { bars: Bar[]; ariaLabel: string }) {
  const [sel, setSel] = useState<number | null>(null)
  const n = bars.length
  const band = PLOT_W / Math.max(n, 1)
  const bw = Math.min(24, band - 8)
  const xOf = (i: number) => PAD.left + band * i + band / 2
  const yOf = (v: number) => PAD.top + PLOT_H - v * PLOT_H
  const r = 4
  const labelled = sel ?? n - 1
  const s = sel != null ? bars[sel] : null

  return (
    <div className="chart">
      <p className="chart-readout" aria-live="polite">
        {s ? (
          <>
            <b>{Math.round(s.value * 100)} %</b> <span className="muted">semaine du {s.label}</span>
          </>
        ) : (
          <span className="muted">Touche une colonne pour voir sa semaine.</span>
        )}
      </p>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="chart-svg"
        role="img"
        aria-label={ariaLabel}
        onPointerDown={(e) => setSel(indexFromPointer(e, n, xOf))}
        onPointerMove={(e) => e.pointerType === 'mouse' && setSel(indexFromPointer(e, n, xOf))}
      >
        {[0, 0.5, 1].map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={yOf(t)} y2={yOf(t)} className="grid" />
            <text x={PAD.left - 8} y={yOf(t) + 4} className="tick" textAnchor="end">
              {t * 100}
            </text>
          </g>
        ))}
        {bars.map((b, i) => {
          const x = xOf(i) - bw / 2
          const top = yOf(b.value)
          const hgt = PAD.top + PLOT_H - top
          const rr = Math.min(r, hgt)
          // Bout arrondi en haut, carré sur la ligne de base.
          const d =
            hgt <= 0
              ? ''
              : `M${x},${PAD.top + PLOT_H} V${top + rr} Q${x},${top} ${x + rr},${top} H${x + bw - rr} Q${x + bw},${top} ${x + bw},${top + rr} V${PAD.top + PLOT_H} Z`
          return (
            <g key={b.key}>
              {d && <path d={d} className={i === sel ? 'viz-bar active' : 'viz-bar'} />}
              {i === labelled && (
                <text x={xOf(i)} y={top - 6} className="end-label" textAnchor="middle">
                  {Math.round(b.value * 100)} %
                </text>
              )}
              <text x={xOf(i)} y={H - 6} className="tick" textAnchor="middle">
                {b.tag ?? b.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

/** Barre de progression, avec une piste dans la même teinte. */
export function Meter({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = Math.min(1, value / max) * 100
  return (
    <div className="meter" role="meter" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-label={label}>
      <div className="meter-fill" style={{ width: `${pct}%` }} />
    </div>
  )
}
