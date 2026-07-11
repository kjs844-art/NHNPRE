interface Props {
  line: string
  hasMore: boolean
  onAdvance: () => void
}

export default function DialogueOverlay({ line, hasMore, onAdvance }: Props) {
  return (
    <div className="dialogue-box" onClick={onAdvance}>
      <p className="dialogue-text">{line}</p>
      <span className="dialogue-cue">{hasMore ? '▶ 클릭하여 계속' : '▶ 클릭'}</span>
    </div>
  )
}
