import type Phaser from 'phaser'
import type { AnomalyType } from '../engine/types'

export const W = 960
export const H = 540

export interface RoomState {
  has: (type: AnomalyType, propId?: string) => boolean
  /** -1 = 침입자 없음, 0..2 = 접근 단계 */
  intruderStage: number
  lightsOut: boolean
}

export type G = Phaser.GameObjects.Graphics

/** 색을 f배로 어둡게 (0..1) */
export function dim(color: number, f: number): number {
  const r = Math.round(((color >> 16) & 0xff) * f)
  const g = Math.round(((color >> 8) & 0xff) * f)
  const b = Math.round((color & 0xff) * f)
  return (r << 16) | (g << 8) | b
}

/** 세로 그라디언트 배경 (CCTV 야간 감시 톤) */
export function grad(g: G, x: number, y: number, w: number, h: number, top: number, bottom: number, steps = 24) {
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1)
    const r1 = (top >> 16) & 0xff, g1 = (top >> 8) & 0xff, b1 = top & 0xff
    const r2 = (bottom >> 16) & 0xff, g2 = (bottom >> 8) & 0xff, b2 = bottom & 0xff
    const c =
      ((Math.round(r1 + (r2 - r1) * t) << 16) |
        (Math.round(g1 + (g2 - g1) * t) << 8) |
        Math.round(b1 + (b2 - b1) * t))
    g.fillStyle(c, 1)
    g.fillRect(x, y + (h / steps) * i, w, h / steps + 1)
  }
}

/** 사람 실루엣 — 머리 + 어깨/몸통. h는 전체 키(px) */
export function person(g: G, x: number, y: number, h: number, color = 0x05070a, alpha = 0.96) {
  const headR = h * 0.11
  g.fillStyle(color, alpha)
  // 몸통 (어깨에서 아래로 좁아지는 형태)
  g.fillEllipse(x, y - h * 0.38, h * 0.34, h * 0.62)
  // 머리
  g.fillCircle(x, y - h * 0.82, headR)
}

/** 소실된 물체 자리에 남는 옅은 자국 (벽이 덜 바랜 부분) */
export function ghostPatch(g: G, x: number, y: number, w: number, h: number) {
  g.fillStyle(0xdfe8da, 0.08)
  g.fillRect(x, y, w, h)
  g.lineStyle(1, 0xdfe8da, 0.22)
  g.strokeRect(x, y, w, h)
}

/** 조명 이상 시 비상등 톤 오버레이 */
export function emergencyTint(g: G) {
  g.fillStyle(0x000000, 0.62)
  g.fillRect(0, 0, W, H)
  g.fillStyle(0x8a1f1f, 0.14)
  g.fillRect(0, 0, W, H)
}

export function lightScale(st: RoomState): number {
  return st.lightsOut ? 0.34 : 1
}
