import { useState } from 'react'
import { GAME_TITLE, GAME_TITLE_EN, GAME_TAGLINE } from '../game/data/script'

interface Props {
  name: string
  unlockedNight: number
  muted: boolean
  onStart: (night: number) => void
  onToggleMute: () => void
}

export default function Menu({ name, unlockedNight, muted, onStart, onToggleMute }: Props) {
  const [showHow, setShowHow] = useState(false)
  const [showNights, setShowNights] = useState(false)

  return (
    <div className="screen menu-screen">
      <p className="menu-en">{GAME_TITLE_EN}</p>
      <h1 className="menu-title">{GAME_TITLE}</h1>
      <p className="menu-tagline">{GAME_TAGLINE}</p>

      <div className="menu-buttons">
        <button className="btn-primary" onClick={() => onStart(unlockedNight)}>
          {unlockedNight > 1 ? `근무 계속 — ${unlockedNight}일차` : '근무 시작'}
        </button>
        {unlockedNight > 1 && (
          <button className="btn-ghost" onClick={() => setShowNights((s) => !s)}>
            밤 선택
          </button>
        )}
        <button className="btn-ghost" onClick={() => setShowHow((s) => !s)}>
          근무 요령
        </button>
        <button className="btn-ghost" onClick={onToggleMute}>
          {muted ? '🔇 음소거 해제' : '🔊 음소거'}
        </button>
      </div>

      {showNights && (
        <div className="night-select">
          {Array.from({ length: unlockedNight }, (_, i) => i + 1).map((n) => (
            <button key={n} className="btn-ghost" onClick={() => onStart(n)}>
              {n}일차
            </button>
          ))}
        </div>
      )}

      {showHow && (
        <div className="howto">
          <p>· 하단 버튼으로 CCTV를 전환하며 순찰합니다.</p>
          <p>· 화면에서 달라진 것을 발견하면 [보고] → 유형 선택.</p>
          <p>· 이상을 방치하면 침식도가 오르고, 100%가 되면 근무는 끝납니다.</p>
          <p>· 없는 것을 보고하면 기록이 남습니다. 확실할 때만.</p>
          <p className="howto-note">데스크톱 · 마우스 · 소리 켜기를 권장합니다.</p>
        </div>
      )}

      {name && <p className="menu-worker">근무자: {name}</p>}
    </div>
  )
}
