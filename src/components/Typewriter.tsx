interface Props {
  lines: string[]
  index: number
  variant: 'true' | 'bad'
  onAdvance: () => void
}

export default function Typewriter({ lines, index, variant, onAdvance }: Props) {
  return (
    <div className={`screen ending-screen ${variant}`} onClick={onAdvance}>
      <div className="ending-glitch" key={index}>
        <p className="ending-line">{lines[index]}</p>
      </div>
      <span className="ending-cue">▶</span>
    </div>
  )
}
