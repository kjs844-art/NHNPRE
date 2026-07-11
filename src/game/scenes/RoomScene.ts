import Phaser from 'phaser'
import { EventBus } from '../EventBus'

export interface HotspotRenderData {
  id: string
  x: number
  y: number
  label: string
  done: boolean
  isMirror?: boolean
  ready: boolean
}

export interface RoomRenderData {
  title: string
  subtitle: string
  top: number
  bottom: number
  accent: number
  hotspots: HotspotRenderData[]
}

const WIDTH = 960
const HEIGHT = 540

export class RoomScene extends Phaser.Scene {
  constructor() {
    super('RoomScene')
  }

  create() {
    EventBus.on('render-room', this.renderRoom, this)

    const cleanup = () => EventBus.off('render-room', this.renderRoom, this)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, cleanup)
    this.events.once(Phaser.Scenes.Events.DESTROY, cleanup)

    window.setTimeout(() => EventBus.emit('scene-ready'), 0)
  }

  private renderRoom(data: RoomRenderData) {
    if (!this.add) return

    this.tweens.killAll()
    this.time.removeAllEvents()
    this.children.removeAll(true)

    this.drawBackground(data.top, data.bottom)
    this.drawSilhouettes(data.bottom)

    this.add
      .text(WIDTH / 2, 40, data.title, {
        fontFamily: 'Georgia, "Nanum Myeongjo", serif',
        fontSize: '28px',
        color: '#d8cdd1',
      })
      .setOrigin(0.5)
      .setAlpha(0.85)

    this.add
      .text(WIDTH / 2, 70, data.subtitle, {
        fontFamily: 'Georgia, serif',
        fontSize: '13px',
        color: '#8a7f83',
      })
      .setOrigin(0.5)
      .setAlpha(0.65)

    data.hotspots.forEach((h) => this.drawHotspot(h, data.accent))

    this.drawFlicker()
  }

  private drawBackground(top: number, bottom: number) {
    const gfx = this.add.graphics()
    const steps = 40
    for (let i = 0; i < steps; i++) {
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.ValueToColor(top),
        Phaser.Display.Color.ValueToColor(bottom),
        steps,
        i,
      )
      gfx.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b), 1)
      gfx.fillRect(0, (HEIGHT / steps) * i, WIDTH, HEIGHT / steps + 1)
    }
  }

  private drawSilhouettes(bottom: number) {
    const gfx = this.add.graphics()
    const dark = Phaser.Display.Color.ValueToColor(bottom).darken(35).color
    gfx.fillStyle(dark, 0.9)

    gfx.fillRect(0, HEIGHT - 90, WIDTH, 90)
    gfx.fillRoundedRect(60, HEIGHT - 190, 220, 110, 10)
    gfx.fillRoundedRect(WIDTH - 260, HEIGHT - 260, 160, 180, 8)
    gfx.fillRoundedRect(WIDTH / 2 - 90, HEIGHT - 150, 180, 70, 6)

    const windowGfx = this.add.graphics()
    windowGfx.fillStyle(0xdad2c8, 0.05)
    windowGfx.fillRoundedRect(WIDTH - 170, 100, 90, 130, 4)
    windowGfx.lineStyle(3, 0x000000, 0.4)
    windowGfx.strokeRoundedRect(WIDTH - 170, 100, 90, 130, 4)
    windowGfx.lineBetween(WIDTH - 170, 165, WIDTH - 80, 165)
    windowGfx.lineBetween(WIDTH - 125, 100, WIDTH - 125, 230)
  }

  private drawFlicker() {
    const overlay = this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x000000, 0.08).setOrigin(0, 0)
    this.time.addEvent({
      delay: Phaser.Math.Between(1400, 3200),
      loop: true,
      callback: () => {
        const target = Phaser.Math.FloatBetween(0.03, 0.22)
        this.tweens.add({
          targets: overlay,
          alpha: target,
          duration: Phaser.Math.Between(60, 220),
          yoyo: true,
        })
      },
    })
  }

  private drawHotspot(h: HotspotRenderData, accent: number) {
    const px = (h.x / 100) * WIDTH
    const py = (h.y / 100) * HEIGHT

    if (h.isMirror && !h.ready) {
      const glass = this.add.circle(px, py, 34, 0xdedede, 0.06)
      glass.setStrokeStyle(1, 0xdedede, 0.15)
      return
    }

    const color = h.isMirror ? 0xdedede : accent
    const baseRadius = h.isMirror ? 16 : 9
    const marker = this.add.circle(px, py, baseRadius, color, h.done ? 0.28 : 0.85)

    const label = this.add
      .text(px, py + baseRadius + 12, h.label, {
        fontFamily: 'Georgia, serif',
        fontSize: '12px',
        color: h.isMirror ? '#e8e2e4' : '#c9bfc2',
      })
      .setOrigin(0.5)
      .setAlpha(h.done ? 0.25 : 0.55)

    if (!h.done) {
      this.tweens.add({
        targets: marker,
        scale: { from: 1, to: h.isMirror ? 1.35 : 1.25 },
        alpha: { from: h.isMirror ? 0.7 : 0.6, to: 1 },
        duration: h.isMirror ? 900 : 1100,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      })
    }

    marker.setInteractive({ useHandCursor: true })
    marker.on('pointerover', () => {
      label.setAlpha(1)
      marker.setScale(1.15)
    })
    marker.on('pointerout', () => {
      label.setAlpha(h.done ? 0.25 : 0.55)
      marker.setScale(1)
    })
    marker.on('pointerdown', () => {
      if (h.isMirror) {
        this.cameras.main.flash(500, 255, 255, 255)
        this.cameras.main.shake(350, 0.006)
      } else {
        this.tweens.add({ targets: marker, scale: 1.4, duration: 90, yoyo: true })
      }
      EventBus.emit('hotspot-clicked', h.id)
    })
  }
}

export const GAME_WIDTH = WIDTH
export const GAME_HEIGHT = HEIGHT
