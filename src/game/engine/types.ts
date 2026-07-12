export type AnomalyType = 'move' | 'vanish' | 'intruder' | 'light' | 'open' | 'distort'

export const ANOMALY_LABELS: Record<AnomalyType, string> = {
  move: '물체 이동',
  vanish: '물체 소실',
  intruder: '침입자',
  light: '조명 이상',
  open: '개방',
  distort: '화면 왜곡',
}

/** 인접 유형 상호 정답 인정 (판정 관용 규칙) */
export const TYPE_FORGIVENESS: Partial<Record<AnomalyType, AnomalyType[]>> = {
  move: ['vanish'],
  vanish: ['move'],
}

/** 비교 기억이 필요한 유형 — 플레이어가 한 번 본 방에만 스폰 */
export const COMPARISON_TYPES: AnomalyType[] = ['move', 'vanish', 'open']

export interface PropDef {
  id: string
  label: string
  supports: AnomalyType[]
}

export interface RoomMeta {
  id: string
  name: string
  camLabel: string
  props: PropDef[]
  /** room supports intruder appearances */
  intruder: boolean
  /** room supports light anomaly */
  light: boolean
}

export interface ActiveAnomaly {
  id: number
  roomId: string
  type: AnomalyType
  propId: string | null
  spawnedAt: number
  stage: number
  lastEscalationAt: number
}

export interface ScriptedSpawn {
  at: number
  roomId: string
  type: AnomalyType
  propId?: string
}

export interface NightConfig {
  night: number
  durationSec: number
  cameraIds: string[]
  allowedTypes: AnomalyType[]
  maxSimultaneous: number
  /** [min,max] seconds between spawns at difficulty 0.5 */
  baseSpawnInterval: [number, number]
  firstSpawnAt: number
  /** seconds between escalation ticks per anomaly — 순찰 1주기의 1.5배 이상 유지 */
  escalationInterval: number
  erosionPerEscalation: number
  erosionRecoverOnResolve: number
  /** 고정 연출 스폰 (튜토리얼 오프닝 등) */
  scripted?: ScriptedSpawn[]
  /** 처음 N회 오탐은 페널티 면제 (밤 1 학습 보호) */
  falseGraceCount?: number
}

export type NightEvent =
  | { kind: 'spawned'; anomaly: ActiveAnomaly }
  | { kind: 'escalated'; anomaly: ActiveAnomaly }
  | { kind: 'resolved'; anomaly: ActiveAnomaly; detectionSec: number }
  | { kind: 'false-report'; count: number; strike: boolean; graced: boolean }
  | { kind: 'near-miss' }
  | { kind: 'erosion'; value: number }
  | { kind: 'night-clear' }
  | { kind: 'night-failed' }

export interface NightSnapshot {
  elapsed: number
  clock: string
  erosion: number
  falseReports: number
  resolvedCount: number
  active: ActiveAnomaly[]
  over: boolean
}

/** hit: 정답 / near: 이상은 있으나 유형 오답 / none: 아무것도 없음 */
export type ReportResult = 'hit' | 'near' | 'none'
