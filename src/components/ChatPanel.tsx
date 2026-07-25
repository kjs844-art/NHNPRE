import { useEffect, useRef } from 'react'
import { BOSS_NAME } from '../game/data/script'

export interface ChatEntry {
  id: number
  from: 'boss' | 'system'
  text: string
}

interface Props {
  entries: ChatEntry[]
  typing: boolean
}

export default function ChatPanel({ entries, typing }: Props) {
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = bodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [entries, typing])

  return (
    <div className="chat-panel">
      <div className="chat-head">사내 메신저 — {BOSS_NAME}</div>
      <div className="chat-body" ref={bodyRef}>
        {entries.map((e) => (
          <p key={e.id} className={`chat-line ${e.from}`}>
            {e.from === 'boss' ? <b>{BOSS_NAME}</b> : <b>시스템</b>} {e.text}
          </p>
        ))}
        {typing && <p className="chat-typing">{BOSS_NAME} 입력 중…</p>}
      </div>
    </div>
  )
}
