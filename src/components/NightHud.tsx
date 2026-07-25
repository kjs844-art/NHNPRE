interface Props {
  night: number
  clock: string
  erosion: number
  falseReports: number
  muted: boolean
  onToggleMute: () => void
}

export default function NightHud({
  night,
  clock,
  erosion,
  falseReports,
  muted,
  onToggleMute,
}: Props) {
  return (
    <div className="hud">
      <div className="hud-left">
        <span className="hud-night">{night}일차</span>
        <span className="hud-clock">{clock}</span>
        <span className="hud-vpn">REMOTE ACCESS · VPN 연결됨</span>
      </div>
      <div className="hud-right">
        {falseReports > 0 && (
          <span className="hud-trust" title="오탐 기록">
            오탐{' '}
            {Array.from({ length: 3 }, (_, i) => (
              <i key={i} className={i < Math.min(falseReports, 3) ? 'pip on' : 'pip'} />
            ))}
          </span>
        )}
        <div className="hud-erosion" title="침식도">
          <span className="hud-erosion-label">침식도</span>
          <div className="hud-erosion-bar">
            <div
              className={`hud-erosion-fill ${erosion > 70 ? 'danger' : ''}`}
              style={{ width: `${erosion}%` }}
            />
          </div>
          <span className="hud-erosion-num">{Math.round(erosion)}%</span>
        </div>
        <button className="hud-mute" onClick={onToggleMute}>
          {muted ? '🔇' : '🔊'}
        </button>
      </div>
    </div>
  )
}
