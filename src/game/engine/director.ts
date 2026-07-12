import type { AnomalyType } from './types'

/**
 * 알고리즘형 AI 디렉터 — 플레이어 퍼포먼스를 실시간 추적해 난이도를 조정한다.
 *
 * 입력 신호: 최근 판정 이력(적중/오탐), 평균 탐지 소요 시간, 현재 침식도
 * 출력: 스폰 간격 배율, 이상 유형 가중치(미묘함), 동시 이상 상한, 자비 규칙
 */
export class Director {
  private history: Array<{ hit: boolean; detectionSec: number }> = []

  recordHit(detectionSec: number) {
    this.history.push({ hit: true, detectionSec })
    if (this.history.length > 8) this.history.shift()
  }

  recordFalse() {
    this.history.push({ hit: false, detectionSec: 0 })
    if (this.history.length > 8) this.history.shift()
  }

  /** 0(고전 중) ~ 1(숙련) */
  get skill(): number {
    if (this.history.length === 0) return 0.5
    const hits = this.history.filter((h) => h.hit)
    const accuracy = hits.length / this.history.length
    const avgTime =
      hits.length > 0 ? hits.reduce((s, h) => s + h.detectionSec, 0) / hits.length : 20
    // 12초 안에 잡으면 빠름, 30초 넘으면 느림
    const speed = Math.max(0, Math.min(1, (30 - avgTime) / 18))
    return Math.max(0, Math.min(1, accuracy * 0.6 + speed * 0.4))
  }

  /** 스폰 간격 배율: 숙련일수록 촘촘하게 (0.7x), 고전 중이면 느슨하게 (1.35x) */
  spawnIntervalScale(erosion: number): number {
    const base = 1.35 - this.skill * 0.65
    // 자비 규칙: 침식도 70% 초과 시 스폰을 늦춰 좌절을 방지
    return erosion > 70 ? base * 1.5 : base
  }

  /**
   * 유형 가중치: 숙련 플레이어에겐 미묘한 변화(이동/소실/개방) 비중을 높이고,
   * 고전 중이면 명확한 변화(침입자/조명/왜곡) 비중을 높인다.
   */
  typeWeights(allowed: AnomalyType[]): Array<{ item: AnomalyType; weight: number }> {
    const subtle: AnomalyType[] = ['move', 'vanish', 'open']
    const s = this.skill
    return allowed.map((t) => ({
      item: t,
      weight: subtle.includes(t) ? 1 + s * 1.6 : 1 + (1 - s) * 1.2,
    }))
  }

  /** 동시 이상 상한: 밤 진행도와 실력에 비례해 상한까지 열어준다 */
  simultaneousCap(configCap: number, nightProgress: number): number {
    const openness = 0.4 + nightProgress * 0.4 + this.skill * 0.3
    return Math.max(1, Math.min(configCap, Math.round(configCap * openness)))
  }

  /** AI 활용 기술 문서용 상태 덤프 */
  snapshot() {
    return { skill: this.skill, window: [...this.history] }
  }
}
