import type { NightConfig } from '../engine/types'

/**
 * 밸런스 규칙 (설계 비평 반영):
 * - escalationInterval ≥ (카메라 수 × 4초) × 1.5 — 순찰 한 바퀴 돌 시간은 보장
 * - 밤 1은 스크립트 오프닝: T+10s 복도 조명, T+32s 로비 침입자 (즉시 식별형)
 * - 밤 1 오탐 1회는 페널티 면제 (학습 보호)
 */
export const NIGHTS: NightConfig[] = [
  {
    night: 1,
    durationSec: 90,
    cameraIds: ['lobby', 'hallway', 'unit402'],
    allowedTypes: ['intruder', 'light', 'vanish'],
    maxSimultaneous: 1,
    baseSpawnInterval: [18, 26],
    firstSpawnAt: 50,
    escalationInterval: 20,
    erosionPerEscalation: 6,
    erosionRecoverOnResolve: 8,
    scripted: [
      { at: 10, roomId: 'hallway', type: 'light' },
      { at: 32, roomId: 'lobby', type: 'intruder' },
    ],
    falseGraceCount: 1,
  },
  {
    night: 2,
    durationSec: 105,
    cameraIds: ['lobby', 'hallway', 'unit402', 'parking'],
    allowedTypes: ['intruder', 'light', 'vanish', 'open', 'move'],
    maxSimultaneous: 2,
    baseSpawnInterval: [14, 21],
    firstSpawnAt: 8,
    escalationInterval: 24,
    erosionPerEscalation: 6,
    erosionRecoverOnResolve: 8,
  },
  {
    night: 3,
    durationSec: 120,
    cameraIds: ['lobby', 'hallway', 'unit402', 'parking', 'elevator'],
    allowedTypes: ['intruder', 'light', 'vanish', 'open', 'move', 'distort'],
    maxSimultaneous: 2,
    baseSpawnInterval: [12, 18],
    firstSpawnAt: 7,
    escalationInterval: 30,
    erosionPerEscalation: 7,
    erosionRecoverOnResolve: 7,
  },
  {
    night: 4,
    durationSec: 135,
    cameraIds: ['lobby', 'hallway', 'unit402', 'parking', 'elevator', 'rooftop'],
    allowedTypes: ['intruder', 'light', 'vanish', 'open', 'move', 'distort'],
    maxSimultaneous: 3,
    baseSpawnInterval: [10, 16],
    firstSpawnAt: 6,
    escalationInterval: 36,
    erosionPerEscalation: 7,
    erosionRecoverOnResolve: 6,
  },
  {
    night: 5,
    durationSec: 150,
    cameraIds: ['lobby', 'hallway', 'unit402', 'parking', 'elevator', 'rooftop'],
    allowedTypes: ['intruder', 'light', 'vanish', 'open', 'move', 'distort'],
    maxSimultaneous: 3,
    baseSpawnInterval: [10, 15],
    firstSpawnAt: 6,
    escalationInterval: 36,
    erosionPerEscalation: 7,
    erosionRecoverOnResolve: 6,
  },
]

/** 5일차: 이 시점(초)에 모든 이상이 일제히 사라지고 반전 시퀀스가 시작된다 */
export const NIGHT5_TWIST_AT = 55
