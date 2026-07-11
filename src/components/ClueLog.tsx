import type { Clue } from '../game/data/story'

interface Props {
  clues: Clue[]
  open: boolean
  onToggle: () => void
}

export default function ClueLog({ clues, open, onToggle }: Props) {
  return (
    <div className={`clue-log ${open ? 'open' : ''}`}>
      <button className="clue-log-toggle" onClick={onToggle}>
        단서 {clues.length > 0 ? `(${clues.length})` : ''}
      </button>
      {open && (
        <div className="clue-log-panel">
          {clues.length === 0 && <p className="clue-empty">아직 발견한 단서가 없다.</p>}
          {clues.map((c) => (
            <div key={c.id} className="clue-item">
              <h4>{c.title}</h4>
              <p>{c.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
