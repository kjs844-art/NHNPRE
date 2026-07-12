import { ANOMALY_LABELS, type AnomalyType } from '../game/engine/types'

interface Props {
  allowedTypes: AnomalyType[]
  onSelect: (type: AnomalyType) => void
  onCancel: () => void
}

export default function ReportModal({ allowedTypes, onSelect, onCancel }: Props) {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="report-modal" onClick={(e) => e.stopPropagation()}>
        <h3>이상 현상 보고</h3>
        <p className="report-sub">현재 화면에서 발견한 이상의 유형을 선택하십시오.</p>
        <div className="report-types">
          {allowedTypes.map((t) => (
            <button key={t} className="report-type" onClick={() => onSelect(t)}>
              {ANOMALY_LABELS[t]}
            </button>
          ))}
        </div>
        <button className="btn-ghost report-cancel" onClick={onCancel}>
          취소
        </button>
      </div>
    </div>
  )
}
