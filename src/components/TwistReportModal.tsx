import { useEffect, useState } from 'react'
import { ANOMALY_LABELS, type AnomalyType } from '../game/engine/types'

const ALL_TYPES: AnomalyType[] = ['move', 'vanish', 'intruder', 'light', 'open', 'distort']

interface Props {
  onFinal: () => void
}

/**
 * 마지막 보고: 기존 유형이 하나씩 '해당 없음'으로 비활성화되고,
 * 목록 맨 아래 일곱 번째 선택지가 스스로 나타난다.
 */
export default function TwistReportModal({ onFinal }: Props) {
  const [deadCount, setDeadCount] = useState(0)
  const [showFinal, setShowFinal] = useState(false)

  useEffect(() => {
    if (deadCount < ALL_TYPES.length) {
      const t = window.setTimeout(() => setDeadCount((c) => c + 1), 480)
      return () => window.clearTimeout(t)
    }
    const t = window.setTimeout(() => setShowFinal(true), 900)
    return () => window.clearTimeout(t)
  }, [deadCount])

  return (
    <div className="modal-backdrop twist">
      <div className="report-modal twist">
        <h3>최종 보고</h3>
        <p className="report-sub">대상을 분류하십시오.</p>
        <div className="report-types column">
          {ALL_TYPES.map((t, i) => (
            <button key={t} className={`report-type ${i < deadCount ? 'dead' : ''}`} disabled>
              {ANOMALY_LABELS[t]}
              {i < deadCount && <span className="dead-tag"> — 해당 없음</span>}
            </button>
          ))}
          {showFinal && (
            <button className="report-type final" onClick={onFinal}>
              실종자
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
