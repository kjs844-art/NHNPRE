import { END_SCREEN_SUBTITLE, GAME_TITLE } from '../game/data/story'

interface Props {
  onRestart: () => void
}

export default function EndScreen({ onRestart }: Props) {
  return (
    <div className="end-screen">
      <p className="end-tag">END</p>
      <h1 className="end-title">{GAME_TITLE}</h1>
      <p className="end-subtitle">{END_SCREEN_SUBTITLE}</p>
      <button className="menu-start" onClick={onRestart}>
        처음으로
      </button>
    </div>
  )
}
