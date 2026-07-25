import { W, H, grad, type G } from './helpers'

/**
 * CAM 07 — 관제실. 엔진의 스폰 시스템에서 완전히 제외된 스크립트 전용 씬.
 *
 * 규칙: 화면 속 인물은 '보고 있는 동안' 절대 움직이지 않는다.
 * 플레이어가 다른 카메라를 봤다 돌아올 때마다 stage가 하나씩 진행된다.
 *   stage 0: 책상 앞 뒷모습, 미동도 없음
 *   stage 1: 고개가 옆으로 기울어져 있음
 *   stage 2: 몸이 이쪽으로 돌아 있음 — 창백한 얼굴, 이목구비 없음
 *   stage 3: 의자가 비어 있다
 */
export function drawControlRoom(g: G, stage: number) {
  grad(g, 0, 0, W, H, 0x14171c, 0x08090c)

  // 모니터월 (2행 × 3열) — 각각 미묘하게 다른 빛
  const tints = [0x233029, 0x2a2633, 0x1f2b33, 0x33291f, 0x203324, 0x2b2b1f]
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 3; c++) {
      const mx = 272 + c * 146
      const my = 108 + r * 112
      g.fillStyle(0x0a0c0f, 1)
      g.fillRect(mx - 4, my - 4, 136, 100)
      g.fillStyle(tints[r * 3 + c], 0.85)
      g.fillRect(mx, my, 128, 92)
      g.fillStyle(0xffffff, 0.05)
      g.fillRect(mx, my, 128, 30)
    }
  }

  // 가운데 아래 모니터: 미장아빔 — CAM 07 화면 속에 또 CAM 07
  const cx = 272 + 146, cy = 220
  g.fillStyle(0x10141a, 1)
  g.fillRect(cx, cy, 128, 92)
  // 축소된 모니터월
  g.fillStyle(0x1d2830, 0.9)
  for (let r = 0; r < 2; r++)
    for (let c = 0; c < 3; c++) g.fillRect(cx + 26 + c * 28, cy + 12 + r * 20, 22, 14)
  // 축소된 책상과 뒷모습
  g.fillStyle(0x141920, 1)
  g.fillRect(cx + 24, cy + 62, 80, 12)
  if (stage < 3) {
    g.fillStyle(0x04060a, 1)
    g.fillEllipse(cx + 64, cy + 60, 18, 22)
    g.fillCircle(cx + 64, cy + 46, 7)
  }
  // 그 화면 속 화면 (2단계 깊이)
  g.fillStyle(0x0c1116, 1)
  g.fillRect(cx + 44, cy + 22, 40, 26)

  // 책상
  grad(g, 130, 378, 700, 84, 0x1c2126, 0x101317)
  g.fillStyle(0x0c0f12, 1)
  g.fillRect(130, 458, 700, 10)
  // 책상 위 구겨진 근무일지 4장 (4주기의 증거)
  g.fillStyle(0x9a9484, 0.5)
  for (let i = 0; i < 4; i++) g.fillRect(196 + i * 34, 396 + (i % 2) * 8, 26, 18)
  // 식어버린 컵
  g.fillStyle(0x2a2f35, 1)
  g.fillRect(700, 386, 26, 30)

  // 의자와 인물
  const chairX = 480
  if (stage === 3) {
    // 비어 있는 의자 — 약간 돌아가 있다
    g.save()
    g.translateCanvas(chairX, 420)
    g.rotateCanvas(0.4)
    drawChair(g)
    g.restore()
  } else {
    g.save()
    g.translateCanvas(chairX, 420)
    drawChair(g)
    g.restore()

    if (stage === 0) {
      // 뒷모습
      g.fillStyle(0x04060a, 1)
      g.fillEllipse(chairX, 352, 96, 130)
      g.fillCircle(chairX, 282, 34)
    } else if (stage === 1) {
      // 고개가 기울어짐
      g.fillStyle(0x04060a, 1)
      g.fillEllipse(chairX, 352, 96, 130)
      g.fillCircle(chairX + 26, 288, 34)
    } else {
      // 몸이 이쪽으로 — 창백한 얼굴, 이목구비 없음
      g.fillStyle(0x04060a, 1)
      g.fillEllipse(chairX, 348, 110, 138)
      g.fillCircle(chairX, 278, 36)
      g.fillStyle(0xcfc4b8, 0.92)
      g.fillEllipse(chairX, 280, 46, 58)
    }
  }

  // 방 전체를 누르는 어둠
  g.fillStyle(0x000000, 0.25)
  g.fillRect(0, 0, W, H)
}

function drawChair(g: G) {
  g.fillStyle(0x14181d, 1)
  g.fillRect(-52, -60, 104, 96) // 등받이
  g.fillRect(-58, 34, 116, 16) // 좌판
  g.lineStyle(6, 0x0e1114, 1)
  g.lineBetween(0, 50, 0, 92)
  g.lineBetween(-36, 108, 36, 108)
  g.lineBetween(-36, 108, -36, 100)
  g.lineBetween(36, 108, 36, 100)
}
