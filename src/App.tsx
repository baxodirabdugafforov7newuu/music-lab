import { useEffect, useRef, useState } from 'react'
import { musicApi, type AudiusTrack } from './api/music'
import { useSavedState } from './useSavedState'
import { albums, artists, tracks } from './data/demo'

type View = 'Discover' | 'Search' | 'Your library'
type Filter = 'All' | 'Songs' | 'Albums' | 'Artists'
const filters: Filter[] = ['All', 'Songs', 'Albums', 'Artists']
const time = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

export default function App() {
  const [view, setView] = useState<View>('Discover')
  const [filter, setFilter] = useState<Filter>('All')
  const [query, setQuery] = useState('')
  type Track = AudiusTrack & { album: string; art: string }
  const [catalog, setCatalog] = useState<Track[]>(tracks)
  const [currentTrack, setCurrentTrack] = useState<Track>(tracks[0])
  const [queue, setQueue] = useState<Track[]>([])
  const [showQueue, setShowQueue] = useState(false)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState<'off' | 'all' | 'one'>('off')
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)
  const [status, setStatus] = useState('Loading live music…')
  const [history, setHistory] = useSavedState<Track[]>('music-lab-history', [])
  const [saved, setSaved] = useSavedState<Track[]>('music-lab-tracks', [])
  const [playlists, setPlaylists] = useSavedState<{ name: string; tracks: Track[] }[]>('music-lab-playlists', [])
  const [playlistName, setPlaylistName] = useState('')
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null)
  const [volume, setVolume] = useState(70)
  const [playing, setPlaying] = useState(false)
  const audio = useRef<HTMLAudioElement>(null)
  const request = useRef(0)
  const live = (items: AudiusTrack[]): Track[] => items.filter(t => t.is_streamable !== false && !t.is_stream_gated).map(t => ({ ...t, album: 'Audius', art: 'blue' }))
  useEffect(() => {
    const id = ++request.current
    const timer = window.setTimeout(() => {
      if (view === 'Your library') return
      setStatus('Loading live music…')
      const call = query.trim() ? musicApi.audio.search(query, { limit: 50 }) : musicApi.audio.trending({ limit: 50 })
      call.then(items => { if (request.current === id) { setCatalog(live(items)); setStatus(items.length ? 'Live music · Audius' : 'No live results. Try another search.') } })
        .catch(() => { if (request.current === id) { setCatalog(tracks); setStatus('Live music unavailable. Showing sample catalog; sample tracks have no audio.') } })
    }, 350)
    return () => { clearTimeout(timer); request.current++ }
  }, [query, view])
  useEffect(() => { if (audio.current) audio.current.volume = volume / 100 }, [volume])
  useEffect(() => {
    const element = audio.current
    if (!element) return
    if (playing) element.play().catch(() => { setPlaying(false); setStatus('Playback could not start. Try Play again or choose another song.') })
    else element.pause()
  }, [playing, currentTrack.id])
  const [liked, setLiked] = useSavedState<string[]>('music-lab-likes', [])
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null)
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null)
  const track = currentTrack
  const libraryTracks = selectedPlaylist ? playlists.find(p => p.name === selectedPlaylist)?.tracks ?? [] : saved.filter(t => liked.includes(t.id))
  const matches = (value: string) => value.toLowerCase().includes(query.toLowerCase().trim())
  const visibleTracks = (view === 'Your library' ? libraryTracks : selectedAlbum || selectedArtist ? tracks : catalog).filter(t => matches(`${t.title} ${t.user.name}`) && (!selectedAlbum || t.album === selectedAlbum) && (!selectedArtist || t.user.name === selectedArtist))
  function navigate(next: View) { setView(next); setSelectedPlaylist(null); setQuery(''); setSelectedAlbum(null); setSelectedArtist(null); setFilter('All') }
  function selectTrack(id: string) {
    const next = [...catalog, ...saved, ...history, ...queue, ...playlists.flatMap(p => p.tracks), ...tracks].find(t => t.id === id)
    if (!next) return
    if (next.id.startsWith('demoAudio')) { setStatus('This sample has no audio. Search live music to listen.'); return }
    setCurrentTrack(next); setPosition(0); setDuration(0); setPlaying(true)
    setHistory(values => [next, ...values.filter(t => t.id !== next.id)].slice(0, 50))
  }
  function toggleLike(id: string) {
    const item = [...catalog, currentTrack, ...history].find(t => t.id === id)
    if (item) setSaved(values => values.some(t => t.id === id) ? values : [...values, item])
    setLiked(values => values.includes(id) ? values.filter(value => value !== id) : [...values, id])
  }
  function skip(direction: number, ended = false) {
    if (ended && repeat === 'one') { if (audio.current) { audio.current.currentTime = 0; void audio.current.play().catch(() => setPlaying(false)) }; return }
    if (direction > 0 && queue.length) { const next = queue[0]; setQueue(q => q.slice(1)); selectTrack(next.id); return }
    const list = visibleTracks.filter(t => !t.id.startsWith('demoAudio'))
    if (!list.length) { setPlaying(false); return }
    const index = list.findIndex(t => t.id === track.id)
    if (ended && !shuffle && repeat === 'off' && index === list.length - 1) { setPlaying(false); return }
    const candidates = list.filter(t => t.id !== track.id)
    const next = shuffle && candidates.length ? candidates[Math.floor(Math.random() * candidates.length)] : list[(index + direction + list.length) % list.length]
    selectTrack(next.id)
  }
  function addToPlaylist(name: string, item: Track) {
    setPlaylists(values => values.map(p => p.name === name && !p.tracks.some(t => t.id === item.id) ? { ...p, tracks: [...p.tracks, item] } : p))
  }
  return (
    <div className="app-shell">
      <audio ref={audio} src={track.id.startsWith('demoAudio') ? undefined : musicApi.audio.streamUrl(track.id)} onTimeUpdate={e => setPosition(e.currentTarget.currentTime)} onLoadedMetadata={e => setDuration(Number.isFinite(e.currentTarget.duration) ? e.currentTarget.duration : 0)} onEnded={() => skip(1, true)} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => { setPlaying(false); setStatus('This song could not be loaded. Choose another track.') }} />
      <a className="skip-link" href="#content">Skip to music</a>
      <aside className="sidebar">
        <a className="brand" href="#" onClick={e => { e.preventDefault(); navigate('Discover') }}><span className="brand-mark">♫</span> music lab<span className="brand-dot">.</span></a>
        <p className="nav-label">YOUR SPACE</p>
        <nav aria-label="Main navigation">{(['Discover', 'Search', 'Your library'] as View[]).map((item, i) => <button key={item} className={view === item ? 'nav-item active' : 'nav-item'} onClick={() => navigate(item)} aria-current={view === item ? 'page' : undefined}><span aria-hidden="true">{['⌂', '⌕', '▤'][i]}</span>{item}</button>)}</nav>
        <div className="library-heading"><span>YOUR COLLECTION</span><span>{liked.length}</span></div>
        <button className="collection" onClick={() => navigate('Your library')}><span className="liked-art">♥</span><span>Liked songs<small>{liked.length} saved songs</small></span></button>
        <div className="sidebar-note"><span className="live-dot" /> A little space for good music.<p>Explore new sounds.<br />Find your next favorite.</p></div>
        <div className="profile"><span className="avatar">Y</span><span>Your space<small>Listening as a guest</small></span></div>
      </aside>
      <main id="content" className="main-content">
        <header className="topbar"><div className="breadcrumb">Music Lab <span>/</span> {view}</div><label className="search-box"><span aria-hidden="true">⌕</span><input aria-label="Search songs, artists and albums" placeholder="Search songs, artists, albums" value={query} onChange={e => { setQuery(e.target.value); setView('Search'); setSelectedAlbum(null); setSelectedArtist(null) }} />{query && <button aria-label="Clear search" onClick={() => setQuery('')}>×</button>}</label><span className="demo-badge">LIVE MUSIC</span></header>
        <div className="page-content">
          <p role="status" className="muted">{status}</p>
          {view === 'Your library' && <section className="library-tools"><h2>Playlists</h2><form onSubmit={e => { e.preventDefault(); const name = playlistName.trim(); if (name && !playlists.some(p => p.name === name)) { setPlaylists(p => [...p, { name, tracks: [] }]); setPlaylistName('') } }}><input aria-label="New playlist name" placeholder="New playlist name" value={playlistName} maxLength={80} onChange={e => setPlaylistName(e.target.value)} /><button className="chip">Create playlist</button></form><button className="chip" onClick={() => setSelectedPlaylist(null)}>Liked songs</button>{playlists.map(p => <span key={p.name}><button className="chip" aria-pressed={selectedPlaylist === p.name} onClick={() => setSelectedPlaylist(p.name)}>{p.name} · {p.tracks.length}</button><button aria-label={`Delete playlist ${p.name}`} onClick={() => { setPlaylists(values => values.filter(v => v.name !== p.name)); if (selectedPlaylist === p.name) setSelectedPlaylist(null) }}>×</button></span>)}</section>}
          {showQueue && <section className="empty"><h2>Up next</h2>{queue.length === 0 && <p>Your queue is empty. Add songs with +.</p>}{queue.map((t, i) => <div key={`${t.id}-${i}`}><button onClick={() => { selectTrack(t.id); setQueue(q => q.filter((_, n) => n !== i)) }}>{t.title} · {t.user.name}</button><button aria-label={`Remove ${t.title} from queue`} onClick={() => setQueue(q => q.filter((_, n) => n !== i))}>×</button></div>)}</section>}
          <div className="filter-row" aria-label="Content type">{filters.map(item => <button key={item} className={filter === item ? 'chip selected' : 'chip'} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}</div>
          {view === 'Discover' && <section className="hero"><div className="hero-copy"><p className="eyebrow">TUNE OUT. TUNE IN.</p><h1>Find your<br /><em>next frequency.</em></h1><p>Fresh sounds. Familiar favorites.<br />A whole world of music to get lost in.</p><button className="primary" onClick={() => { catalog[0] && selectTrack(catalog[0].id); document.getElementById('tracks')?.scrollIntoView({ behavior: 'smooth' }) }}><span aria-hidden="true">▶</span> Explore the sounds</button></div><div className="hero-record" aria-hidden="true"><div className="record-center">ml<span>SIDE A · 33⅓</span></div></div><span className="hero-caption">THE MUSIC LAB SESSIONS — VOL. 01</span></section>}
          {view !== 'Discover' && <div className="page-title"><p className="eyebrow">{view === 'Your library' ? 'KEEP THE GOOD ONES' : 'FIND YOUR FREQUENCY'}</p><h1>{view === 'Your library' ? 'Your library' : query ? `Results for “${query}”` : 'Explore the catalog'}</h1><p>{view === 'Your library' ? 'Your liked songs, all in one place. Saved on this device.' : 'Search live songs by title or artist. Explore sample albums and artists below.'}</p></div>}
          {view !== 'Your library' && (filter === 'All' || filter === 'Albums') && <section><div className="section-heading"><div><p className="eyebrow">WORTH A LISTEN</p><h2>Albums to get into</h2></div><span className="section-note">A fresh rotation</span></div><div className="album-grid">{albums.filter(a => matches(`${a.title} ${a.artist}`)).map(album => <button className={`album-card ${selectedAlbum === album.title ? 'chosen' : ''}`} key={album.id} aria-pressed={selectedAlbum === album.title} onClick={() => { setSelectedAlbum(selectedAlbum === album.title ? null : album.title); setSelectedArtist(null) }}><span className={`cover art-${album.art}`} aria-hidden="true"><span className="cover-orbit" /><span className="cover-title">{album.title}</span><span className="cover-number">ML / {album.number}</span></span><strong>{album.title}</strong><small>{album.artist} · {album.date.slice(0, 4)}</small></button>)}</div>{!albums.some(a => matches(`${a.title} ${a.artist}`)) && <p className="empty">No sample albums match your search.</p>}</section>}
          {(filter === 'All' || filter === 'Songs' || view === 'Your library' || selectedAlbum || selectedArtist) && <section id="tracks"><div className="section-heading"><div><p className="eyebrow">{view === 'Your library' ? 'ON REPEAT' : 'SOMETHING GOOD IS PLAYING'}</p><h2>{selectedAlbum || selectedArtist || (view === 'Your library' ? selectedPlaylist || 'Liked songs' : 'In the rotation')}</h2></div>{(selectedAlbum || selectedArtist) ? <button className="text-button" onClick={() => { setSelectedAlbum(null); setSelectedArtist(null) }}>Show all songs</button> : <span className="section-note">Live tracks</span>}</div><div className="track-table"><div className="track-row table-heading"><span>#</span><span>Title</span><span className="album-column">Album</span><span>Time</span><span /></div>{visibleTracks.map((t, i) => <div className={`track-row ${t.id === track.id ? 'current' : ''}`} key={t.id}><button className="track-number" aria-label={`Play ${t.title}`} onClick={() => selectTrack(t.id)}>{t.id === track.id && playing ? 'Ⅱ' : i + 1}</button><button className="track-title" onClick={() => selectTrack(t.id)}><span className={`mini-cover art-${t.art}`} aria-hidden="true">♪</span><span><strong>{t.title}</strong><small>{t.user.name}</small></span></button><span className="album-column muted">{t.album}</span><span className="muted">{time(t.duration)}</span><button className={`like-button ${liked.includes(t.id) ? 'is-liked' : ''}`} aria-label={`${liked.includes(t.id) ? 'Unlike' : 'Like'} ${t.title}`} aria-pressed={liked.includes(t.id)} onClick={() => toggleLike(t.id)}>{liked.includes(t.id) ? '♥' : '♡'}</button><div className="track-actions"><button aria-label={`Queue ${t.title}`} onClick={() => setQueue(q => [...q, t])}>+ Queue</button><select aria-label={`Add ${t.title} to playlist`} value="" onChange={e => addToPlaylist(e.target.value, t)}><option value="" disabled>Add to playlist</option>{playlists.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}</select>{selectedPlaylist && <button aria-label={`Remove ${t.title} from playlist`} onClick={() => setPlaylists(ps => ps.map(p => p.name === selectedPlaylist ? { ...p, tracks: p.tracks.filter(v => v.id !== t.id) } : p))}>Remove</button>}</div></div>)}</div>{visibleTracks.length === 0 && <div className="empty"><h3>{view === 'Your library' ? 'Make yourself a collection.' : 'No songs found.'}</h3><p>{view === 'Your library' ? 'Tap a heart next to a song to save it here.' : 'Try a different search or clear the selected album or artist.'}</p></div>}</section>}
          {view !== 'Your library' && (filter === 'All' || filter === 'Artists') && <section><div className="section-heading"><div><p className="eyebrow">MEET THE SOUND</p><h2>Artists to explore</h2></div></div><div className="artist-grid">{artists.filter(a => matches(a.name)).map(a => <button className="artist-card" key={a.id} onClick={() => { setSelectedArtist(a.name); setSelectedAlbum(null); setFilter('Songs') }}><span className={`artist-portrait art-${a.art}`} aria-hidden="true">{a.name.split(' ').map(n => n[0]).join('')}</span><strong>{a.name}</strong><small>Artist · {a.country}</small></button>)}</div>{!artists.some(a => matches(a.name)) && <p className="empty">No sample artists match your search.</p>}</section>}
          {history.length > 0 && <section><h2>Recently played</h2>{history.slice(0, 10).map(t => <button className="chip" key={t.id} onClick={() => selectTrack(t.id)}>{t.title} · {t.user.name}</button>)}</section>}<footer className="page-footer"><span>music lab.</span><p>Made for listening. Built for discovery.</p><small>Audio provided by Audius · Collections saved on this device</small></footer>
        </div>
      </main>
      <footer className="player" aria-label="Music player"><div className="now-playing"><span className={`mini-cover art-${track.art}`} aria-hidden="true">♪</span><span><strong>{track.title}</strong><small>{track.user.name}</small></span><button className={`like-button ${liked.includes(track.id) ? 'is-liked' : ''}`} aria-label="Like current song" aria-pressed={liked.includes(track.id)} onClick={() => toggleLike(track.id)}>{liked.includes(track.id) ? '♥' : '♡'}</button></div><div className="player-center"><div className="player-controls"><button aria-label="Shuffle" aria-pressed={shuffle} onClick={() => setShuffle(v => !v)}>⤨</button><button aria-label="Previous track" onClick={() => skip(-1)}>▮◀</button><button className="play-button" aria-label={playing ? 'Pause' : 'Play'} onClick={() => { if (track.id.startsWith('demoAudio')) { const first = catalog.find(t => !t.id.startsWith('demoAudio')); if (first) selectTrack(first.id); else setStatus('Search live music to start listening.') } else setPlaying(!playing) }}>{playing ? 'Ⅱ' : '▶'}</button><button aria-label="Next track" onClick={() => skip(1)}>▶▮</button><button aria-label={`Repeat: ${repeat}`} onClick={() => setRepeat(v => v === 'off' ? 'all' : v === 'all' ? 'one' : 'off')}>↻{repeat === 'one' ? '1' : repeat === 'all' ? '●' : ''}</button></div><div className="timeline"><span>{time(position)}</span><input aria-label="Seek" type="range" min="0" max={duration || track.duration} step="1" value={position} disabled={!duration} onChange={e => { if (audio.current) { audio.current.currentTime = Number(e.target.value); setPosition(Number(e.target.value)) } }} /><span>{time(duration || track.duration)}</span></div></div><div className="player-right"><button aria-expanded={showQueue} onClick={() => setShowQueue(v => !v)}>Queue ({queue.length})</button><label>Volume<input type="range" min="0" max="100" value={volume} onChange={e => setVolume(Number(e.target.value))} /></label></div></footer>
    </div>
  )
}

