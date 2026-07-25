import { W, H, dim, grad, ghostPatch, emergencyTint } from './helpers'
import type { RoomDef } from './interiors'

/* ---------------- CAM 04 — 지하 주차장 ---------------- */

export const parking: RoomDef = {
  meta: {
    id: 'parking',
    name: '지하 주차장',
    camLabel: 'CAM 04 — 지하 주차장',
    intruder: true,
    light: true,
    props: [
      { id: 'car2', label: '차량', supports: ['move'] },
      { id: 'cones', label: '안전 콘', supports: ['vanish'] },
      { id: 'shutter', label: '셔터', supports: ['open'] },
    ],
  },
  intruderStages: [
    { x: 296, y: 430, s: 160 },
    { x: 470, y: 455, s: 230 },
    { x: 480, y: 505, s: 330 },
  ],
  draw(g, st) {
    const L = st.lightsOut ? 0.36 : 1
    grad(g, 0, 0, W, 130, dim(0x1c211f, L), dim(0x161b19, L))
    grad(g, 0, 130, W, 280, dim(0x22282a, L), dim(0x171c1e, L))
    grad(g, 0, 410, W, 130, dim(0x1e2426, L), dim(0x101415, L))
    // 천장 배관
    g.lineStyle(4, dim(0x2e3634, L), 1)
    g.lineBetween(0, 46, 960, 60)
    g.lineBetween(0, 84, 960, 78)
    // 주차선
    g.lineStyle(3, dim(0x9aa06a, L), 0.5)
    for (let i = 0; i < 4; i++) g.lineBetween(90 + i * 240, 420, 40 + i * 260, 540)

    // 셔터 (뒷벽) — 개방 시 절반 올라가 아래 어두운 틈
    const shOpen = st.has('open', 'shutter')
    g.fillStyle(dim(0x2b3234, L), 1)
    g.fillRect(380, 148, 208, 186)
    if (shOpen) {
      g.fillStyle(0x020404, 0.97)
      g.fillRect(386, 240, 196, 94)
      g.lineStyle(1, dim(0x454f4d, L), 1)
      for (let i = 0; i < 5; i++) g.lineBetween(386, 156 + i * 17, 582, 156 + i * 17)
    } else {
      g.lineStyle(1, dim(0x454f4d, L), 1)
      for (let i = 0; i < 10; i++) g.lineBetween(386, 156 + i * 17, 582, 156 + i * 17)
    }
    g.lineStyle(3, dim(0x454f4d, L), 1)
    g.strokeRect(380, 148, 208, 186)

    // 기둥 2개
    for (const px of [230, 660]) {
      g.fillStyle(dim(0x272e2c, L), 1)
      g.fillRect(px, 118, 74, 300)
      g.fillStyle(dim(0x8a8558, L), 0.7)
      g.fillRect(px, 330, 74, 26)
    }

    // 차량 1 (고정)
    g.fillStyle(dim(0x252b31, L), 1)
    g.fillRoundedRect(78, 344, 250, 62, 14)
    g.fillRoundedRect(128, 314, 150, 48, 16)
    g.fillStyle(dim(0x11151a, L), 1)
    g.fillCircle(136, 408, 20)
    g.fillCircle(272, 408, 20)

    // 차량 2 — 이동 시 기둥 옆까지 크게 이동
    const c2x = st.has('move', 'car2') ? 700 : 500
    g.fillStyle(dim(0x2b2a33, L), 1)
    g.fillRoundedRect(c2x, 352, 244, 58, 14)
    g.fillRoundedRect(c2x + 46, 324, 146, 46, 16)
    g.fillStyle(dim(0x11151a, L), 1)
    g.fillCircle(c2x + 54, 412, 19)
    g.fillCircle(c2x + 188, 412, 19)

    // 안전 콘 3개
    if (st.has('vanish', 'cones')) {
      ghostPatch(g, 400, 452, 130, 46)
    } else {
      for (let i = 0; i < 3; i++) {
        const bx = 408 + i * 46
        g.fillStyle(dim(0xa85a20, L), 1)
        g.fillTriangle(bx, 496, bx + 30, 496, bx + 15, 452)
        g.fillStyle(dim(0xc9c9c9, L), 0.9)
        g.fillRect(bx + 7, 478, 16, 7)
      }
    }

    if (st.lightsOut) {
      emergencyTint(g)
      g.fillStyle(0x8a1f1f, 0.5)
      g.fillRect(468, 128, 30, 10)
    }
  },
}

/* ---------------- CAM 05 — 엘리베이터 ---------------- */

export const elevator: RoomDef = {
  meta: {
    id: 'elevator',
    name: '엘리베이터',
    camLabel: 'CAM 05 — 엘리베이터',
    intruder: true,
    light: true,
    props: [
      { id: 'poster', label: '게시물', supports: ['move', 'vanish'] },
      { id: 'doors', label: '문', supports: ['open'] },
    ],
  },
  intruderStages: [
    { x: 300, y: 460, s: 230 },
    { x: 420, y: 490, s: 300 },
    { x: 480, y: 540, s: 420 },
  ],
  draw(g, st) {
    const L = st.lightsOut ? 0.3 : 1
    // 금속 내벽
    grad(g, 0, 0, W, H, dim(0x30363b, L), dim(0x181d21, L))
    g.fillStyle(dim(0x262c31, L), 1)
    g.fillRect(0, 0, 200, 540)
    g.lineStyle(1, dim(0x49525a, L), 0.7)
    g.lineBetween(200, 0, 200, 540)
    g.lineBetween(0, 300, 620, 300) // 핸드레일
    g.lineStyle(6, dim(0x525c66, L), 0.9)
    g.lineBetween(210, 310, 610, 310)

    // 층수 표시기
    g.fillStyle(dim(0x0d1114, L), 1)
    g.fillRect(430, 52, 104, 40)
    g.lineStyle(1, dim(0x4b555e, L), 1)
    g.strokeRect(430, 52, 104, 40)
    if (!st.lightsOut) {
      // '4' 세그먼트
      g.fillStyle(0xc94f2e, 0.95)
      g.fillRect(470, 60, 5, 12)
      g.fillRect(486, 60, 5, 24)
      g.fillRect(470, 72, 21, 5)
    }

    // 게시물 (안내 스티커)
    if (st.has('vanish', 'poster')) {
      ghostPatch(g, 268, 158, 108, 140)
    } else if (st.has('move', 'poster')) {
      g.save()
      g.translateCanvas(360, 250)
      g.rotateCanvas(0.35)
      g.fillStyle(dim(0xb8b4a4, L), 0.92)
      g.fillRect(-54, -70, 108, 140)
      g.restore()
    } else {
      g.fillStyle(dim(0xb8b4a4, L), 0.92)
      g.fillRect(268, 158, 108, 140)
      g.fillStyle(dim(0x3a3f36, L), 0.9)
      for (let i = 0; i < 5; i++) g.fillRect(280, 176 + i * 22, 84 - i * 12, 6)
    }

    // 문 (우측) — 개방 시 두 짝이 벌어지고 밖은 캄캄한 층
    const open = st.has('open', 'doors')
    g.lineStyle(3, dim(0x49525a, L), 1)
    g.strokeRect(640, 96, 236, 400)
    if (open) {
      g.fillStyle(0x010203, 0.97)
      g.fillRect(644, 100, 228, 392)
      g.fillStyle(dim(0x3b444c, L), 1)
      g.fillRect(644, 100, 34, 392)
      g.fillRect(838, 100, 34, 392)
    } else {
      g.fillStyle(dim(0x3b444c, L), 1)
      g.fillRect(644, 100, 228, 392)
      g.lineStyle(2, dim(0x21272c, L), 1)
      g.lineBetween(758, 100, 758, 492)
    }

    if (st.lightsOut) {
      emergencyTint(g)
      g.fillStyle(0x8a1f1f, 0.4)
      g.fillRect(430, 52, 104, 40)
    }
  },
}

/* ---------------- CAM 06 — 옥상 ---------------- */

export const rooftop: RoomDef = {
  meta: {
    id: 'rooftop',
    name: '옥상',
    camLabel: 'CAM 06 — 옥상',
    intruder: true,
    light: false, // 옥상엔 소등될 조명이 없다
    props: [
      { id: 'chair', label: '플라스틱 의자', supports: ['move', 'vanish'] },
      { id: 'roofdoor', label: '옥상 출입문', supports: ['open'] },
    ],
  },
  intruderStages: [
    { x: 205, y: 300, s: 130 },
    { x: 430, y: 440, s: 210 },
    { x: 480, y: 505, s: 320 },
  ],
  draw(g, st) {
    // 밤하늘 + 도시 불빛
    grad(g, 0, 0, W, 310, 0x0a1018, 0x1b2733)
    g.fillStyle(0xd8e3ee, 0.8)
    g.fillCircle(818, 86, 26) // 달
    g.fillStyle(0x0a1018, 0.35)
    g.fillCircle(828, 78, 22)
    // 지평선 건물 실루엣
    g.fillStyle(0x0c1219, 1)
    for (let i = 0; i < 8; i++) {
      const bw = 60 + ((i * 37) % 70)
      g.fillRect(i * 128, 240 - ((i * 53) % 60), bw, 80 + ((i * 53) % 60))
    }
    // 창문 불빛 몇 개
    g.fillStyle(0xc9b46a, 0.5)
    g.fillRect(90, 216, 6, 8)
    g.fillRect(410, 196, 6, 8)
    g.fillRect(700, 226, 6, 8)

    // 옥상 바닥
    grad(g, 0, 300, W, 240, 0x232a26, 0x11150f)
    // 난간
    g.lineStyle(3, 0x39443c, 1)
    g.lineBetween(0, 308, 960, 308)
    for (let i = 0; i < 13; i++) g.lineBetween(i * 80, 308, i * 80, 336)

    // 물탱크
    g.fillStyle(0x2c3733, 1)
    g.fillRect(120, 180, 160, 96)
    g.fillEllipse(200, 180, 160, 34)
    g.lineStyle(4, 0x232c28, 1)
    g.lineBetween(140, 276, 132, 330)
    g.lineBetween(260, 276, 268, 330)

    // 안테나
    g.lineStyle(2, 0x39443c, 1)
    g.lineBetween(600, 306, 600, 168)
    g.lineBetween(600, 190, 640, 172)
    g.lineBetween(600, 214, 560, 194)

    // 출입문 구조물 — 개방 시 어두운 틈
    const dOpen = st.has('open', 'roofdoor')
    g.fillStyle(0x272f2a, 1)
    g.fillRect(690, 216, 180, 168)
    g.fillTriangle(690, 216, 870, 216, 780, 186)
    if (dOpen) {
      g.fillStyle(0x010302, 0.97)
      g.fillRect(742, 246, 76, 138)
      g.lineStyle(2, 0x39443c, 1)
      g.strokeRect(742, 246, 76, 138)
    } else {
      g.fillStyle(0x1b221e, 1)
      g.fillRect(742, 246, 76, 138)
      g.lineStyle(1, 0x39443c, 1)
      g.strokeRect(742, 246, 76, 138)
      g.fillStyle(0x4a554d, 1)
      g.fillCircle(806, 318, 3)
    }

    // 플라스틱 의자 — 위치가 확 바뀌거나, 사라진다
    if (st.has('vanish', 'chair')) {
      ghostPatch(g, 420, 420, 76, 74)
    } else {
      const chx = st.has('move', 'chair') ? 570 : 428
      g.lineStyle(5, 0x4a5049, 1)
      g.strokeRect(chx, 428, 58, 8)
      g.lineBetween(chx + 5, 436, chx + 2, 492)
      g.lineBetween(chx + 53, 436, chx + 56, 492)
      g.lineBetween(chx + 5, 428, chx + 5, 384)
      g.lineBetween(chx + 53, 428, chx + 53, 384)
      g.lineBetween(chx + 5, 384, chx + 53, 384)
    }
  },
}
