import Phaser from 'phaser'
import { EventBus } from '../EventBus'
import { ROOM_MAP, drawControlRoom } from '../rooms'
import type { RoomState } from '../rooms/helpers'
import type { ActiveAnomaly, AnomalyType } from '../engine/types'
import { person } from '../rooms/helpers'

export const GAME_WIDTH = 960
export const GAME_HEIGHT = 540

export interface CamRenderPayload {
  roomId: string
  camLabel: string
  active: ActiveAnomaly[]
  night: number
  clock: string
  /** CAM 07 전용: 0..3 */
  twistStage?: number
}

/** 근무 5일: 21일 전 실종이라는 설정에 맞춘 날짜들 */
const BASE_DATE = new Date(2026, 5, 17) // 6/17 = 1일차
const GLITCH_OFFSET_DAYS = 21

function dateStr(night: number, offsetDays = 0): string {
  const d = new Date(BASE_DATE)
  d.setDate(d.getDate() + (night - 1) - offsetDays)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

export class CameraScene extends Phaser.Scene {
  private roomG!: Phaser.GameObjects.Graphics
  private figureG!: Phaser.GameObjects.Graphics
  private noise!: Phaser.GameObjects.TileSprite
  private staticOverlay!: Phaser.GameObjects.TileSprite
  private labelText!: Phaser.GameObjects.Text
  private stampText!: Phaser.GameObjects.Text
  private recDot!: Phaser.GameObjects.Arc
  private cur: CamRenderPayload | null = null
  private distorted = false
  private glitchTimer = 0

  constructor() {
    super('CameraScene')
  }

  create() {
    this.makeNoiseTexture()
    this.makeScanlineTexture()
    this.makeVignetteTexture()

    this.roomG = this.add.graphics()
    this.figureG = this.add.graphics()

    this.noise = this.add
      .tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'cctv-noise')
      .setOrigin(0)
      .setAlpha(0.06)
    this.add
      .tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'cctv-scanlines')
      .setOrigin(0)
      .setAlpha(0.14)
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'cctv-vignette').setAlpha(0.85)

    this.labelText = this.add.text(22, 16, '', {
      fontFamily: '"Courier New", monospace',
      fontSize: '20px',
      color: '#cfe0d4',
    })
    this.stampText = this.add.text(22, GAME_HEIGHT - 36, '', {
      fontFamily: '"Courier New", monospace',
      fontSize: '18px',
      color: '#b7c8bc',
    })
    this.recDot = this.add.circle(GAME_WIDTH - 96, 27, 7, 0xd23a2e)
    this.add.text(GAME_WIDTH - 82, 16, 'REC', {
      fontFamily: '"Courier New", monospace',
      fontSize: '20px',
      color: '#d9d0c8',
    })
    this.time.addEvent({
      delay: 700,
      loop: true,
      callback: () => this.recDot.setVisible(!this.recDot.visible),
    })

    this.staticOverlay = this.add
      .tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'cctv-noise')
      .setOrigin(0)
      .setAlpha(0)

    EventBus.on('render-cam', this.renderCam, this)
    EventBus.on('static-burst', this.staticBurst, this)
    const cleanup = () => {
      EventBus.off('render-cam', this.renderCam, this)
      EventBus.off('static-burst', this.staticBurst, this)
    }
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, cleanup)
    this.events.once(Phaser.Scenes.Events.DESTROY, cleanup)

    window.setTimeout(() => EventBus.emit('scene-ready'), 0)
  }

  update(_time: number, delta: number) {
    // 노이즈는 항상 일정 강도 — 강도 변화가 힌트도 은폐도 되지 않게 한다
    this.noise.tilePositionX = Math.random() * 256
    this.noise.tilePositionY = Math.random() * 256
    if (this.staticOverlay.alpha > 0.01) {
      this.staticOverlay.tilePositionX = Math.random() * 256
      this.staticOverlay.tilePositionY = Math.random() * 256
    }

    // 3일차부터: 타임스탬프가 아주 가끔 21일 전 날짜로 1프레임 깜빡인다.
    // CAM 07(관제실)은 이미 21일 전 날짜로 고정돼 있으므로 글리치를 적용하지 않는다.
    if (this.cur && this.cur.night >= 3 && this.cur.roomId !== 'control') {
      this.glitchTimer -= delta
      if (this.glitchTimer <= 0) {
        this.glitchTimer = 6000 + Math.random() * 9000
        const c = this.cur
        this.stampText.setText(`${dateStr(c.night, GLITCH_OFFSET_DAYS)}  ${c.clock}:44`)
        this.time.delayedCall(120, () => {
          if (this.cur && this.cur.roomId !== 'control') this.updateStamp(this.cur)
        })
      }
    }
  }

  private renderCam(p: CamRenderPayload) {
    this.cur = p
    this.roomG.clear()
    this.figureG.clear()

    if (p.roomId === 'control') {
      drawControlRoom(this.roomG, p.twistStage ?? 0)
      this.labelText.setText('CAM 07 — 관제실')
      this.stampText.setText(`${dateStr(p.night, GLITCH_OFFSET_DAYS)}  04:44:44`)
      this.applyDistort(false)
      return
    }

    const def = ROOM_MAP.get(p.roomId)
    if (!def) return

    const inRoom = p.active.filter((a) => a.roomId === p.roomId)
    const st: RoomState = {
      has: (type: AnomalyType, propId?: string) =>
        inRoom.some((a) => a.type === type && (propId === undefined || a.propId === propId)),
      intruderStage: inRoom.find((a) => a.type === 'intruder')?.stage ?? -1,
      lightsOut: inRoom.some((a) => a.type === 'light'),
    }

    def.draw(this.roomG, st)

    if (st.intruderStage >= 0) {
      const pos = def.intruderStages[Math.min(st.intruderStage, def.intruderStages.length - 1)]
      person(this.figureG, pos.x, pos.y, pos.s)
    }

    this.labelText.setText(def.meta.camLabel)
    this.updateStamp(p)
    this.applyDistort(st.has('distort'))
  }

  private updateStamp(p: CamRenderPayload) {
    const sec = String(Math.floor((Date.now() / 1000) % 60)).padStart(2, '0')
    this.stampText.setText(`${dateStr(p.night)}  ${p.clock}:${sec}`)
  }

  private applyDistort(on: boolean) {
    if (on === this.distorted) return
    this.distorted = on
    const cam = this.cameras.main
    if (on) {
      cam.setRotation(0.035)
      cam.setZoom(1.04)
      this.noise.setAlpha(0.3)
    } else {
      cam.setRotation(0)
      cam.setZoom(1)
      this.noise.setAlpha(0.06)
    }
  }

  private staticBurst(durationMs = 240) {
    this.staticOverlay.setAlpha(0.95)
    this.tweens.add({
      targets: this.staticOverlay,
      alpha: 0,
      duration: durationMs,
      ease: 'Quad.easeOut',
    })
  }

  private makeNoiseTexture() {
    if (this.textures.exists('cctv-noise')) return
    const size = 256
    const tex = this.textures.createCanvas('cctv-noise', size, size)
    if (!tex) return
    const ctx = tex.getContext()
    const img = ctx.createImageData(size, size)
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.floor(Math.random() * 255)
      img.data[i] = v
      img.data[i + 1] = v
      img.data[i + 2] = v
      img.data[i + 3] = 255
    }
    ctx.putImageData(img, 0, 0)
    tex.refresh()
  }

  private makeScanlineTexture() {
    if (this.textures.exists('cctv-scanlines')) return
    const tex = this.textures.createCanvas('cctv-scanlines', 4, 4)
    if (!tex) return
    const ctx = tex.getContext()
    ctx.fillStyle = 'rgba(0,0,0,0)'
    ctx.fillRect(0, 0, 4, 4)
    ctx.fillStyle = 'rgba(0,0,0,1)'
    ctx.fillRect(0, 0, 4, 1)
    tex.refresh()
  }

  private makeVignetteTexture() {
    if (this.textures.exists('cctv-vignette')) return
    const tex = this.textures.createCanvas('cctv-vignette', GAME_WIDTH, GAME_HEIGHT)
    if (!tex) return
    const ctx = tex.getContext()
    const grd = ctx.createRadialGradient(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_HEIGHT * 0.42,
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_HEIGHT * 0.95,
    )
    grd.addColorStop(0, 'rgba(0,0,0,0)')
    grd.addColorStop(1, 'rgba(0,0,0,0.55)')
    ctx.fillStyle = grd
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
    tex.refresh()
  }
}
