import type { RoomMeta } from '../engine/types'
import { lobby, hallway, unit402, type RoomDef } from './interiors'
import { parking, elevator, rooftop } from './facilities'

export type { RoomDef }
export { drawControlRoom } from './control'

export const ROOM_DEFS: RoomDef[] = [lobby, hallway, unit402, parking, elevator, rooftop]

export const ROOM_MAP = new Map<string, RoomDef>(ROOM_DEFS.map((r) => [r.meta.id, r]))

export const ROOM_META_MAP = new Map<string, RoomMeta>(
  ROOM_DEFS.map((r) => [r.meta.id, r.meta]),
)
