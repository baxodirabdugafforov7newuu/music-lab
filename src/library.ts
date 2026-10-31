import type { AudiusTrack } from './api/music'

export type Track = AudiusTrack & { album: string; art: string }
export interface Playlist { name: string; tracks: Track[] }
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object'
export function isTrack(value: unknown): value is Track {
  return record(value) && typeof value.id === 'string' && /^[a-zA-Z0-9]+$/.test(value.id)
    && typeof value.title === 'string' && typeof value.duration === 'number' && Number.isFinite(value.duration) && value.duration >= 0
    && typeof value.album === 'string' && typeof value.art === 'string'
    && record(value.user) && typeof value.user.id === 'string' && typeof value.user.name === 'string' && typeof value.user.handle === 'string'
}
export const trackList = (value: unknown): value is Track[] => Array.isArray(value) && value.every(isTrack)
export const likeList = (value: unknown): value is string[] => Array.isArray(value) && value.every(v => typeof v === 'string')
export const playlistList = (value: unknown): value is Playlist[] => Array.isArray(value) && value.every(v => record(v) && typeof v.name === 'string' && !!v.name.trim() && v.name.length <= 80 && trackList(v.tracks))
export const isSample = (track: AudiusTrack) => track.id.startsWith('demoAudio')
export const canPlay = (track: AudiusTrack) => !isSample(track) && track.is_available !== false && track.is_streamable !== false && !track.is_stream_gated
export const liveTracks = (items: AudiusTrack[]): Track[] => items.map(t => ({ ...t, album: 'Audius', art: 'blue' })).filter(t => isTrack(t) && canPlay(t))
export const formatTime = (seconds: number) => {
  const value = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`
}
export function readSaved<T>(storage: Pick<Storage, 'getItem'>, key: string, fallback: T, validate: (value: unknown) => value is T): T {
  try { const value: unknown = JSON.parse(storage.getItem(key) ?? 'null'); return validate(value) ? value : fallback } catch { return fallback }
}
