import { CLEAR_STATS_LABEL } from '../game/data/script'

interface Props {
  night: number
  outro: string[]
  stats: { resolved: number; false: number; erosion: number }
  onNext: () => void
  isLast: boolean
}

export default function ClearScreen({ night, outro, stats, onNext, isLast }: Props) {
  return (
    <div className="screen clear-screen">
      <h2 className="clear-title">{night}일차 근무 종료</h2>
      <div className="clear-outro">
        {outro.map((l, i) => (
          <p key={i}>{l}</p>
        ))}
      </div>
      <div className="clear-stats">
        <div>
          <span>{CLEAR_STATS_LABEL.resolved}</span>
          <b>{stats.resolved}</b>
        </div>
        <div>
          <span>{CLEAR_STATS_LABEL.false}</span>
          <b>{stats.false}</b>
        </div>
        <div>
          <span>{CLEAR_STATS_LABEL.erosion}</span>
          <b>{Math.round(stats.erosion)}%</b>
        </div>
      </div>
      <button className="btn-primary" onClick={onNext}>
        {isLast ? '…' : `${night + 1}일차 밤으로`}
      </button>
    </div>
  )
}
