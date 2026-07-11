interface Props {
  line: string
  lineKey: number
  onAdvance: () => void
}

export default function EndingSequence({ line, lineKey, onAdvance }: Props) {
  return (
    <div className="ending-screen" onClick={onAdvance}>
      <div className="ending-glitch" key={lineKey}>
        <p className="ending-line">{line}</p>
      </div>
      <span className="ending-cue">▶</span>
    </div>
  )
}
