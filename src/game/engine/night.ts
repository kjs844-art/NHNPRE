import { createRng, pickWeighted, type Rng } from './rng'
import { Director } from './director'
import {
  COMPARISON_TYPES,
  TYPE_FORGIVENESS,
  type ActiveAnomaly,
  type AnomalyType,
  type NightConfig,
  type NightEvent,
  type NightSnapshot,
  type ReportResult,
  type RoomMeta,
} from './types'

const INTRUDER_MAX_STAGE = 2
/** 방치 지속 침식: 활성 이상 1건당 초당 % */
const DRAIN_PER_ACTIVE = 0.55
/** 카메라 앞까지 온 침입자의 추가 침식: 초당 % — 방치하면 곧 끝난다 */
const INTRUDER_FINAL_DRAIN = 1.0

/**
 * 밤 한 판의 전체 상태를 관리하는 순수 TS 상태머신.
 * tick(dt)마다 스폰/에스컬레이션/종료를 판단해 이벤트 목록을 돌려준다.
 * 렌더러(Phaser)와 UI(React)는 이벤트와 snapshot()만 consume한다.
 *
 * 규칙 요약 (DESIGN.md):
 * - 같은 틱에서 배드엔딩 판정이 밤 종료 판정보다 우선한다.
 * - 비교 기억형 유형(move/vanish/open)은 플레이어가 한 번 이상 본 방에만 스폰.
 * - 현재 보고 있는 방에는 즉시 식별형(light/distort)만 스폰 가능.
 * - 보고 1회 = 매칭되는 이상 중 가장 오래된 1건 해결.
 * - move↔vanish는 상호 정답 인정.
 * - 침식도 70% 초과 시 자비 규칙: 스폰 지연 + 에스컬레이션 감속.
 */
export class NightEngine {
  readonly director = new Director()
  private rng: Rng
  private elapsed = 0
  private erosion = 0
  private falseReports = 0
  private resolvedCount = 0
  private active: ActiveAnomaly[] = []
  private nextSpawnAt: number
  private nextId = 1
  private over = false
  private spawningFrozen = false
  private observedRooms = new Set<string>()
  private scriptedQueue: Array<{ at: number; roomId: string; type: AnomalyType; propId?: string }>
  private config: NightConfig
  private rooms: Map<string, RoomMeta>

  constructor(config: NightConfig, rooms: Map<string, RoomMeta>, seed: number) {
    this.config = config
    this.rooms = rooms
    this.rng = createRng(seed)
    this.nextSpawnAt = config.firstSpawnAt
    this.scriptedQueue = [...(config.scripted ?? [])].sort((a, b) => a.at - b.at)
  }

  /** 엔딩 시퀀스 등 연출 중 스폰 정지 */
  freezeSpawning(frozen: boolean) {
    this.spawningFrozen = frozen
  }

  /** 반전 연출: 모든 이상이 소리 없이 '정상'으로 돌아간다 */
  clearActive() {
    this.active = []
  }

  private mercy(): boolean {
    return this.erosion > 70
  }

  tick(dtSec: number, viewedRoomId: string): NightEvent[] {
    if (this.over) return []
    const events: NightEvent[] = []
    this.elapsed += dtSec
    this.observedRooms.add(viewedRoomId)

    // 에스컬레이션: 방치된 이상은 침식도를 갉아먹고, 침입자는 다가온다
    const escInterval = this.config.escalationInterval * (this.mercy() ? 1.5 : 1)
    for (const a of this.active) {
      if (this.elapsed - a.lastEscalationAt >= escInterval) {
        a.lastEscalationAt = this.elapsed
        if (a.type === 'intruder' && a.stage < INTRUDER_MAX_STAGE) {
          a.stage += 1
        }
        // 카메라 앞까지 온 침입자는 두 배로 갉아먹는다
        const mult = a.type === 'intruder' && a.stage >= INTRUDER_MAX_STAGE ? 2 : 1
        this.erosion = Math.min(100, this.erosion + this.config.erosionPerEscalation * mult)
        events.push({ kind: 'escalated', anomaly: { ...a } })
        events.push({ kind: 'erosion', value: this.erosion })
      }
    }

    // 방치 지속 침식 — 이벤트는 만들지 않는다 (HUD는 snapshot으로 읽는다)
    if (this.active.length > 0) {
      let drainRate = DRAIN_PER_ACTIVE * this.active.length
      for (const a of this.active) {
        if (a.type === 'intruder' && a.stage >= INTRUDER_MAX_STAGE) drainRate += INTRUDER_FINAL_DRAIN
      }
      this.erosion = Math.min(100, this.erosion + dtSec * drainRate)
    }

    // 배드엔딩 판정이 밤 종료 판정보다 우선
    if (this.erosion >= 100) {
      this.over = true
      events.push({ kind: 'night-failed' })
      return events
    }

    if (this.elapsed >= this.config.durationSec) {
      this.over = true
      events.push({ kind: 'night-clear' })
      return events
    }

    // 고정 연출 스폰 (동시 상한 무시)
    while (this.scriptedQueue.length > 0 && this.elapsed >= this.scriptedQueue[0].at) {
      const s = this.scriptedQueue.shift()!
      const anomaly: ActiveAnomaly = {
        id: this.nextId++,
        roomId: s.roomId,
        type: s.type,
        propId: s.propId ?? null,
        spawnedAt: this.elapsed,
        stage: 0,
        lastEscalationAt: this.elapsed,
      }
      this.active.push(anomaly)
      events.push({ kind: 'spawned', anomaly: { ...anomaly } })
    }

    // 랜덤 스폰
    const progress = this.elapsed / this.config.durationSec
    const cap = this.director.simultaneousCap(this.config.maxSimultaneous, progress)
    if (
      !this.spawningFrozen &&
      this.elapsed >= this.nextSpawnAt &&
      this.active.length < cap &&
      progress < 0.92 // 밤이 거의 끝나갈 때는 새로 만들지 않는다
    ) {
      const spawned = this.spawn(viewedRoomId)
      if (spawned) events.push({ kind: 'spawned', anomaly: { ...spawned } })
      const [min, max] = this.config.baseSpawnInterval
      const base = min + this.rng() * (max - min)
      this.nextSpawnAt = this.elapsed + base * this.director.spawnIntervalScale(this.erosion)
    }

    return events
  }

  private spawn(viewedRoomId: string): ActiveAnomaly | null {
    const candidates = this.config.cameraIds
      .map((id) => this.rooms.get(id))
      .filter((r): r is RoomMeta => !!r)
    if (candidates.length === 0) return null

    // 변화는 안 볼 때 일어난다: 보고 있는 방은 가중치를 크게 낮춘다
    const roomEntries = candidates.map((r) => ({
      item: r,
      weight: r.id === viewedRoomId ? 0.5 : 3,
    }))
    for (let attempt = 0; attempt < 8; attempt++) {
      const room = pickWeighted(this.rng, roomEntries)
      const allowed = this.availableTypesIn(room, room.id === viewedRoomId)
      if (allowed.length === 0) continue
      const type = pickWeighted(this.rng, this.director.typeWeights(allowed))
      const propId = this.pickProp(room, type)
      if (type !== 'intruder' && type !== 'light' && type !== 'distort' && propId === null)
        continue
      const anomaly: ActiveAnomaly = {
        id: this.nextId++,
        roomId: room.id,
        type,
        propId,
        spawnedAt: this.elapsed,
        stage: 0,
        lastEscalationAt: this.elapsed,
      }
      this.active.push(anomaly)
      return anomaly
    }
    return null
  }

  private availableTypesIn(room: RoomMeta, isViewed: boolean): AnomalyType[] {
    const activeInRoom = this.active.filter((a) => a.roomId === room.id)
    return this.config.allowedTypes.filter((t) => {
      // 같은 방에 같은 유형 중복 금지
      if (activeInRoom.some((a) => a.type === t)) return false
      // 현재 보고 있는 방에는 즉시 식별형만 (물체가 눈앞에서 사라지는 건 부자연)
      if (isViewed && t !== 'light' && t !== 'distort') return false
      // 비교 기억형은 플레이어가 한 번 본 방에만 (baseline 보장)
      if (COMPARISON_TYPES.includes(t) && !this.observedRooms.has(room.id)) return false
      if (t === 'intruder') return room.intruder
      if (t === 'light') return room.light
      if (t === 'distort') return true
      return room.props.some(
        (p) => p.supports.includes(t) && !activeInRoom.some((a) => a.propId === p.id),
      )
    })
  }

  private pickProp(room: RoomMeta, type: AnomalyType): string | null {
    if (type === 'intruder' || type === 'light' || type === 'distort') return null
    const activeProps = new Set(
      this.active.filter((a) => a.roomId === room.id && a.propId).map((a) => a.propId),
    )
    const options = room.props.filter(
      (p) => p.supports.includes(type) && !activeProps.has(p.id),
    )
    if (options.length === 0) return null
    return options[Math.floor(this.rng() * options.length)].id
  }

  /**
   * 보고 판정. 정답 조건 = 올바른 카메라 + 올바른 유형(관용 규칙 포함).
   * 매칭되는 이상이 여러 건이면 가장 오래된 것을 해결한다.
   */
  report(roomId: string, type: AnomalyType): { result: ReportResult; events: NightEvent[] } {
    if (this.over) return { result: 'none', events: [] }
    const events: NightEvent[] = []
    const accepted = [type, ...(TYPE_FORGIVENESS[type] ?? [])]
    const idx = this.active.findIndex((a) => a.roomId === roomId && accepted.includes(a.type))
    if (idx >= 0) {
      const [anomaly] = this.active.splice(idx, 1)
      const detectionSec = this.elapsed - anomaly.spawnedAt
      this.resolvedCount += 1
      this.director.recordHit(detectionSec)
      this.erosion = Math.max(0, this.erosion - this.config.erosionRecoverOnResolve)
      events.push({ kind: 'resolved', anomaly: { ...anomaly }, detectionSec })
      events.push({ kind: 'erosion', value: this.erosion })
      return { result: 'hit', events }
    }

    // 이상은 있는데 유형이 틀림 — 절반 페널티, 오탐 카운트에는 미포함
    const anyInRoom = this.active.some((a) => a.roomId === roomId)
    if (anyInRoom) {
      this.director.recordFalse()
      this.erosion = Math.min(100, this.erosion + 3)
      events.push({ kind: 'near-miss' })
      events.push({ kind: 'erosion', value: this.erosion })
      if (this.erosion >= 100) {
        this.over = true
        events.push({ kind: 'night-failed' })
      }
      return { result: 'near', events }
    }

    // 완전 오탐
    this.falseReports += 1
    this.director.recordFalse()
    const graced = this.falseReports <= (this.config.falseGraceCount ?? 0)
    const strike = !graced && this.falseReports % 3 === 0
    if (!graced) {
      this.erosion = Math.min(100, this.erosion + (strike ? 14 : 4))
    }
    events.push({ kind: 'false-report', count: this.falseReports, strike, graced })
    events.push({ kind: 'erosion', value: this.erosion })
    if (this.erosion >= 100) {
      this.over = true
      events.push({ kind: 'night-failed' })
    }
    return { result: 'none', events }
  }

  snapshot(): NightSnapshot {
    // 00:00 → 06:00 게임 내 시계
    const frac = Math.min(1, this.elapsed / this.config.durationSec)
    const totalMin = Math.floor(frac * 360)
    const hh = String(Math.floor(totalMin / 60)).padStart(2, '0')
    const mm = String(totalMin % 60).padStart(2, '0')
    return {
      elapsed: this.elapsed,
      clock: `${hh}:${mm}`,
      erosion: this.erosion,
      falseReports: this.falseReports,
      resolvedCount: this.resolvedCount,
      active: this.active.map((a) => ({ ...a })),
      over: this.over,
    }
  }
}
