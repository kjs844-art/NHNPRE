// Mulberry32 — deterministic seedable RNG so night runs are reproducible in tests.
export type Rng = () => number

export function createRng(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a += 0x6d2b79f5
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function pickWeighted<T>(rng: Rng, entries: Array<{ item: T; weight: number }>): T {
  const total = entries.reduce((s, e) => s + e.weight, 0)
  let roll = rng() * total
  for (const e of entries) {
    roll -= e.weight
    if (roll <= 0) return e.item
  }
  return entries[entries.length - 1].item
}
