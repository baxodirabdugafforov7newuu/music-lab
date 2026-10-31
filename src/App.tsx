import { useCallback, useEffect, useRef, useState } from 'react'
import { musicApi } from './api/music'
import { Artwork } from './Artwork'
import { Catalog } from './Catalog'
import { SongDetails } from './SongDetails'
import { canPlay, formatTime as time, isSample, likeList, liveTracks, playlistList, trackList, type Track, type Playlist } from './library'
import { useSavedState } from './useSavedState'
import { tracks } from './data/demo'

type View = 'Discover' | 'Search' | 'Your library'
type Filter = 'All' | 'Songs' | 'Albums' | 'Artists'
const filters: Filter[] = ['All', 'Songs', 'Albums', 'Artists']

export default function App() {
  const [view, setView] = useState<View>('Discover')
  const [filter, setFilter] = useState<Filter>('All')
  const [query, setQuery] = useState('')
  const [artistRequest, setArtistRequest] = useState<{ id: string } | null>(null)
  const [details, setDetails] = useState<Track | null>(null)
  const [artistTracks, setArtistTracks] = useState<Track[] | null>(null)
  const [playbackList, setPlaybackList] = useState<Track[]>([])
  const [retry, setRetry] = useState(0)
  const [catalog, setCatalog] = useState<Track[]>(tracks)
  const [currentTrack, setCurrentTrack] = useState<Track>(tracks[0])
  const [queue, setQueue] = useState<Track[]>([])
  const [showQueue, setShowQueue] = useState(false)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState<'off' | 'all' | 'one'>('off')
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)
  const [status, setStatus] = useState('Loading live music…')
  const [history, setHistory] = useSavedState<Track[]>('music-lab-history', [], trackList)
  const [saved, setSaved] = useSavedState<Track[]>('music-lab-tracks', [], trackList)
  const [playlists, setPlaylists] = useSavedState<Playlist[]>('music-lab-playlists', [], playlistList)
  const [playlistName, setPlaylistName] = useState('')
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null)
  const [volume, setVolume] = useState(70)
  const [playing, setPlaying] = useState(false)
  const audio = useRef<HTMLAudioElement>(null)
  const request = useRef(0)
  useEffect(() => {
    const id = ++request.current
    const timer = window.setTimeout(() => {
      if (view === 'Your library') return
      setStatus('Loading live music…')
      const call = query.trim() ? musicApi.audio.search(query, { limit: 50 }) : musicApi.audio.trending({ limit: 50 })
      call.then(items => { if (request.current === id) { setCatalog(liveTracks(items)); setStatus(liveTracks(items).length ? 'Live music · Audius' : 'No live results. Try another search.') } })
        .catch(() => { if (request.current === id) { setCatalog(tracks); setStatus('Live music unavailable. Showing sample catalog; sample tracks have no audio.') } })
    }, 350)
    return () => { clearTimeout(timer); request.current++ }
  }, [query, view, retry])
  useEffect(() => { if (audio.current) audio.current.volume = volume / 100 }, [volume])
  useEffect(() => {
    const element = audio.current
    if (!element) return
    let active = true
    if (playing) element.play().catch(() => { if (active) { setPlaying(false); setStatus('Playback could not start. Try Play again or choose another song.') } })
    else element.pause()
    return () => { active = false }
  }, [playing, currentTrack.id])
  const [liked, setLiked] = useSavedState<string[]>('music-lab-likes', [], likeList)
  const [showHistory, setShowHistory] = useState(false)
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null)
  const showArtistTracks = useCallback((items: Track[], name: string) => { setArtistTracks(items); setSelectedArtist(name) }, [])
  const track = currentTrack
  const libraryTracks = showHistory ? history : selectedPlaylist ? playlists.find(p => p.name === selectedPlaylist)?.tracks ?? [] : saved.filter(t => liked.includes(t.id))
  const matches = (value: string) => value.toLowerCase().includes(query.toLowerCase().trim())
  const visibleTracks = (view === 'Your library' ? libraryTracks : artistTracks ?? catalog).filter(t => artistTracks || (view !== 'Your library' && !isSample(t)) || matches(`${t.title} ${t.user.name}`))
  function navigate(next: View) { setArtistRequest(null); setShowHistory(false); setDetails(null); setView(next); setSelectedPlaylist(null); setArtistRequest(null); setQuery(''); setArtistTracks(null); setSelectedArtist(null); setFilter('All') }
  function selectTrack(id: string) {
    const next = [...(artistTracks ?? []), ...playbackList, ...catalog, currentTrack, ...saved, ...history, ...queue, ...playlists.flatMap(p => p.tracks), ...tracks].find(t => t.id === id)
    if (!next) return
    if (!canPlay(next)) { setStatus(isSample(next) ? 'This sample has no audio. Search live music to listen.' : 'This song is unavailable or restricted. Choose another track.'); return }
    if (next.id === currentTrack.id) {
      const element = audio.current
      if (element?.ended) element.currentTime = 0
      setPlaying(true)
      if (element?.paused) void element.play().catch(() => {
        if (element.getAttribute('src') === musicApi.audio.streamUrl(next.id)) { setPlaying(false); setStatus('Playback could not start. Try Play again or choose another song.') }
      })
      return
    }
    setPlaybackList(visibleTracks.some(t => t.id === next.id) ? visibleTracks.filter(canPlay) : [...playbackList, next].filter((t, i, all) => all.findIndex(v => v.id === t.id) === i))
    setCurrentTrack(next); setPosition(0); setDuration(0); setPlaying(true)
    setHistory(values => [next, ...values.filter(t => t.id !== next.id)].slice(0, 50))
  }
  function toggleLike(id: string) {
    const item = [...catalog, ...(artistTracks ?? []), ...saved, ...playlists.flatMap(p => p.tracks), currentTrack, ...history].find(t => t.id === id)
    if (item) setSaved(values => values.some(t => t.id === id) ? values : [...values, item])
    setLiked(values => values.includes(id) ? values.filter(value => value !== id) : [...values, id])
  }
  function skip(direction: number, ended = false) {
    if (ended && repeat === 'one') { if (audio.current) { audio.current.currentTime = 0; void audio.current.play().catch(() => setPlaying(false)) }; return }
    if (direction < 0 && position > 3 && audio.current) { audio.current.currentTime = 0; setPosition(0); return }
    if (direction > 0 && queue.length) { const next = queue[0]; setQueue(q => q.slice(1)); selectTrack(next.id); return }
    const list = (playbackList.length ? playbackList : visibleTracks).filter(canPlay)
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
      <audio ref={audio} preload="metadata" src={canPlay(track) ? musicApi.audio.streamUrl(track.id) : undefined} onTimeUpdate={e => setPosition(e.currentTarget.currentTime)} onLoadedMetadata={e => setDuration(Number.isFinite(e.currentTarget.duration) ? e.currentTarget.duration : 0)} onEnded={() => skip(1, true)} onError={() => { setPlaying(false); setStatus('This song could not be loaded. Choose another track.') }} />
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
      <main id="content" tabIndex={-1} className="main-content">
        <header className="topbar"><div className="breadcrumb">Music Lab <span>/</span> {view}</div><label className="search-box"><span aria-hidden="true">⌕</span><input aria-label="Search songs, artists and albums" placeholder="Search songs, artists, albums" value={query} onChange={e => { setArtistRequest(null); setQuery(e.target.value); setView('Search'); setArtistTracks(null); setSelectedArtist(null) }} />{query && <button aria-label="Clear search" onClick={() => { setArtistRequest(null); setQuery(''); setArtistTracks(null); setSelectedArtist(null) }}>×</button>}</label><span className="demo-badge">LIVE MUSIC</span></header>
        <div className="page-content">
          <div className="status-line"><p role="status" className="muted">{status}</p>{view !== 'Your library' && <button className="text-button" onClick={() => setRetry(v => v + 1)}>Refresh music</button>}</div>
          {details && <SongDetails track={details} onClose={() => setDetails(null)} onPlay={selectTrack} onArtist={id => { setArtistRequest({ id }); setView('Search'); setQuery(''); setFilter('Artists'); setArtistTracks(null); setSelectedArtist(null); setDetails(null) }} />}
          {view === 'Your library' && <section className="library-tools"><h2>Playlists</h2><form onSubmit={e => { e.preventDefault(); const name = playlistName.trim(); if (name && !playlists.some(p => p.name.toLowerCase() === name.toLowerCase())) { setPlaylists(p => [...p, { name, tracks: [] }]); setPlaylistName(''); setStatus(`Created playlist “${name}”.`) } else setStatus('Enter a unique playlist name (1–80 characters).') }}><input aria-label="New playlist name" placeholder="New playlist name" value={playlistName} maxLength={80} onChange={e => setPlaylistName(e.target.value)} /><button className="chip">Create playlist</button></form><button className="chip" onClick={() => { setSelectedPlaylist(null); setShowHistory(false) }}>Liked songs</button><button className="chip" aria-pressed={showHistory} onClick={() => { setSelectedPlaylist(null); setShowHistory(true) }}>History · {history.length}</button>{playlists.map(p => <span key={p.name}><button className="chip" aria-pressed={selectedPlaylist === p.name} onClick={() => { setSelectedPlaylist(p.name); setShowHistory(false) }}>{p.name} · {p.tracks.length}</button><button aria-label={`Delete playlist ${p.name}`} onClick={() => { setPlaylists(values => values.filter(v => v.name !== p.name)); if (selectedPlaylist === p.name) setSelectedPlaylist(null) }}>×</button></span>)}</section>}
          {showQueue && <section className="empty"><h2>Up next</h2>{queue.length === 0 && <p>Your queue is empty. Add songs with +.</p>}{queue.map((t, i) => <div key={`${t.id}-${i}`}><button onClick={() => { selectTrack(t.id); setQueue(q => q.filter((_, n) => n !== i)) }}>{t.title} · {t.user.name}</button><button aria-label={`Remove ${t.title} from queue`} onClick={() => setQueue(q => q.filter((_, n) => n !== i))}>×</button></div>)}</section>}
          <div className="filter-row" aria-label="Content type">{filters.map(item => <button key={item} className={filter === item ? 'chip selected' : 'chip'} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}</div>
          {view === 'Discover' && <section className="hero"><div className="hero-copy"><p className="eyebrow">TUNE OUT. TUNE IN.</p><h1>Find your<br /><em>next frequency.</em></h1><p>Fresh sounds. Familiar favorites.<br />A whole world of music to get lost in.</p><button className="primary" onClick={() => { catalog[0] && selectTrack(catalog[0].id); document.getElementById('tracks')?.scrollIntoView({ behavior: 'smooth' }) }}><span aria-hidden="true">▶</span> Explore the sounds</button></div><div className="hero-record" aria-hidden="true"><div className="record-center">ml<span>SIDE A · 33⅓</span></div></div><span className="hero-caption">THE MUSIC LAB SESSIONS — VOL. 01</span></section>}
          {view !== 'Discover' && <div className="page-title"><p className="eyebrow">{view === 'Your library' ? 'KEEP THE GOOD ONES' : 'FIND YOUR FREQUENCY'}</p><h1>{view === 'Your library' ? 'Your library' : query ? `Results for “${query}”` : 'Explore the catalog'}</h1><p>{view === 'Your library' ? 'Your liked songs, all in one place. Saved on this device.' : 'Find songs and artist profiles on Audius, and albums on MusicBrainz.'}</p></div>}
          {view !== 'Your library' && <Catalog artistRequest={artistRequest} query={query} filter={filter} catalog={catalog} onArtistTracks={showArtistTracks} onSearch={value => { setQuery(value); setView('Search'); setFilter('Songs'); setArtistTracks(null); setSelectedArtist(null) }} />}
          {(filter === 'All' || filter === 'Songs' || view === 'Your library' || selectedArtist) && <section id="tracks"><div className="section-heading"><div><p className="eyebrow">{view === 'Your library' ? 'ON REPEAT' : 'SOMETHING GOOD IS PLAYING'}</p><h2>{selectedArtist || (view === 'Your library' ? showHistory ? 'Listening history' : selectedPlaylist || 'Liked songs' : 'In the rotation')}</h2></div>{selectedArtist ? <button className="text-button" onClick={() => { setArtistTracks(null); setSelectedArtist(null) }}>Show all songs</button> : <span className="section-note">Live tracks</span>}</div><div className="track-table"><div className="track-row table-heading"><span>#</span><span>Title</span><span className="album-column">Album</span><span>Time</span><span /></div>{visibleTracks.map((t, i) => <div className={`track-row ${t.id === track.id ? 'current' : ''}`} key={t.id}><button className="track-number" aria-label={`${t.id === track.id && playing ? 'Pause' : 'Play'} ${t.title}`} onClick={() => t.id === track.id && playing ? setPlaying(false) : selectTrack(t.id)}>{t.id === track.id && playing ? 'Ⅱ' : i + 1}</button><button className="track-title" onClick={() => selectTrack(t.id)}><Artwork className={`mini-cover art-${t.art}`} urls={t.artwork} /><span><strong>{t.title}</strong><small>{t.user.name}</small></span></button><span className="album-column muted">{t.album}</span><span className="muted">{time(t.duration)}</span><button className={`like-button ${liked.includes(t.id) ? 'is-liked' : ''}`} aria-label={`${liked.includes(t.id) ? 'Unlike' : 'Like'} ${t.title}`} aria-pressed={liked.includes(t.id)} onClick={() => toggleLike(t.id)}>{liked.includes(t.id) ? '♥' : '♡'}</button><div className="track-actions"><button aria-label={`Information about ${t.title}`} onClick={() => setDetails(t)}>Info</button><button aria-label={`Queue ${t.title}`} disabled={!canPlay(t)} onClick={() => { setQueue(q => [...q, t]); setStatus(`Added ${t.title} to queue.`) }}>+ Queue</button><select disabled={!playlists.length} aria-label={`Add ${t.title} to playlist`} value="" onChange={e => addToPlaylist(e.target.value, t)}><option value="" disabled>Add to playlist</option>{playlists.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}</select>{selectedPlaylist && <button aria-label={`Remove ${t.title} from playlist`} onClick={() => setPlaylists(ps => ps.map(p => p.name === selectedPlaylist ? { ...p, tracks: p.tracks.filter(v => v.id !== t.id) } : p))}>Remove</button>}</div></div>)}</div>{visibleTracks.length === 0 && <div className="empty"><h3>{view === 'Your library' ? 'Make yourself a collection.' : 'No songs found.'}</h3><p>{view === 'Your library' ? 'Tap a heart next to a song to save it here.' : 'Try a different search or clear the selected album or artist.'}</p></div>}</section>}
          {history.length > 0 && <section><h2>Recently played</h2>{history.slice(0, 50).map(t => <button className="chip" key={t.id} onClick={() => selectTrack(t.id)}>{t.title} · {t.user.name}</button>)}</section>}<footer className="page-footer"><span>music lab.</span><p>Made for listening. Built for discovery.</p><small>Audio and artist profiles: Audius · Album metadata: MusicBrainz · Covers: Cover Art Archive · Collections saved on this device</small></footer>
        </div>
      </main>
      <footer className="player" aria-label="Music player"><div className="now-playing"><Artwork className={`mini-cover art-${track.art}`} urls={track.artwork} /><span><button className="now-playing-title" aria-label={`Information about current song ${track.title}`} onClick={() => setDetails(track)}><strong>{track.title}</strong><small>{track.user.name}</small></button></span><button className={`like-button ${liked.includes(track.id) ? 'is-liked' : ''}`} aria-label={liked.includes(track.id) ? "Unlike current song" : "Like current song"} aria-pressed={liked.includes(track.id)} onClick={() => toggleLike(track.id)}>{liked.includes(track.id) ? '♥' : '♡'}</button></div><div className="player-center"><div className="player-controls"><button aria-label="Shuffle" aria-pressed={shuffle} onClick={() => setShuffle(v => !v)}>⤨</button><button aria-label="Previous track" onClick={() => skip(-1)}>▮◀</button><button className="play-button" aria-label={playing ? 'Pause' : 'Play'} onClick={() => { if (isSample(track)) { const first = catalog.find(canPlay); if (first) selectTrack(first.id); else setStatus('Search live music to start listening.') } else setPlaying(!playing) }}>{playing ? 'Ⅱ' : '▶'}</button><button aria-label="Next track" onClick={() => skip(1)}>▶▮</button><button aria-label={`Repeat: ${repeat}`} aria-pressed={repeat !== 'off'} onClick={() => setRepeat(v => v === 'off' ? 'all' : v === 'all' ? 'one' : 'off')}>↻{repeat === 'one' ? '1' : repeat === 'all' ? '●' : ''}</button></div><div className="timeline"><span>{time(position)}</span><input aria-label="Seek" type="range" min="0" max={duration || track.duration} step="1" value={position} disabled={!duration} onChange={e => { if (audio.current) { audio.current.currentTime = Number(e.target.value); setPosition(Number(e.target.value)) } }} /><span>{time(duration || track.duration)}</span></div></div><div className="player-right"><button aria-expanded={showQueue} onClick={() => setShowQueue(v => !v)}>Queue ({queue.length})</button><label>Volume<input type="range" min="0" max="100" value={volume} onChange={e => setVolume(Number(e.target.value))} /></label></div></footer>
    </div>
  )
}

