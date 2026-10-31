/** Public, read-only music clients. No credentials required for these operations. */
export interface Artist { id: string; name: string; country?: string; disambiguation?: string }
export interface Credit { name: string; joinphrase?: string; artist: Artist }
export interface Song { id: string; title: string; length?: number; 'artist-credit'?: Credit[] }
export interface Album { id: string; title: string; date?: string; 'artist-credit'?: Credit[] }
export interface Page<T> { items: T[]; total: number; offset: number }
export interface SearchOptions { limit?: number; offset?: number }
export interface AudiusUser {
  id: string; name: string; handle: string; bio?: string; location?: string;
  follower_count?: number; track_count?: number; profile_picture?: Record<string, string> | null;
}
export interface AudiusTrack {
  id: string; title: string; duration: number; user: AudiusUser;
  is_streamable?: boolean; is_stream_gated?: boolean;
  artwork?: Record<string, string> | null;
  description?: string; genre?: string; mood?: string; release_date?: string;
  play_count?: number; permalink?: string; is_available?: boolean;
}
export class MusicApiError extends Error {
  status?: number
  constructor(message: string, status?: number) { super(message); this.name = 'MusicApiError'; this.status = status }
}
const mbid = (id: string) => {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) throw new TypeError('Expected a MusicBrainz UUID')
  return id
}
const text = (value: string) => {
  if (!value.trim()) throw new TypeError('Search text must not be empty')
  return value.trim()
}
function pagination({ limit = 20, offset = 0 }: SearchOptions = {}) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100 || !Number.isInteger(offset) || offset < 0) throw new RangeError('limit must be 1–100; offset must be a nonnegative integer')
  return { limit: String(limit), offset: String(offset) }
}
export function createMusicApi(options: { fetch?: typeof fetch; timeoutMs?: number; audiusBaseUrl?: string; appName?: string; apiKey?: string } = {}) {
  const fetcher = options.fetch ?? globalThis.fetch.bind(globalThis)
  const base = new URL(options.audiusBaseUrl ?? 'https://api.audius.co/v1/')
  if (!['http:', 'https:'].includes(base.protocol) || base.username || base.password || base.search || base.hash) throw new TypeError('Expected an HTTP API base URL without credentials, query or fragment')
  base.pathname = base.pathname.replace(/\/?$/, '/')
  let queue: Promise<unknown> = Promise.resolve()
  let lastStart = 0
  async function json<T>(url: URL): Promise<T> {
    const response = await fetcher(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(options.timeoutMs ?? 10000) })
    if (!response.ok) throw new MusicApiError(`Music provider returned HTTP ${response.status}`, response.status)
    return response.json() as Promise<T>
  }
  function mb<T>(path: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`https://musicbrainz.org/ws/2/${path}`)
    url.search = new URLSearchParams({ ...params, fmt: 'json' }).toString()
    // Serialize calls and space starts by >1 second, including after failures.
    const request = queue.then(async () => {
      await new Promise(resolve => setTimeout(resolve, Math.max(0, 1100 - (Date.now() - lastStart))))
      lastStart = Date.now()
      return json<T>(url)
    })
    queue = request.catch(() => undefined)
    return request
  }
  async function search<T>(entity: string, key: string, query: string, opts?: SearchOptions): Promise<Page<T>> {
    // Quote and escape user text rather than accepting Lucene query operators.
    const escaped = text(query).replace(/[\\"]/g, '\\$&')
    const page = pagination(opts)
    const data = await mb<Record<string, unknown>>(entity, { query: `"${escaped}"`, ...page })
    return { items: data[key] as T[], total: data.count as number, offset: Number(page.offset) }
  }
  const audiusId = (id: string) => {
    if (!/^[a-zA-Z0-9]+$/.test(id)) throw new TypeError('Expected an Audius ID')
    return id
  }
  async function audius<T>(path: string, params: Record<string, string> = {}) {
    const url = audiusUrl(path, params)
    const result = await json<{ data: T }>(url)
    if (result.data === undefined || result.data === null) throw new MusicApiError('Music provider returned invalid data')
    return result.data
  }
  function audiusUrl(path: string, params: Record<string, string> = {}) {
    const url = new URL(path, base)
    url.search = new URLSearchParams({ ...(options.appName ? { app_name: options.appName } : {}), ...(options.apiKey ? { api_key: options.apiKey } : {}), ...params }).toString()
    return url
  }
  return {
    songs: {
      search: (query: string, opts?: SearchOptions) => search<Song>('recording', 'recordings', query, opts),
      get: (id: string) => mb<Song & { releases?: Album[] }>(`recording/${mbid(id)}`, { inc: 'artists+releases' }),
    },
    artists: {
      search: (query: string, opts?: SearchOptions) => search<Artist>('artist', 'artists', query, opts),
      get: (id: string) => mb<Artist>(`artist/${mbid(id)}`),
      albums: async (id: string, opts?: SearchOptions): Promise<Page<Album>> => {
        const page = pagination(opts)
        const result = await mb<{ releases: Album[]; 'release-count': number }>('release', { artist: mbid(id), ...page })
        return { items: result.releases, total: result['release-count'], offset: Number(page.offset) }
      },
    },
    albums: {
      search: (query: string, opts?: SearchOptions) => search<Album>('release', 'releases', query, opts),
      get: (id: string) => mb<Album & { media?: { position: number; tracks?: { id: string; title: string; position: number; recording: Song }[] }[] }>(`release/${mbid(id)}`, { inc: 'artists+recordings' }),
    },
    artwork: {
      frontUrl: (releaseId: string, size: 250 | 500 | 1200 = 500) => `https://coverartarchive.org/release/${mbid(releaseId)}/front-${size}`,
    },
    audio: {
      search: (query: string, opts?: SearchOptions) => audius<AudiusTrack[]>('tracks/search', { query: text(query), ...pagination(opts) }),
      trending: (opts?: SearchOptions) => audius<AudiusTrack[]>('tracks/trending', pagination(opts)),
      get: (id: string) => audius<AudiusTrack>(`tracks/${audiusId(id)}`),
      streamUrl: (id: string) => audiusUrl(`tracks/${audiusId(id)}/stream`).href,
    },
    users: {
      search: (query: string, opts?: SearchOptions) => audius<AudiusUser[]>('users/search', { query: text(query), ...pagination(opts) }),
      get: (id: string) => audius<AudiusUser>(`users/${audiusId(id)}`),
      tracks: (id: string, opts?: SearchOptions) => audius<AudiusTrack[]>(`users/${audiusId(id)}/tracks`, pagination(opts)),
    },
  }
}
// Share this singleton across screens to preserve MusicBrainz rate limiting.
export const musicApi = createMusicApi({
  audiusBaseUrl: import.meta.env?.VITE_AUDIUS_API_URL || undefined,
  appName: import.meta.env?.VITE_AUDIUS_APP_NAME || undefined,
  apiKey: import.meta.env?.VITE_AUDIUS_API_KEY || undefined,
})
