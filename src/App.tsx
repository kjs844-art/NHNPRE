import { useEffect, useRef, useState } from 'react'
import PhaserGame from './game/PhaserGame'
import { EventBus } from './game/EventBus'
import { audioEngine } from './game/AudioEngine'
import { ROOMS, ENDING_LINES } from './game/data/story'
import type { Clue } from './game/data/story'
import type { RoomRenderData } from './game/scenes/RoomScene'
import MainMenu from './components/MainMenu'
import DialogueOverlay from './components/DialogueOverlay'
import ClueLog from './components/ClueLog'
import EndingSequence from './components/EndingSequence'
import EndScreen from './components/EndScreen'
import './index.css'

type Stage = 'menu' | 'playing' | 'ending' | 'end'

function App() {
  const [stage, setStage] = useState<Stage>('menu')
  const [roomIndex, setRoomIndex] = useState(0)
  const [examined, setExamined] = useState<Record<string, string[]>>({})
  const [outroShown, setOutroShown] = useState<Record<string, boolean>>({})
  const [mirrorReady, setMirrorReady] = useState(false)
  const [exitReady, setExitReady] = useState(false)
  const [clues, setClues] = useState<Clue[]>([])
  const [dialogue, setDialogue] = useState<string[]>([])
  const [showLog, setShowLog] = useState(false)
  const [muted, setMuted] = useState(false)

  const pendingActionRef = useRef<null | (() => void)>(null)
  const roomPayloadRef = useRef<RoomRenderData | null>(null)

  const pushDialogue = (lines: string[], after?: () => void) => {
    pendingActionRef.current = after ?? null
    setDialogue(lines)
  }

  const advanceDialogue = () => {
    setDialogue((lines) => lines.slice(1))
  }

  useEffect(() => {
    if (dialogue.length > 0) return
    const fn = pendingActionRef.current
    if (fn) {
      pendingActionRef.current = null
      fn()
    }
  }, [dialogue])

  useEffect(() => {
    if (dialogue.length === 0) return
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') advanceDialogue()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dialogue])

  useEffect(() => {
    if (stage !== 'playing') {
      roomPayloadRef.current = null
      return
    }
    const room = ROOMS[roomIndex]
    const doneIds = examined[room.id] ?? []
    const payload: RoomRenderData = {
      title: room.title,
      subtitle: room.subtitle,
      top: room.top,
      bottom: room.bottom,
      accent: room.accent,
      hotspots: room.hotspots.map((h) => ({
        id: h.id,
        x: h.x,
        y: h.y,
        label: h.label,
        done: doneIds.includes(h.id),
        isMirror: h.isMirror,
        ready: h.isMirror ? mirrorReady : true,
      })),
    }
    roomPayloadRef.current = payload
    EventBus.emit('render-room', payload)
  }, [stage, roomIndex, examined, mirrorReady])

  useEffect(() => {
    const onSceneReady = () => {
      if (roomPayloadRef.current) EventBus.emit('render-room', roomPayloadRef.current)
    }
    EventBus.on('scene-ready', onSceneReady)
    return () => {
      EventBus.off('scene-ready', onSceneReady)
    }
  }, [])

  useEffect(() => {
    const onHotspotClicked = (id: string) => {
      const room = ROOMS[roomIndex]
      const hotspot = room.hotspots.find((h) => h.id === id)
      if (!hotspot) return

      if (hotspot.isMirror) {
        if (!mirrorReady) return
        audioEngine.stinger()
        setStage('ending')
        pushDialogue(ENDING_LINES, () => setStage('end'))
        return
      }

      const doneIds = examined[room.id] ?? []
      if (doneIds.includes(id)) {
        if (hotspot.revisitLine) pushDialogue([hotspot.revisitLine])
        return
      }

      const newDone = [...doneIds, id]
      setExamined((prev) => ({ ...prev, [room.id]: newDone }))
      if (hotspot.clue) {
        const clue = hotspot.clue
        setClues((prev) => (prev.some((c) => c.id === clue.id) ? prev : [...prev, clue]))
      }

      const nonMirrorIds = room.hotspots.filter((h) => !h.isMirror).map((h) => h.id)
      const allDone = nonMirrorIds.every((hid) => newDone.includes(hid))

      pushDialogue(hotspot.lines, () => {
        if (allDone && !outroShown[room.id]) {
          setOutroShown((prev) => ({ ...prev, [room.id]: true }))
          pushDialogue(room.radioOutro, () => {
            if (room.hotspots.some((h) => h.isMirror)) {
              setMirrorReady(true)
            } else {
              setExitReady(true)
            }
          })
        }
      })
    }

    EventBus.on('hotspot-clicked', onHotspotClicked)
    return () => {
      EventBus.off('hotspot-clicked', onHotspotClicked)
    }
  }, [roomIndex, examined, outroShown, mirrorReady])

  useEffect(() => {
    audioEngine.setMuted(muted)
  }, [muted])

  const startGame = () => {
    setStage('playing')
    setRoomIndex(0)
    setExamined({})
    setOutroShown({})
    setMirrorReady(false)
    setExitReady(false)
    setClues([])
    audioEngine.start()
    pushDialogue(ROOMS[0].radioIntro)
  }

  const goNextRoom = () => {
    const nextIndex = roomIndex + 1
    if (nextIndex >= ROOMS.length) return
    setRoomIndex(nextIndex)
    setExitReady(false)
    setMirrorReady(false)
    pushDialogue(ROOMS[nextIndex].radioIntro)
  }

  const restart = () => {
    audioEngine.stop()
    setStage('menu')
    setDialogue([])
    setClues([])
    setShowLog(false)
  }

  const room = ROOMS[roomIndex]

  return (
    <div className="app-root">
      {stage === 'menu' && <MainMenu onStart={startGame} />}

      {(stage === 'playing' || stage === 'ending') && (
        <div className="game-screen">
          <PhaserGame />

          {stage === 'playing' && (
            <>
              <div className="hud-top">
                <span className="hud-room-tag">
                  {roomIndex + 1} / {ROOMS.length} · {room.title}
                </span>
                <button className="mute-toggle" onClick={() => setMuted((m) => !m)}>
                  {muted ? '🔇' : '🔊'}
                </button>
              </div>

              <ClueLog clues={clues} open={showLog} onToggle={() => setShowLog((s) => !s)} />

              {exitReady && dialogue.length === 0 && room.exitLabel && (
                <button className="exit-button" onClick={goNextRoom}>
                  {room.exitLabel}
                </button>
              )}

              {dialogue.length > 0 && (
                <DialogueOverlay
                  line={dialogue[0]}
                  hasMore={dialogue.length > 1}
                  onAdvance={advanceDialogue}
                />
              )}
            </>
          )}

          {stage === 'ending' && dialogue.length > 0 && (
            <EndingSequence
              line={dialogue[0]}
              lineKey={ENDING_LINES.length - dialogue.length}
              onAdvance={advanceDialogue}
            />
          )}
        </div>
      )}

      {stage === 'end' && <EndScreen onRestart={restart} />}
    </div>
  )
}

export default App
