import { useEffect, useState } from 'react'
import { BOSS_NAME, type ChatLine } from '../game/data/script'

interface Props {
  night: number
  lines: ChatLine[]
  onBegin: () => void
}

export default function Briefing({ night, lines, onBegin }: Props) {
  const [shown, setShown] = useState(0)

  useEffect(() => {
    setShown(0)
    let i = 0
    const timer = window.setInterval(() => {
      i += 1
      setShown(i)
      if (i >= lines.length) window.clearInterval(timer)
    }, 750)
    return () => window.clearInterval(timer)
  }, [lines])

  return (
    <div className="screen briefing-screen">
      <h2 className="briefing-title">{night}일차 밤</h2>
      <div className="briefing-chat">
        {lines.slice(0, shown).map((l, i) => (
          <p key={i} className={`chat-line ${l.from}`}>
            {l.from === 'boss' ? <b>{BOSS_NAME}</b> : <b>시스템</b>} {l.text}
          </p>
        ))}
      </div>
      <button
        className="btn-primary"
        onClick={onBegin}
        disabled={shown < Math.min(2, lines.length)}
      >
        근무 시작 (00:00)
      </button>
    </div>
  )
}
