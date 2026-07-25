import type { RoomMeta } from '../engine/types'
import { W, H, dim, grad, ghostPatch, emergencyTint, type G, type RoomState } from './helpers'

export interface RoomDef {
  meta: RoomMeta
  intruderStages: Array<{ x: number; y: number; s: number }>
  draw: (g: G, st: RoomState) => void
}

/* ---------------- CAM 01 — 로비 ---------------- */

export const lobby: RoomDef = {
  meta: {
    id: 'lobby',
    name: '로비',
    camLabel: 'CAM 01 — 로비',
    intruder: true,
    light: true,
    props: [
      { id: 'sofa', label: '소파', supports: ['move'] },
      { id: 'plant', label: '화분', supports: ['move', 'vanish'] },
      { id: 'notice', label: '안내판', supports: ['vanish'] },
      { id: 'glassdoor', label: '유리문', supports: ['open'] },
    ],
  },
  intruderStages: [
    { x: 795, y: 395, s: 120 },
    { x: 700, y: 420, s: 180 },
    { x: 480, y: 480, s: 290 },
  ],
  draw(g, st) {
    const L = st.lightsOut ? 0.4 : 1
    grad(g, 0, 0, W, 400, dim(0x2a3230, L), dim(0x1a201f, L))
    grad(g, 0, 400, W, 140, dim(0x232a28, L), dim(0x141a18, L))
    // 바닥 원근선
    g.lineStyle(1, dim(0x39443f, L), 0.5)
    for (let i = 0; i < 5; i++) g.lineBetween(180 + i * 160, 400, 60 + i * 230, 540)

    // 우편함 (좌측 벽)
    g.fillStyle(dim(0x1f2624, L), 1)
    g.fillRect(58, 138, 204, 146)
    g.lineStyle(1, dim(0x435049, L), 0.9)
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 4; c++) g.strokeRect(64 + c * 49, 144 + r * 46, 43, 40)

    // 안내판 (뒷벽)
    if (st.has('vanish', 'notice')) {
      ghostPatch(g, 320, 118, 184, 124)
    } else {
      g.fillStyle(dim(0x39423e, L), 1)
      g.fillRect(320, 118, 184, 124)
      g.lineStyle(2, dim(0x59665f, L), 1)
      g.strokeRect(320, 118, 184, 124)
      g.fillStyle(dim(0x59665f, L), 0.8)
      for (let i = 0; i < 4; i++) g.fillRect(334, 136 + i * 24, 120 - i * 18, 6)
    }

    // 유리문 (우측) — 개방 시 오른쪽 패널이 열려 어두운 틈
    const doorOpen = st.has('open', 'glassdoor')
    g.lineStyle(3, dim(0x4a5751, L), 1)
    g.strokeRect(690, 116, 196, 306)
    g.fillStyle(dim(0x395a52, L), 0.2)
    g.fillRect(694, 120, 92, 298)
    if (doorOpen) {
      g.fillStyle(0x020403, 0.95)
      g.fillRect(790, 120, 92, 298)
      g.lineStyle(2, dim(0x4a5751, L), 1)
      g.lineBetween(790, 120, 852, 96)
      g.lineBetween(790, 418, 852, 442)
      g.lineBetween(852, 96, 852, 442)
    } else {
      g.fillStyle(dim(0x395a52, L), 0.2)
      g.fillRect(790, 120, 92, 298)
      g.lineStyle(1, dim(0x4a5751, L), 1)
      g.lineBetween(788, 120, 788, 418)
    }

    // 소파 — 이동 시 크게 오른쪽으로 밀리고 기운다
    const sofaX = st.has('move', 'sofa') ? 452 : 322
    const sofaTilt = st.has('move', 'sofa') ? 10 : 0
    g.fillStyle(dim(0x2e3b36, L), 1)
    g.fillRect(sofaX, 336 + sofaTilt, 218, 78)
    g.fillRect(sofaX - 10, 306 + sofaTilt, 20, 108)
    g.fillRect(sofaX + 208, 306, 20, 108)
    g.fillRect(sofaX + 8, 312 + sofaTilt / 2, 202, 30)

    // 화분
    if (st.has('vanish', 'plant')) {
      ghostPatch(g, 608, 348, 60, 62)
    } else {
      const px = st.has('move', 'plant') ? 168 : 616
      g.fillStyle(dim(0x27302c, L), 1)
      g.fillRect(px, 372, 44, 40)
      g.fillStyle(dim(0x2f4a38, L), 1)
      g.fillCircle(px + 22, 344, 34)
    }

    if (st.lightsOut) emergencyTint(g)
  },
}

/* ---------------- CAM 02 — 4층 복도 ---------------- */

export const hallway: RoomDef = {
  meta: {
    id: 'hallway',
    name: '4층 복도',
    camLabel: 'CAM 02 — 4층 복도',
    intruder: true,
    light: true,
    props: [
      { id: 'ext', label: '소화기', supports: ['move', 'vanish'] },
      { id: 'door403', label: '403호 문', supports: ['open'] },
    ],
  },
  intruderStages: [
    { x: 485, y: 345, s: 95 },
    { x: 470, y: 385, s: 165 },
    { x: 445, y: 470, s: 310 },
  ],
  draw(g, st) {
    const L = st.lightsOut ? 0.34 : 1
    // 원근 복도: 소실점 (480, 250)
    grad(g, 0, 0, W, H, dim(0x242c2a, L), dim(0x101514, L))
    g.fillStyle(dim(0x1b2220, L), 1)
    g.fillTriangle(0, 0, 480, 250, 0, 540)
    g.fillTriangle(960, 0, 480, 250, 960, 540)
    g.fillStyle(dim(0x262f2c, L), 1)
    g.fillTriangle(0, 540, 480, 250, 960, 540)
    g.fillStyle(dim(0x1e2523, L), 1)
    g.fillTriangle(0, 0, 480, 250, 960, 0)
    // 복도 끝 벽
    g.fillStyle(dim(0x151b19, L), 1)
    g.fillRect(430, 220, 105, 90)

    // 왼쪽 벽 문 4개 (401~404, 멀어질수록 작게)
    const doors = [
      { x: 96, y: 170, w: 96, h: 240, id: null },
      { x: 258, y: 200, w: 70, h: 185, id: null },
      { x: 388, y: 219, w: 50, h: 140, id: 'door403' },
      { x: 468, y: 232, w: 20, h: 96, id: null },
    ]
    for (const d of doors) {
      const isOpen = d.id === 'door403' && st.has('open', 'door403')
      if (isOpen) {
        g.fillStyle(0x020403, 0.96)
        g.fillRect(d.x, d.y, d.w, d.h)
        g.lineStyle(2, dim(0x4d5a53, L), 1)
        g.strokeRect(d.x, d.y, d.w, d.h)
        // 열린 문짝
        g.fillStyle(dim(0x33403a, L), 1)
        g.fillTriangle(d.x, d.y, d.x - d.w * 0.7, d.y + 14, d.x - d.w * 0.7, d.y + d.h + 8)
        g.fillTriangle(d.x, d.y, d.x, d.y + d.h, d.x - d.w * 0.7, d.y + d.h + 8)
      } else {
        g.fillStyle(dim(0x33403a, L), 1)
        g.fillRect(d.x, d.y, d.w, d.h)
        g.lineStyle(1, dim(0x4d5a53, L), 1)
        g.strokeRect(d.x, d.y, d.w, d.h)
        g.fillStyle(dim(0x59665f, L), 1)
        g.fillCircle(d.x + d.w - 8, d.y + d.h / 2, 2.5)
      }
    }

    // 천장 조명 2개
    if (!st.lightsOut) {
      g.fillStyle(0xcfe3d8, 0.85)
      g.fillRect(330, 130, 90, 12)
      g.fillRect(500, 196, 46, 8)
      g.fillStyle(0xcfe3d8, 0.07)
      g.fillTriangle(330, 142, 420, 142, 300, 400)
      g.fillTriangle(420, 142, 300, 400, 520, 400)
    }

    // 소화기 (우측 벽, 빨강 — 유일한 원색 랜드마크)
    if (st.has('vanish', 'ext')) {
      ghostPatch(g, 688, 318, 34, 60)
    } else {
      const ex = st.has('move', 'ext') ? 560 : 690
      const ey = st.has('move', 'ext') ? 430 : 320
      g.fillStyle(dim(0x8a2020, L), 1)
      g.fillRect(ex, ey, 26, 50)
      g.fillStyle(dim(0x5a1414, L), 1)
      g.fillRect(ex + 8, ey - 10, 10, 12)
    }

    if (st.lightsOut) {
      emergencyTint(g)
      // 복도 끝 비상등
      g.fillStyle(0x8a1f1f, 0.55)
      g.fillRect(452, 226, 60, 10)
    }
  },
}

/* ---------------- CAM 03 — 402호 거실 ---------------- */

export const unit402: RoomDef = {
  meta: {
    id: 'unit402',
    name: '402호 거실',
    camLabel: 'CAM 03 — 402호 (공실)',
    intruder: true,
    light: true,
    props: [
      { id: 'frame', label: '액자', supports: ['move', 'vanish'] },
      { id: 'chair', label: '의자', supports: ['move'] },
      { id: 'boxes', label: '이삿짐 상자', supports: ['vanish'] },
      { id: 'window', label: '창문', supports: ['open'] },
    ],
  },
  intruderStages: [
    { x: 175, y: 420, s: 150 },
    { x: 330, y: 445, s: 220 },
    { x: 480, y: 500, s: 330 },
  ],
  draw(g, st) {
    const L = st.lightsOut ? 0.38 : 1
    grad(g, 0, 0, W, 410, dim(0x2c2f2a, L), dim(0x191c17, L))
    grad(g, 0, 410, W, 130, dim(0x24261f, L), dim(0x121410, L))
    g.lineStyle(1, dim(0x3a3d34, L), 0.6)
    g.lineBetween(0, 410, 960, 410)

    // 창문 (뒷벽 우측) — 달빛. 개방 시 아래쪽 새시가 올라가 어두운 틈
    const winOpen = st.has('open', 'window')
    g.lineStyle(3, dim(0x4b4f45, L), 1)
    g.strokeRect(598, 108, 224, 196)
    g.fillStyle(0xaebfd8, st.lightsOut ? 0.22 : 0.13)
    g.fillRect(602, 112, 216, winOpen ? 92 : 188)
    if (winOpen) {
      g.fillStyle(0x02030a, 0.97)
      g.fillRect(602, 208, 216, 92)
    }
    g.lineStyle(1, dim(0x4b4f45, L), 1)
    g.lineBetween(710, 112, 710, 300)
    g.lineBetween(602, 206, 818, 206)
    // 커튼
    g.fillStyle(dim(0x2a3330, L), 0.9)
    g.fillRect(566, 100, 36, 214)

    // 액자 — 이동 시 크게 옆으로 + 기울어짐
    if (st.has('vanish', 'frame')) {
      ghostPatch(g, 244, 138, 126, 94)
    } else if (st.has('move', 'frame')) {
      g.save()
      g.translateCanvas(452, 196)
      g.rotateCanvas(-0.22)
      g.fillStyle(dim(0x3d4038, L), 1)
      g.fillRect(-63, -47, 126, 94)
      g.lineStyle(3, dim(0x585c50, L), 1)
      g.strokeRect(-63, -47, 126, 94)
      g.restore()
    } else {
      g.fillStyle(dim(0x3d4038, L), 1)
      g.fillRect(244, 138, 126, 94)
      g.lineStyle(3, dim(0x585c50, L), 1)
      g.strokeRect(244, 138, 126, 94)
    }

    // 이삿짐 상자
    if (st.has('vanish', 'boxes')) {
      ghostPatch(g, 92, 330, 150, 84)
    } else {
      g.fillStyle(dim(0x4a4336, L), 1)
      g.fillRect(92, 362, 88, 54)
      g.fillRect(128, 316, 76, 48)
      g.lineStyle(1, dim(0x5f5748, L), 1)
      g.strokeRect(92, 362, 88, 54)
      g.strokeRect(128, 316, 76, 48)
      g.lineBetween(92, 389, 180, 389)
    }

    // 의자 — 이동 시 반대편으로
    const cx = st.has('move', 'chair') ? 560 : 420
    g.lineStyle(5, dim(0x333630, L), 1)
    g.strokeRect(cx, 352, 62, 8)
    g.lineBetween(cx + 4, 360, cx + 4, 424)
    g.lineBetween(cx + 58, 360, cx + 58, 424)
    g.lineBetween(cx + 4, 352, cx + 4, 300)
    g.lineBetween(cx + 58, 352, cx + 58, 300)
    g.lineBetween(cx + 4, 300, cx + 58, 300)

    if (st.lightsOut) emergencyTint(g)
  },
}
