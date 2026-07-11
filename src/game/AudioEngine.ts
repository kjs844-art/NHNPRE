class AudioEngine {
  private ctx: AudioContext | null = null
  private droneGain: GainNode | null = null
  private nodes: AudioScheduledSourceNode[] = []
  private lfoTimer: number | null = null
  private muted = false

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext()
    }
    return this.ctx
  }

  start() {
    const ctx = this.ensureContext()
    if (ctx.state === 'suspended') void ctx.resume()
    if (this.droneGain) return

    const master = ctx.createGain()
    master.gain.value = this.muted ? 0 : 0.05
    master.connect(ctx.destination)
    this.droneGain = master

    const drone = ctx.createOscillator()
    drone.type = 'sine'
    drone.frequency.value = 54
    const droneLevel = ctx.createGain()
    droneLevel.gain.value = 0.6
    drone.connect(droneLevel)
    droneLevel.connect(master)
    drone.start()

    const overtone = ctx.createOscillator()
    overtone.type = 'sine'
    overtone.frequency.value = 108.5
    const overtoneLevel = ctx.createGain()
    overtoneLevel.gain.value = 0.15
    overtone.connect(overtoneLevel)
    overtoneLevel.connect(master)
    overtone.start()

    this.nodes = [drone, overtone]

    let t = 0
    this.lfoTimer = window.setInterval(() => {
      if (!this.droneGain || !this.ctx) return
      t += 1
      const wobble = 0.045 + Math.sin(t / 5) * 0.015 + (Math.random() - 0.5) * 0.008
      this.droneGain.gain.linearRampToValueAtTime(
        this.muted ? 0 : Math.max(0.01, wobble),
        this.ctx.currentTime + 0.8,
      )
    }, 800)
  }

  stinger() {
    const ctx = this.ensureContext()
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(220, now)
    osc.frequency.exponentialRampToValueAtTime(40, now + 1.4)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.linearRampToValueAtTime(this.muted ? 0 : 0.18, now + 0.05)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 1.7)
  }

  setMuted(muted: boolean) {
    this.muted = muted
    if (this.droneGain && this.ctx) {
      this.droneGain.gain.linearRampToValueAtTime(muted ? 0 : 0.05, this.ctx.currentTime + 0.3)
    }
  }

  stop() {
    if (this.lfoTimer !== null) {
      window.clearInterval(this.lfoTimer)
      this.lfoTimer = null
    }
    this.nodes.forEach((n) => {
      try {
        n.stop()
      } catch {
        /* already stopped */
      }
    })
    this.nodes = []
    this.droneGain = null
  }
}

export const audioEngine = new AudioEngine()
