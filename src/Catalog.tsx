import { useEffect, useRef, useState } from 'react'
import { musicApi, type Album, type AudiusUser, type Song } from './api/music'
import { Artwork } from './Artwork'
import { formatTime, liveTracks, type Track } from './library'

type AlbumDetail = Awaited<ReturnType<typeof musicApi.albums.get>>
export function Catalog({ artistRequest, query, filter, catalog, onArtistTracks, onSearch }: { artistRequest: { id: string } | null; query: string; filter: string; catalog: Track[]; onArtistTracks: (tracks: Track[], artist: string) => void; onSearch: (query: string) => void }) {
  const panel = useRef<HTMLElement>(null)
  const [users, setUsers] = useState<AudiusUser[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [artist, setArtist] = useState<AudiusUser | null>(null)
  const [album, setAlbum] = useState<AlbumDetail | null>(null)
  const [message, setMessage] = useState('')
  const [albumMessage, setAlbumMessage] = useState('')
  const [artistMessage, setArtistMessage] = useState('')
  const [selection, setSelection] = useState<{ kind: 'artist' | 'album'; id: string } | null>(null)
  useEffect(() => {
    let active = true
    setSelection(null); setAlbum(null); setArtist(null); setMessage(''); setUsers([]); setAlbums([])
    setArtistMessage(''); setAlbumMessage('')
    const timer = setTimeout(() => {
      if (query.trim() && (filter === 'All' || filter === 'Artists')) {
        setArtistMessage('Searching artists…')
        musicApi.users.search(query, { limit: 12 }).then(items => { if (active) { setUsers(items); setArtistMessage(items.length ? '' : 'No artists found.') } }).catch(() => { if (active) setArtistMessage('Artist search is unavailable. Try again shortly.') })
      }
      if (query.trim() && (filter === 'All' || filter === 'Albums')) {
        setAlbumMessage('Searching albums…')
        musicApi.albums.search(query, { limit: 8 }).then(page => { if (active) { setAlbums(page.items); setAlbumMessage(page.items.length ? '' : 'No albums found.') } }).catch(() => { if (active) setAlbumMessage('Album search is unavailable. Try again shortly.') })
      }
    }, 350)
    return () => { active = false; clearTimeout(timer) }
  }, [query, filter])
  useEffect(() => { if (artistRequest) setSelection({ kind: 'artist', id: artistRequest.id }) }, [artistRequest])
  useEffect(() => {
    if (!selection) return
    let active = true
    setMessage('Loading details…'); setArtist(null); setAlbum(null)
    if (selection.kind === 'artist') {
      Promise.all([musicApi.users.get(selection.id), musicApi.users.tracks(selection.id, { limit: 50 })]).then(([profile, items]) => {
        if (active) { setArtist(profile); onArtistTracks(liveTracks(items), profile.name); setMessage('') }
      }).catch(() => { if (active) setMessage('Artist details could not be loaded. Please try again.') })
    } else {
      musicApi.albums.get(selection.id).then(item => { if (active) { setAlbum(item); setMessage('') } }).catch(() => { if (active) setMessage('Album details could not be loaded. Please try again.') })
    }
    return () => { active = false }
  }, [selection, onArtistTracks])
  useEffect(() => { if (selection) panel.current?.scrollIntoView({ block: 'nearest', behavior: 'instant' }) }, [selection, artist, album])
  const shownUsers = query.trim() ? users : [...new Map(catalog.filter(t => !t.id.startsWith('demoAudio')).map(t => [t.user.id, t.user])).values()].slice(0, 8)
  const credits = (item: Album | Song) => item['artist-credit']?.map(c => c.name + (c.joinphrase ?? '')).join('') || 'Unknown artist'
  return <>
    {(filter === 'All' || filter === 'Albums') && <section aria-label="Albums"><div className="section-heading"><div><p className="eyebrow">EXPLORE THE CATALOG</p><h2>Albums</h2></div><small>MusicBrainz · catalog information</small></div>
      {!query.trim() && <p className="empty">Search for an album or artist to explore releases and track listings.</p>}
      {albumMessage && <p role="status" className="muted">{albumMessage}</p>}
      <div className="album-grid">{albums.map((a, index) => <button className="album-card" key={a.id} onClick={() => setSelection({ kind: 'album', id: a.id })}><Artwork className="cover art-violet" urls={{ cover: musicApi.artwork.frontUrl(a.id) }} label={a.title.slice(0, 1)} /><strong>{a.title}</strong><small>{credits(a)} · {a.date?.slice(0, 4) || 'Date unknown'}</small><small>View album {index + 1}</small></button>)}</div>
    </section>}
    {(filter === 'All' || filter === 'Artists') && <section aria-label="Artists"><div className="section-heading"><div><p className="eyebrow">MEET THE SOUND</p><h2>Artists to explore</h2></div></div>
      {artistMessage && <p role="status" className="muted">{artistMessage}</p>}
      {!query.trim() && !shownUsers.length && <p className="empty">Search for an artist to explore their music.</p>}
      <div className="artist-grid">{shownUsers.map(a => <button className="artist-card" key={a.id} onClick={() => setSelection({ kind: 'artist', id: a.id })}><Artwork className="artist-portrait art-green" urls={a.profile_picture} label={a.name.slice(0, 2)} /><strong>{a.name}</strong><small>@{a.handle}</small></button>)}</div>
    </section>}
    {selection && <section ref={panel} className="detail-panel" aria-label="Catalog details"><button className="text-button close-details" onClick={() => { setSelection(null); setMessage(''); setArtist(null); setAlbum(null) }}>Close details ×</button>
      {message && <p role="status">{message}</p>}
      {artist && <><p className="eyebrow">ARTIST PROFILE</p><h2>{artist.name}</h2><p>@{artist.handle} {artist.location && `· ${artist.location}`}</p><p className="description">{artist.bio || 'This artist has not added a biography yet.'}</p><p>{artist.follower_count ?? 0} followers · {artist.track_count ?? 0} tracks</p><a className="chip" href={`https://audius.co/${encodeURIComponent(artist.handle)}`} target="_blank" rel="noreferrer">View on Audius ↗</a><p>Available tracks are shown in the song list below.</p></>}
      {album && <><p className="eyebrow">ALBUM INFORMATION</p><h2>{album.title}</h2><p>{credits(album)} · {album.date || 'Release date unknown'}</p><p className="muted">Catalog listings are metadata. Search a song to find an available Audius recording.</p><ol className="album-tracks">{album.media?.flatMap(m => m.tracks ?? []).map((t, i) => <li key={`${t.id}-${i}`}><span>{t.title} <small>{formatTime((t.recording.length ?? 0) / 1000)}</small></span><button className="chip" onClick={() => onSearch(`${t.title} ${credits(album)}`)}>Find audio</button></li>)}</ol><a className="text-button" href={`https://musicbrainz.org/release/${album.id}`} target="_blank" rel="noreferrer">Album on MusicBrainz ↗</a></>}
    </section>}
  </>
}
