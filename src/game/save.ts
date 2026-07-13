export interface SaveData {
  name: string
  unlockedNight: number
  muted: boolean
}

const KEY = 'allclear-v1'

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SaveData>
      return {
        name: typeof parsed.name === 'string' ? parsed.name.slice(0, 10) : '',
        unlockedNight: Math.min(5, Math.max(1, Math.floor(Number(parsed.unlockedNight)) || 1)),
        muted: !!parsed.muted,
      }
    }
  } catch {
    /* corrupted save — start fresh */
  }
  return { name: '', unlockedNight: 1, muted: false }
}

export function persistSave(data: SaveData) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    /* storage unavailable (private mode 등) — 게임은 계속 동작 */
  }
}
