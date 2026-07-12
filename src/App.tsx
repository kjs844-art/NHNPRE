import { useCallback, useEffect, useRef, useState } from 'react'
import PhaserGame from './game/PhaserGame'
import { EventBus } from './game/EventBus'
import { audioEngine } from './game/AudioEngine'
import { NightEngine } from './game/engine/night'
import type { AnomalyType, NightEvent } from './game/engine/types'
import { NIGHTS, NIGHT5_TWIST_AT } from './game/data/nights'
import {
  BAD_ENDING_LINES,
  NIGHT_SCRIPTS,
  POST_CREDIT_LINE,
  TRUE_ENDING_LINES,
  TWIST_CHAT,
  TWIST_STAGE_CHAT,
  GAME_TITLE,
  GAME_TAGLINE,
} from './game/data/script'
import { ROOM_META_MAP } from './game/rooms'
import { loadSave, persistSave } from './game/save'
import Menu from './components/Menu'
import Register from './components/Register'
import Briefing from './components/Briefing'
import NightHud from './components/NightHud'
import CamSwitcher from './components/CamSwitcher'
import ChatPanel, { type ChatEntry } from './components/ChatPanel'
import ReportModal from './components/ReportModal'
import TwistReportModal from './components/TwistReportModal'
import Typewriter from './components/Typewriter'
import ClearScreen from './components/ClearScreen'
import './index.css'

type Screen =
  | 'menu'
  | 'register'
  | 'briefing'
  | 'night'
  | 'clear'
  | 'gameover'
  | 'truending'
  | 'end'

interface TwistState {
  started: boolean
  active: boolean
  cam07Live: boolean
  stage: number
  pendingAdvance: boolean
  visited: boolean
  shownStages: Set<number>
  finalShown: boolean
}

const freshTwist = (): TwistState => ({
  started: false,
  active: false,
  cam07Live: false,
  stage: 0,
  pendingAdvance: false,
  visited: false,
  shownStages: new Set(),
  finalShown: false,
})

function App() {
  const [save, setSave] = useState(loadSave)
  const [screen, setScreen] = useState<Screen>('menu')
  const [night, setNight] = useState(1)
  const [viewedRoom, setViewedRoom] = useState('lobby')
  const [transitioning, setTransitioning] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [reportLocked, setReportLocked] = useState(false)
  const [hud, setHud] = useState({ clock: '00:00', erosion: 0, falseReports: 0 })
  const [chat, setChat] = useState<ChatEntry[]>([])
  const [typing, setTyping] = useState(false)
  const [cam07Live, setCam07Live] = useState(false)
  const [twistFinal, setTwistFinal] = useState(false)
  const [endingIdx, setEndingIdx] = useState(0)
  const [clearStats, setClearStats] = useState({ resolved: 0, false: 0, erosion: 0 })
  const [flash, setFlash] = useState(false)
  const [postCredit, setPostCredit] = useState(false)

  const engineRef = useRef<NightEngine | null>(null)
  const nightRef = useRef(1)
  const viewedRoomRef = useRef('lobby')
  const pausedRef = useRef(false)
  const twistRef = useRef<TwistState>(freshTwist())
  const chatIdRef = useRef(0)
  const chatBusyRef = useRef(false)
  const chatQueueRef = useRef<Array<{ from: 'boss' | 'system'; text: string }>>([])
  const firedRef = useRef({ firstResolve: false, erosionHigh: false, timedIdx: 0 })
  const timersRef = useRef<number[]>([])

  const fmt = useCallback(
    (text: string) => text.replaceAll('{NAME}', save.name || '신입'),
    [save.name],
  )

  const addTimer = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms)
    timersRef.current.push(id)
    return id
  }

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id))
    timersRef.current = []
  }

  /* ---------- 채팅 큐 (박 주임은 입력 중… 후 도착) ---------- */

  const processChatQueue = useCallback(() => {
    if (chatBusyRef.current) return
    const next = chatQueueRef.current.shift()
    if (!next) return
    chatBusyRef.current = true
    const append = () => {
      setTyping(false)
      setChat((prev) => [...prev.slice(-30), { id: ++chatIdRef.current, ...next }])
      chatBusyRef.current = false
      processChatQueue()
    }
    if (next.from === 'boss') {
      setTyping(true)
      addTimer(append, 850)
    } else {
      addTimer(append, 200)
    }
  }, [])

  const pushChat = useCallback(
    (from: 'boss' | 'system', text: string) => {
      chatQueueRef.current.push({ from, text: fmt(text) })
      processChatQueue()
    },
    [fmt, processChatQueue],
  )

  /* ---------- Phaser 렌더 ---------- */

  const emitRender = useCallback(() => {
    const eng = engineRef.current
    const t = twistRef.current
    const roomId = viewedRoomRef.current
    if (roomId === 'control') {
      EventBus.emit('render-cam', {
        roomId: 'control',
        camLabel: 'CAM 07 — 관제실',
        active: [],
        night: nightRef.current,
        clock: '04:44',
        twistStage: t.stage,
      })
      return
    }
    const snap = eng?.snapshot()
    EventBus.emit('render-cam', {
      roomId,
      camLabel: ROOM_META_MAP.get(roomId)?.camLabel ?? '',
      active: snap?.active ?? [],
      night: nightRef.current,
      clock: t.active ? '04:44' : (snap?.clock ?? '00:00'),
    })
  }, [])

  useEffect(() => {
    const onReady = () => emitRender()
    EventBus.on('scene-ready', onReady)
    return () => {
      EventBus.off('scene-ready', onReady)
    }
  }, [emitRender])

  /* ---------- 밤 시작/종료 ---------- */

  const beginNight = useCallback((n: number) => {
    const config = NIGHTS[n - 1]
    const params = new URLSearchParams(window.location.search)
    const seedParam = Number(params.get('seed'))
    const seed = Number.isFinite(seedParam) && seedParam > 0 ? seedParam + n : Date.now() % 2147483647
    engineRef.current = new NightEngine(config, ROOM_META_MAP, seed)
    nightRef.current = n
    twistRef.current = freshTwist()
    firedRef.current = { firstResolve: false, erosionHigh: false, timedIdx: 0 }
    chatQueueRef.current = []
    chatBusyRef.current = false
    viewedRoomRef.current = config.cameraIds[0]
    setViewedRoom(config.cameraIds[0])
    setChat([])
    setTyping(false)
    setCam07Live(false)
    setTwistFinal(false)
    setHud({ clock: '00:00', erosion: 0, falseReports: 0 })
    setScreen('night')
    audioEngine.startDrone()
    emitRender()
  }, [emitRender])

  const startFromMenu = (n: number) => {
    if (!save.name) {
      setNight(n)
      setScreen('register')
      return
    }
    setNight(n)
    setScreen('briefing')
  }

  /* ---------- 반전 시퀀스 ---------- */

  const startTwist = useCallback(() => {
    const t = twistRef.current
    t.started = true
    t.active = true
    const eng = engineRef.current
    eng?.freezeSpawning(true)
    eng?.clearActive()
    emitRender()
    audioEngine.silenceForTwist()
    audioEngine.setHeartbeat(true)
    EventBus.emit('static-burst')

    let acc = 0
    TWIST_CHAT.forEach((line, i) => {
      acc += line.delay * 1000
      addTimer(() => {
        pushChat(line.from, line.text)
        if (i === 2) {
          setCam07Live(true)
          twistRef.current.cam07Live = true
        }
        if (i === TWIST_CHAT.length - 1) {
          // 20초 안에 CAM 07을 보지 않으면 화면이 멋대로 전환된다
          addTimer(() => {
            if (!twistRef.current.visited) forceSwitchToControl()
          }, 20000)
        }
      }, acc)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emitRender, pushChat])

  const showTwistStage = useCallback(
    (stage: number) => {
      const t = twistRef.current
      if (t.shownStages.has(stage)) return
      t.shownStages.add(stage)
      const lines = TWIST_STAGE_CHAT[stage] ?? []
      let acc = 0
      lines.forEach((line) => {
        acc += line.delay * 1000
        addTimer(() => pushChat(line.from, line.text), acc)
      })
      if (stage === 3) {
        addTimer(() => {
          twistRef.current.finalShown = true
          setTwistFinal(true)
        }, acc + 2600)
      } else {
        // CAM 07을 계속 보고 있어도, '깜빡임'은 온다
        addTimer(() => {
          const cur = twistRef.current
          if (cur.active && viewedRoomRef.current === 'control' && cur.stage === stage && stage < 3) {
            EventBus.emit('static-burst')
            cur.stage = stage + 1
            emitRender()
            showTwistStage(cur.stage)
          }
        }, acc + 9000)
      }
    },
    [emitRender, pushChat],
  )

  const forceSwitchToControl = useCallback(() => {
    EventBus.emit('static-burst')
    audioEngine.switchBlip()
    viewedRoomRef.current = 'control'
    setViewedRoom('control')
    const t = twistRef.current
    t.visited = true
    emitRender()
    showTwistStage(t.stage)
  }, [emitRender, showTwistStage])

  /* ---------- 카메라 전환 ---------- */

  const switchCam = useCallback(
    (roomId: string) => {
      if (transitioning) return
      setTransitioning(true)
      audioEngine.switchBlip()
      EventBus.emit('static-burst')
      addTimer(() => {
        viewedRoomRef.current = roomId
        setViewedRoom(roomId)
        setTransitioning(false)

        const t = twistRef.current
        if (t.active) {
          if (roomId === 'control') {
            t.visited = true
            if (t.pendingAdvance && t.stage < 3) {
              t.stage += 1
              t.pendingAdvance = false
            }
            emitRender()
            showTwistStage(t.stage)
            return
          }
          if (t.visited && t.stage < 3) t.pendingAdvance = true
        }
        emitRender()
      }, 280)
    },
    [transitioning, emitRender, showTwistStage],
  )

  /* ---------- 엔진 이벤트 ---------- */

  const handleEvents = useCallback(
    (events: NightEvent[]) => {
      const script = NIGHT_SCRIPTS[nightRef.current]
      for (const ev of events) {
        switch (ev.kind) {
          case 'escalated':
            if (ev.anomaly.roomId === viewedRoomRef.current) EventBus.emit('static-burst')
            break
          case 'resolved':
            audioEngine.reportOk()
            if (!firedRef.current.firstResolve && script.onFirstResolve) {
              firedRef.current.firstResolve = true
              pushChat('boss', script.onFirstResolve)
            }
            break
          case 'near-miss':
            audioEngine.reportBad()
            pushChat('boss', script.onNearMiss)
            break
          case 'false-report':
            audioEngine.reportBad()
            if (ev.graced && script.onFalseGraced) {
              pushChat('boss', script.onFalseGraced)
            } else if (ev.strike) {
              pushChat('boss', script.onStrike)
            } else {
              const idx = Math.min(ev.count - 1, script.onFalse.length - 1)
              if (script.onFalse[idx]) pushChat('boss', script.onFalse[idx])
            }
            setReportLocked(true)
            addTimer(() => setReportLocked(false), 3000)
            break
          case 'erosion':
            audioEngine.setHeartbeat(ev.value > 60 || twistRef.current.active)
            if (ev.value > 60 && !firedRef.current.erosionHigh && script.onErosionHigh) {
              firedRef.current.erosionHigh = true
              pushChat('boss', script.onErosionHigh)
            }
            break
          case 'night-clear': {
            const snap = engineRef.current!.snapshot()
            setClearStats({
              resolved: snap.resolvedCount,
              false: snap.falseReports,
              erosion: snap.erosion,
            })
            const unlocked = Math.min(5, Math.max(save.unlockedNight, nightRef.current + 1))
            const next = { ...save, unlockedNight: unlocked }
            setSave(next)
            persistSave(next)
            audioEngine.setHeartbeat(false)
            setScreen('clear')
            break
          }
          case 'night-failed':
            audioEngine.setHeartbeat(false)
            EventBus.emit('static-burst')
            setEndingIdx(0)
            setScreen('gameover')
            break
          default:
            break
        }
      }
    },
    [pushChat, save],
  )

  /* ---------- 밤 루프 ---------- */

  useEffect(() => {
    if (screen !== 'night') return
    let raf = 0
    let last = performance.now()
    let lastHud = 0
    let lastStamp = 0

    const loop = (t: number) => {
      const dt = Math.min(0.1, (t - last) / 1000)
      last = t
      const eng = engineRef.current
      const twist = twistRef.current
      if (eng && !pausedRef.current && !twist.active) {
        const events = eng.tick(dt, viewedRoomRef.current)
        if (events.length > 0) {
          handleEvents(events)
          emitRender()
        }
        const snap = eng.snapshot()

        const script = NIGHT_SCRIPTS[nightRef.current]
        while (
          firedRef.current.timedIdx < script.timed.length &&
          snap.elapsed >= (script.timed[firedRef.current.timedIdx].at ?? 0)
        ) {
          const line = script.timed[firedRef.current.timedIdx]
          firedRef.current.timedIdx += 1
          pushChat(line.from, line.text)
        }

        if (nightRef.current === 5 && snap.elapsed >= NIGHT5_TWIST_AT && !twist.started) {
          startTwist()
        }

        if (t - lastHud > 180) {
          lastHud = t
          setHud({ clock: snap.clock, erosion: snap.erosion, falseReports: snap.falseReports })
        }
        if (t - lastStamp > 1000) {
          lastStamp = t
          emitRender()
        }
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [screen, handleEvents, emitRender, pushChat, startTwist])

  /* ---------- 보고 ---------- */

  pausedRef.current = reportOpen

  const submitReport = (type: AnomalyType) => {
    setReportOpen(false)
    const eng = engineRef.current
    if (!eng) return
    const { events } = eng.report(viewedRoomRef.current, type)
    handleEvents(events)
    emitRender()
  }

  const onTwistFinal = () => {
    setTwistFinal(false)
    audioEngine.stinger()
    setFlash(true)
    addTimer(() => {
      setFlash(false)
      setEndingIdx(0)
      setScreen('truending')
    }, 800)
  }

  /* ---------- 화면 전환 시 정리 ---------- */

  useEffect(() => {
    if (screen === 'menu') {
      audioEngine.stop()
      clearTimers()
    }
    if (screen === 'end') {
      setPostCredit(false)
      addTimer(() => setPostCredit(true), 3200)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen])

  useEffect(() => {
    audioEngine.setMuted(save.muted)
  }, [save.muted])

  // 개발용 테스트 훅
  useEffect(() => {
    if (!import.meta.env.DEV) return
    const w = window as unknown as Record<string, unknown>
    w.__ac = {
      snap: () => engineRef.current?.snapshot(),
      viewed: () => viewedRoomRef.current,
      twist: () => ({ ...twistRef.current, shownStages: [...twistRef.current.shownStages] }),
    }
  }, [])

  const toggleMute = () => {
    const next = { ...save, muted: !save.muted }
    setSave(next)
    persistSave(next)
  }

  const config = NIGHTS[night - 1]
  const script = NIGHT_SCRIPTS[night]

  return (
    <div className="app-root">
      {screen === 'menu' && (
        <Menu
          name={save.name}
          unlockedNight={save.unlockedNight}
          muted={save.muted}
          onStart={startFromMenu}
          onToggleMute={toggleMute}
        />
      )}

      {screen === 'register' && (
        <Register
          onRegister={(name) => {
            const next = { ...save, name }
            setSave(next)
            persistSave(next)
            setScreen('briefing')
          }}
        />
      )}

      {screen === 'briefing' && (
        <Briefing
          night={night}
          lines={script.briefing.map((l) => ({ ...l, text: fmt(l.text) }))}
          onBegin={() => beginNight(night)}
        />
      )}

      {screen === 'night' && (
        <div className="night-screen">
          <PhaserGame />
          <NightHud
            night={night}
            clock={twistRef.current.active ? '04:44' : hud.clock}
            erosion={hud.erosion}
            falseReports={hud.falseReports}
            muted={save.muted}
            onToggleMute={toggleMute}
          />
          <ChatPanel entries={chat} typing={typing} />
          <button
            className="report-button"
            disabled={transitioning || reportLocked || twistRef.current.active}
            onClick={() => setReportOpen(true)}
          >
            {reportLocked ? '접수 거부됨' : '보고'}
          </button>
          <CamSwitcher
            cameraIds={config.cameraIds}
            viewedRoomId={viewedRoom}
            disabled={transitioning}
            cam07={cam07Live ? 'live' : 'nosignal'}
            onSwitch={switchCam}
          />
          {reportOpen && (
            <ReportModal
              allowedTypes={config.allowedTypes}
              onSelect={submitReport}
              onCancel={() => setReportOpen(false)}
            />
          )}
          {twistFinal && <TwistReportModal onFinal={onTwistFinal} />}
          {flash && <div className="white-flash" />}
        </div>
      )}

      {screen === 'clear' && (
        <ClearScreen
          night={night}
          outro={script.clearOutro.map(fmt)}
          stats={clearStats}
          isLast={night >= 5}
          onNext={() => {
            const n = Math.min(5, night + 1)
            setNight(n)
            setScreen('briefing')
          }}
        />
      )}

      {screen === 'gameover' && (
        <>
          <Typewriter
            lines={BAD_ENDING_LINES}
            index={endingIdx}
            variant="bad"
            onAdvance={() => {
              if (endingIdx < BAD_ENDING_LINES.length - 1) setEndingIdx(endingIdx + 1)
            }}
          />
          {endingIdx >= BAD_ENDING_LINES.length - 1 && (
            <div className="gameover-actions">
              <button className="btn-primary" onClick={() => setScreen('briefing')}>
                다시 시도 — {night}일차
              </button>
              <button className="btn-ghost" onClick={() => setScreen('menu')}>
                처음으로
              </button>
            </div>
          )}
        </>
      )}

      {screen === 'truending' && (
        <Typewriter
          lines={TRUE_ENDING_LINES.map(fmt)}
          index={endingIdx}
          variant="true"
          onAdvance={() => {
            if (endingIdx < TRUE_ENDING_LINES.length - 1) setEndingIdx(endingIdx + 1)
            else setScreen('end')
          }}
        />
      )}

      {screen === 'end' && (
        <div className="screen end-screen">
          <p className="end-tag">ALL CLEAR</p>
          <h1 className="end-title">{GAME_TITLE}</h1>
          <p className="end-tagline">{GAME_TAGLINE}</p>
          {postCredit && <p className="post-credit">{fmt(POST_CREDIT_LINE)}</p>}
          <button className="btn-primary" onClick={() => setScreen('menu')}>
            처음으로
          </button>
        </div>
      )}
    </div>
  )
}

export default App
