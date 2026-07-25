/**
 * 순수 TS 밤 엔진 단위 테스트 — Node 내장 test runner + tsx로 실행한다.
 *   npm test
 * 프레임워크에 독립적인 엔진이므로 브라우저 없이 결정론적으로 검증 가능하다.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createRng, pickWeighted } from './rng.ts'
import { Director } from './director.ts'
import { NightEngine } from './night.ts'
import type { NightConfig, RoomMeta } from './types.ts'

/* ---------- RNG ---------- */

test('createRng: 같은 시드는 같은 수열을 낸다', () => {
  const a = createRng(123)
  const b = createRng(123)
  for (let i = 0; i < 20; i++) assert.equal(a(), b())
})

test('createRng: 다른 시드는 다른 수열을 낸다', () => {
  const a = createRng(1)
  const b = createRng(2)
  assert.notEqual(a(), b())
})

test('createRng: 출력은 [0,1) 범위', () => {
  const r = createRng(42)
  for (let i = 0; i < 1000; i++) {
    const v = r()
    assert.ok(v >= 0 && v < 1)
  }
})

test('pickWeighted: 가중치 0인 항목은 절대 뽑히지 않는다', () => {
  const r = createRng(7)
  const entries = [
    { item: 'a', weight: 0 },
    { item: 'b', weight: 1 },
  ]
  for (let i = 0; i < 200; i++) assert.equal(pickWeighted(r, entries), 'b')
})

/* ---------- Director ---------- */

test('Director: 이력이 없으면 skill은 0.5', () => {
  const d = new Director()
  assert.equal(d.skill, 0.5)
})

test('Director: 빠른 적중이 반복되면 skill이 오른다', () => {
  const d = new Director()
  for (let i = 0; i < 8; i++) d.recordHit(5)
  assert.ok(d.skill > 0.8, `skill=${d.skill}`)
})

test('Director: 오탐이 반복되면 skill이 기본값(0.5) 아래로 내려간다', () => {
  const d = new Director()
  for (let i = 0; i < 8; i++) d.recordFalse()
  // 적중이 전혀 없으므로 정확도 항이 0 → skill이 baseline보다 확실히 낮아진다
  assert.ok(d.skill < 0.35, `skill=${d.skill}`)
})

test('Director: 자비 규칙 — 침식도 70% 초과 시 스폰 간격이 늘어난다', () => {
  const d = new Director()
  const normal = d.spawnIntervalScale(0)
  const mercy = d.spawnIntervalScale(75)
  assert.ok(mercy > normal, `mercy=${mercy} normal=${normal}`)
})

test('Director: 동시 상한은 설정값을 넘지 않는다', () => {
  const d = new Director()
  for (let cap = 1; cap <= 4; cap++) {
    for (let p = 0; p <= 1; p += 0.25) {
      const c = d.simultaneousCap(cap, p)
      assert.ok(c >= 1 && c <= cap, `cap=${cap} p=${p} -> ${c}`)
    }
  }
})

/* ---------- NightEngine ---------- */

const ROOM_A: RoomMeta = {
  id: 'a',
  name: 'A',
  camLabel: 'CAM A',
  intruder: true,
  light: true,
  props: [
    { id: 'frame', label: '액자', supports: ['move', 'vanish'] },
    { id: 'door', label: '문', supports: ['open'] },
  ],
}
const ROOM_B: RoomMeta = {
  id: 'b',
  name: 'B',
  camLabel: 'CAM B',
  intruder: true,
  light: true,
  props: [{ id: 'plant', label: '화분', supports: ['move'] }],
}
const ROOMS = new Map<string, RoomMeta>([
  ['a', ROOM_A],
  ['b', ROOM_B],
])

function baseConfig(over: Partial<NightConfig> = {}): NightConfig {
  return {
    night: 1,
    durationSec: 100,
    cameraIds: ['a', 'b'],
    allowedTypes: ['intruder', 'light', 'vanish', 'open', 'move'],
    maxSimultaneous: 2,
    baseSpawnInterval: [5, 6],
    firstSpawnAt: 2,
    escalationInterval: 30,
    erosionPerEscalation: 6,
    erosionRecoverOnResolve: 6,
    ...over,
  }
}

test('NightEngine: 시작 스냅샷은 0 상태', () => {
  const e = new NightEngine(baseConfig(), ROOMS, 1)
  const s = e.snapshot()
  assert.equal(s.erosion, 0)
  assert.equal(s.resolvedCount, 0)
  assert.equal(s.active.length, 0)
  assert.equal(s.over, false)
})

test('NightEngine: scripted 스폰이 정확한 방·유형으로 뜬다', () => {
  const e = new NightEngine(
    baseConfig({ scripted: [{ at: 1, roomId: 'a', type: 'light' }] }),
    ROOMS,
    1,
  )
  const events = e.tick(1.1, 'b')
  const spawned = events.find((ev) => ev.kind === 'spawned')
  assert.ok(spawned && spawned.kind === 'spawned')
  assert.equal(spawned.anomaly.roomId, 'a')
  assert.equal(spawned.anomaly.type, 'light')
})

test('NightEngine: 정확한 유형 보고는 적중이고 침식도를 회복시킨다', () => {
  const e = new NightEngine(baseConfig({ scripted: [{ at: 1, roomId: 'a', type: 'light' }] }), ROOMS, 1)
  e.tick(1.1, 'b')
  // 방치로 약간 오른 침식도를 만들기 위해 조금 진행
  e.tick(2, 'b')
  const before = e.snapshot().erosion
  const { result } = e.report('a', 'light')
  assert.equal(result, 'hit')
  assert.ok(e.snapshot().erosion <= before, '적중 시 침식도가 오르지 않아야')
  assert.equal(e.snapshot().resolvedCount, 1)
})

test('NightEngine: 이상이 없는 방 보고는 완전 오탐(none)', () => {
  const e = new NightEngine(baseConfig(), ROOMS, 1)
  const { result } = e.report('b', 'intruder')
  assert.equal(result, 'none')
  assert.equal(e.snapshot().falseReports, 1)
})

test('NightEngine: move↔vanish 상호 정답 인정', () => {
  const e = new NightEngine(baseConfig({ scripted: [{ at: 1, roomId: 'a', type: 'move', propId: 'frame' }] }), ROOMS, 1)
  e.tick(1.1, 'b')
  // vanish로 보고해도 move가 인정된다
  const { result } = e.report('a', 'vanish')
  assert.equal(result, 'hit')
})

test('NightEngine: 이상은 있으나 유형이 다르면 near-miss (오탐 카운트 미포함)', () => {
  const e = new NightEngine(baseConfig({ scripted: [{ at: 1, roomId: 'a', type: 'light' }] }), ROOMS, 1)
  e.tick(1.1, 'b')
  const { result } = e.report('a', 'open')
  assert.equal(result, 'near')
  assert.equal(e.snapshot().falseReports, 0, 'near-miss는 오탐 카운트에 포함되지 않아야')
})

test('NightEngine: falseGraceCount 동안 오탐 페널티 면제', () => {
  const e = new NightEngine(baseConfig({ falseGraceCount: 1 }), ROOMS, 1)
  const { events } = e.report('a', 'intruder')
  const fr = events.find((ev) => ev.kind === 'false-report')
  assert.ok(fr && fr.kind === 'false-report' && fr.graced === true)
  assert.equal(e.snapshot().erosion, 0, '유예 중에는 침식도가 오르지 않아야')
})

test('NightEngine: 지속 방치는 결국 침식도 100% → night-failed', () => {
  const e = new NightEngine(
    baseConfig({ scripted: [{ at: 0.5, roomId: 'a', type: 'light' }, { at: 0.6, roomId: 'b', type: 'intruder' }] }),
    ROOMS,
    1,
  )
  let failed = false
  for (let i = 0; i < 400 && !failed; i++) {
    const events = e.tick(0.5, 'a')
    if (events.some((ev) => ev.kind === 'night-failed')) failed = true
  }
  assert.ok(failed, '전부 방치하면 배드엔딩에 도달해야')
  assert.ok(e.snapshot().erosion >= 100)
})

test('NightEngine: 즉시 처리를 반복하면 밤을 클리어한다', () => {
  const e = new NightEngine(baseConfig({ durationSec: 40 }), ROOMS, 99)
  let cleared = false
  for (let i = 0; i < 200 && !cleared; i++) {
    const events = e.tick(0.5, 'a')
    for (const ev of events) {
      if (ev.kind === 'spawned') e.report(ev.anomaly.roomId, ev.anomaly.type)
      if (ev.kind === 'night-clear') cleared = true
      assert.notEqual(ev.kind, 'night-failed', '즉시 처리하는데 실패하면 안 됨')
    }
  }
  assert.ok(cleared, '즉시 처리하면 밤을 클리어해야')
})

test('NightEngine: 결정론 — 같은 시드+같은 입력은 같은 결과', () => {
  const run = () => {
    const e = new NightEngine(baseConfig(), ROOMS, 555)
    const log: string[] = []
    for (let i = 0; i < 60; i++) {
      const events = e.tick(0.5, i % 2 === 0 ? 'a' : 'b')
      for (const ev of events) if (ev.kind === 'spawned') log.push(`${ev.anomaly.roomId}:${ev.anomaly.type}`)
    }
    return log.join(',')
  }
  assert.equal(run(), run())
})
