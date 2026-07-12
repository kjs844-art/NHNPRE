/**
 * 전 사운드 WebAudio 합성 — 외부 오디오 에셋 0개.
 * 앰비언트 드론 / 카메라 전환 블립 / 보고 접수음 / 오탐 버저 / 심장박동 / 반전 스팅어
 */
class AudioEngine {
  private ctx: AudioContext | null = null
  private droneGain: GainNode | null = null
  private droneNodes: AudioScheduledSourceNode[] = []
  private lfoTimer: number | null = null
  private heartbeatTimer: number | null = null
  private muted = false
  private silenced = false

  private ensureContext(): AudioContext {
    if (!this.ctx) this.ctx = new AudioContext()
    return this.ctx
  }

  private gainValue(v: number): number {
    return this.muted || this.silenced ? 0 : v
  }

  startDrone() {
    const ctx = this.ensureContext()
    if (ctx.state === 'suspended') void ctx.resume()
    if (this.droneGain) return

    const master = ctx.createGain()
    master.gain.value = this.gainValue(0.05)
    master.connect(ctx.destination)
    this.droneGain = master

    const drone = ctx.createOscillator()
    drone.type = 'sine'
    drone.frequency.value = 52
    const droneLevel = ctx.createGain()
    droneLevel.gain.value = 0.6
    drone.connect(droneLevel)
    droneLevel.connect(master)
    drone.start()

    const overtone = ctx.createOscillator()
    overtone.type = 'sine'
    overtone.frequency.value = 104.7
    const overtoneLevel = ctx.createGain()
    overtoneLevel.gain.value = 0.14
    overtone.connect(overtoneLevel)
    overtoneLevel.connect(master)
    overtone.start()

    this.droneNodes = [drone, overtone]

    let t = 0
    this.lfoTimer = window.setInterval(() => {
      if (!this.droneGain || !this.ctx) return
      t += 1
      const wobble = 0.045 + Math.sin(t / 5) * 0.015 + (Math.random() - 0.5) * 0.008
      this.droneGain.gain.linearRampToValueAtTime(
        this.gainValue(Math.max(0.01, wobble)),
        this.ctx.currentTime + 0.8,
      )
    }, 800)
  }

  /** 반전: 드론이 끊기고 무음 — 심장박동과 클릭 소리만 남는다 */
  silenceForTwist() {
    this.silenced = true
    if (this.droneGain && this.ctx) {
      this.droneGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.2)
    }
  }

  /** 짧은 필터드 노이즈 — 카메라 전환 */
  switchBlip() {
    const ctx = this.ensureContext()
    if (this.muted) return
    const now = ctx.currentTime
    const len = 0.14
    const buffer = ctx.createBuffer(1, ctx.sampleRate * len, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length)
    const src = ctx.createBufferSource()
    src.buffer = buffer
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 1800
    const gain = ctx.createGain()
    gain.gain.value = 0.12
    src.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    src.start(now)
  }

  /** 낮은 접수음 — 보고 성공 */
  reportOk() {
    if (this.muted) return
    const ctx = this.ensureContext()
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(392, now)
    osc.frequency.setValueAtTime(523, now + 0.09)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.linearRampToValueAtTime(0.12, now + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.32)
  }

  /** 버저 — 오탐 */
  reportBad() {
    if (this.muted) return
    const ctx = this.ensureContext()
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    osc.type = 'square'
    osc.frequency.setValueAtTime(148, now)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.linearRampToValueAtTime(0.09, now + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.36)
  }

  /** 침식도 고조 시 심장박동 — 반전 땐 침식도 0에서도 계속 뛴다 */
  setHeartbeat(on: boolean) {
    if (on && this.heartbeatTimer === null) {
      const beat = () => {
        if (this.muted) return
        const ctx = this.ensureContext()
        const thump = (delay: number, vol: number) => {
          const now = ctx.currentTime + delay
          const osc = ctx.createOscillator()
          osc.type = 'sine'
          osc.frequency.setValueAtTime(58, now)
          osc.frequency.exponentialRampToValueAtTime(38, now + 0.14)
          const gain = ctx.createGain()
          gain.gain.setValueAtTime(0.0001, now)
          gain.gain.linearRampToValueAtTime(vol, now + 0.015)
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(now)
          osc.stop(now + 0.25)
        }
        thump(0, 0.16)
        thump(0.28, 0.1)
      }
      beat()
      this.heartbeatTimer = window.setInterval(beat, 1150)
    } else if (!on && this.heartbeatTimer !== null) {
      window.clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  /** 스팅어 — 마지막 보고 클릭, 그 한 번에만 쓴다 */
  stinger() {
    if (this.muted) return
    const ctx = this.ensureContext()
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(220, now)
    osc.frequency.exponentialRampToValueAtTime(38, now + 1.6)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.linearRampToValueAtTime(0.2, now + 0.04)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 1.9)

    const sub = ctx.createOscillator()
    sub.type = 'sine'
    sub.frequency.setValueAtTime(30, now)
    const subGain = ctx.createGain()
    subGain.gain.setValueAtTime(0.0001, now)
    subGain.gain.linearRampToValueAtTime(0.22, now + 0.05)
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2)
    sub.connect(subGain)
    subGain.connect(ctx.destination)
    sub.start(now)
    sub.stop(now + 2.3)
  }

  setMuted(muted: boolean) {
    this.muted = muted
    if (this.droneGain && this.ctx) {
      this.droneGain.gain.linearRampToValueAtTime(
        this.gainValue(0.05),
        this.ctx.currentTime + 0.3,
      )
    }
  }

  stop() {
    if (this.lfoTimer !== null) {
      window.clearInterval(this.lfoTimer)
      this.lfoTimer = null
    }
    this.setHeartbeat(false)
    this.silenced = false
    this.droneNodes.forEach((n) => {
      try {
        n.stop()
      } catch {
        /* already stopped */
      }
    })
    this.droneNodes = []
    this.droneGain = null
  }
}

export const audioEngine = new AudioEngine()
