import type { Album, Artist, AudiusTrack } from '../api/music'

// Local fixtures only. Catalog metadata and audio IDs remain separate for future integration.
export const artists: (Artist & { art: string })[] = [
  { id: '10000000-0000-4000-8000-000000000001', name: 'Luna Bay', country: 'UK', art: 'violet' },
  { id: '10000000-0000-4000-8000-000000000002', name: 'The Slow Hours', country: 'US', art: 'amber' },
  { id: '10000000-0000-4000-8000-000000000003', name: 'Kairo', country: 'JP', art: 'blue' },
  { id: '10000000-0000-4000-8000-000000000004', name: 'Olive Street', country: 'AU', art: 'green' },
]
export const albums: (Album & { artist: string; date: string; art: string; number: string })[] = [
  { id: '20000000-0000-4000-8000-000000000001', title: 'After Hours', artist: 'Luna Bay', date: '2026-01-01', art: 'violet', number: '01' },
  { id: '20000000-0000-4000-8000-000000000002', title: 'Golden Days', artist: 'The Slow Hours', date: '2025-01-01', art: 'amber', number: '02' },
  { id: '20000000-0000-4000-8000-000000000003', title: 'Blue in Motion', artist: 'Kairo', date: '2026-01-01', art: 'blue', number: '03' },
  { id: '20000000-0000-4000-8000-000000000004', title: 'Soft Focus', artist: 'Olive Street', date: '2025-01-01', art: 'green', number: '04' },
]
export const tracks: (AudiusTrack & { album: string; art: string })[] = [
  { id: 'demoAudio1', title: 'Midnight Somewhere', duration: 224, user: { id: 'demoUser1', name: 'Luna Bay', handle: 'lunabay' }, album: 'After Hours', art: 'violet' },
  { id: 'demoAudio2', title: 'Sun Through the Blinds', duration: 198, user: { id: 'demoUser2', name: 'The Slow Hours', handle: 'slowhours' }, album: 'Golden Days', art: 'amber' },
  { id: 'demoAudio3', title: 'Drift', duration: 256, user: { id: 'demoUser3', name: 'Kairo', handle: 'kairo' }, album: 'Blue in Motion', art: 'blue' },
  { id: 'demoAudio4', title: 'Nothing in a Hurry', duration: 187, user: { id: 'demoUser4', name: 'Olive Street', handle: 'olivestreet' }, album: 'Soft Focus', art: 'green' },
  { id: 'demoAudio5', title: 'Last Train Home', duration: 213, user: { id: 'demoUser1', name: 'Luna Bay', handle: 'lunabay' }, album: 'After Hours', art: 'violet' },
]
