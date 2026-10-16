import type { Mission } from '../lib/missions'
import { missionTitle } from '../lib/missions'

interface Props {
  mission: Mission
  bedtime: string
  done: boolean
  weekCount?: number
  onToggle: () => void
}

export default function MissionRow({ mission, bedtime, done, weekCount, onToggle }: Props) {
  return (
    <button className={done ? 'mission done' : 'mission'} onClick={onToggle} aria-pressed={done}>
      <span className="check" aria-hidden>
        {done && (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        )}
      </span>
      <span className="mission-txt">
        <b>{missionTitle(mission, bedtime)}</b>
        {(mission.hint || mission.perWeek) && (
          <small>
            {mission.perWeek ? `${weekCount ?? 0}/${mission.perWeek} cette semaine` : ''}
            {mission.perWeek && mission.hint ? ' · ' : ''}
            {mission.hint}
          </small>
        )}
      </span>
    </button>
  )
}
