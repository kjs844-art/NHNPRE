import { ROOM_MAP } from '../game/rooms'

interface Props {
  cameraIds: string[]
  viewedRoomId: string
  disabled: boolean
  /** null = 숨김 아님(회색 NO SIGNAL), 'live' = 켜짐 */
  cam07: 'nosignal' | 'live'
  onSwitch: (roomId: string) => void
}

export default function CamSwitcher({ cameraIds, viewedRoomId, disabled, cam07, onSwitch }: Props) {
  return (
    <div className="cam-switcher">
      {cameraIds.map((id, i) => {
        const def = ROOM_MAP.get(id)
        return (
          <button
            key={id}
            className={`cam-btn ${viewedRoomId === id ? 'active' : ''}`}
            disabled={disabled || viewedRoomId === id}
            onClick={() => onSwitch(id)}
          >
            <span className="cam-no">CAM {String(i + 1).padStart(2, '0')}</span>
            <span className="cam-name">{def?.meta.name ?? id}</span>
          </button>
        )
      })}
      {cam07 === 'nosignal' ? (
        <button className="cam-btn nosignal" disabled>
          <span className="cam-no">CAM 07</span>
          <span className="cam-name">NO SIGNAL</span>
        </button>
      ) : (
        <button
          className={`cam-btn cam07-live ${viewedRoomId === 'control' ? 'active' : ''}`}
          disabled={disabled || viewedRoomId === 'control'}
          onClick={() => onSwitch('control')}
        >
          <span className="cam-no">CAM 07</span>
          <span className="cam-name">관제실</span>
        </button>
      )}
    </div>
  )
}
