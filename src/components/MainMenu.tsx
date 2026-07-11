import { GAME_TITLE, GAME_SUBTITLE } from '../game/data/story'

interface Props {
  onStart: () => void
}

export default function MainMenu({ onStart }: Props) {
  return (
    <div className="menu-screen">
      <h1 className="menu-title">{GAME_TITLE}</h1>
      <p className="menu-subtitle">{GAME_SUBTITLE}</p>
      <button className="menu-start" onClick={onStart}>
        시작하기
      </button>
      <p className="menu-hint">헤드폰 사용을 권장합니다. 클릭하면 소리가 시작됩니다.</p>
    </div>
  )
}
