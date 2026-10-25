import { useState } from 'react'
import { albums, artists, tracks } from './data/demo'

type View = 'Discover' | 'Search' | 'Your library'
type Filter = 'All' | 'Songs' | 'Albums' | 'Artists'
const filters: Filter[] = ['All', 'Songs', 'Albums', 'Artists']
const time = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

export default function App() {
  const [view, setView] = useState<View>('Discover')
  const [filter, setFilter] = useState<Filter>('All')
  const [query, setQuery] = useState('')
  const [current, setCurrent] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [liked, setLiked] = useState<string[]>([])
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null)
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null)
  const [volume, setVolume] = useState(70)
  const track = tracks[current]
  const matches = (value: string) => value.toLowerCase().includes(query.toLowerCase().trim())
  const visibleTracks = tracks.filter(t => matches(`${t.title} ${t.user.name}`) && (view !== 'Your library' || liked.includes(t.id)) && (!selectedAlbum || t.album === selectedAlbum) && (!selectedArtist || t.user.name === selectedArtist))
  function navigate(next: View) { setView(next); setQuery(''); setSelectedAlbum(null); setSelectedArtist(null); setFilter('All') }
  function selectTrack(id: string) { setCurrent(tracks.findIndex(t => t.id === id)); setPlaying(true) }
  function toggleLike(id: string) { setLiked(values => values.includes(id) ? values.filter(value => value !== id) : [...values, id]) }
  function skip(direction: number) { setCurrent(value => (value + direction + tracks.length) % tracks.length) }
  return (
    <div className="app-shell">
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
        <header className="topbar"><div className="breadcrumb">Music Lab <span>/</span> {view}</div><label className="search-box"><span aria-hidden="true">⌕</span><input aria-label="Search songs, artists and albums" placeholder="Search songs, artists, albums" value={query} onChange={e => { setQuery(e.target.value); setView('Search'); setSelectedAlbum(null); setSelectedArtist(null) }} />{query && <button aria-label="Clear search" onClick={() => setQuery('')}>×</button>}</label><span className="demo-badge">UI PREVIEW</span></header>
        <div className="page-content">
          <div className="filter-row" aria-label="Content type">{filters.map(item => <button key={item} className={filter === item ? 'chip selected' : 'chip'} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}</div>
          {view === 'Discover' && <section className="hero"><div className="hero-copy"><p className="eyebrow">TUNE OUT. TUNE IN.</p><h1>Find your<br /><em>next frequency.</em></h1><p>Fresh sounds. Familiar favorites.<br />A whole world of music to get lost in.</p><button className="primary" onClick={() => { selectTrack(tracks[0].id); document.getElementById('tracks')?.scrollIntoView({ behavior: 'smooth' }) }}><span aria-hidden="true">▶</span> Explore the sounds</button></div><div className="hero-record" aria-hidden="true"><div className="record-center">ml<span>SIDE A · 33⅓</span></div></div><span className="hero-caption">THE MUSIC LAB SESSIONS — VOL. 01</span></section>}
          {view !== 'Discover' && <div className="page-title"><p className="eyebrow">{view === 'Your library' ? 'KEEP THE GOOD ONES' : 'FIND YOUR FREQUENCY'}</p><h1>{view === 'Your library' ? 'Your library' : query ? `Results for “${query}”` : 'Explore the catalog'}</h1><p>{view === 'Your library' ? 'Your liked songs, all in one place. Saved for this session.' : 'Search the sample songs, artists and albums.'}</p></div>}
          {view !== 'Your library' && (filter === 'All' || filter === 'Albums') && <section><div className="section-heading"><div><p className="eyebrow">WORTH A LISTEN</p><h2>Albums to get into</h2></div><span className="section-note">A fresh rotation</span></div><div className="album-grid">{albums.filter(a => matches(`${a.title} ${a.artist}`)).map(album => <button className={`album-card ${selectedAlbum === album.title ? 'chosen' : ''}`} key={album.id} aria-pressed={selectedAlbum === album.title} onClick={() => { setSelectedAlbum(selectedAlbum === album.title ? null : album.title); setSelectedArtist(null) }}><span className={`cover art-${album.art}`} aria-hidden="true"><span className="cover-orbit" /><span className="cover-title">{album.title}</span><span className="cover-number">ML / {album.number}</span></span><strong>{album.title}</strong><small>{album.artist} · {album.date.slice(0, 4)}</small></button>)}</div>{!albums.some(a => matches(`${a.title} ${a.artist}`)) && <p className="empty">No sample albums match your search.</p>}</section>}
          {(filter === 'All' || filter === 'Songs' || view === 'Your library' || selectedAlbum || selectedArtist) && <section id="tracks"><div className="section-heading"><div><p className="eyebrow">{view === 'Your library' ? 'ON REPEAT' : 'SOMETHING GOOD IS PLAYING'}</p><h2>{selectedAlbum || selectedArtist || (view === 'Your library' ? 'Liked songs' : 'In the rotation')}</h2></div>{(selectedAlbum || selectedArtist) ? <button className="text-button" onClick={() => { setSelectedAlbum(null); setSelectedArtist(null) }}>Show all songs</button> : <span className="section-note">Sample tracks</span>}</div><div className="track-table"><div className="track-row table-heading"><span>#</span><span>Title</span><span className="album-column">Album</span><span>Time</span><span /></div>{visibleTracks.map((t, i) => <div className={`track-row ${t.id === track.id ? 'current' : ''}`} key={t.id}><button className="track-number" aria-label={`Preview ${t.title}`} onClick={() => selectTrack(t.id)}>{t.id === track.id && playing ? 'Ⅱ' : i + 1}</button><button className="track-title" onClick={() => selectTrack(t.id)}><span className={`mini-cover art-${t.art}`} aria-hidden="true">♪</span><span><strong>{t.title}</strong><small>{t.user.name}</small></span></button><span className="album-column muted">{t.album}</span><span className="muted">{time(t.duration)}</span><button className={`like-button ${liked.includes(t.id) ? 'is-liked' : ''}`} aria-label={`${liked.includes(t.id) ? 'Unlike' : 'Like'} ${t.title}`} aria-pressed={liked.includes(t.id)} onClick={() => toggleLike(t.id)}>{liked.includes(t.id) ? '♥' : '♡'}</button></div>)}</div>{visibleTracks.length === 0 && <div className="empty"><h3>{view === 'Your library' ? 'Make yourself a collection.' : 'No songs found.'}</h3><p>{view === 'Your library' ? 'Tap a heart next to a song to save it here.' : 'Try a different search or clear the selected album or artist.'}</p></div>}</section>}
          {view !== 'Your library' && (filter === 'All' || filter === 'Artists') && <section><div className="section-heading"><div><p className="eyebrow">MEET THE SOUND</p><h2>Artists to explore</h2></div></div><div className="artist-grid">{artists.filter(a => matches(a.name)).map(a => <button className="artist-card" key={a.id} onClick={() => { setSelectedArtist(a.name); setSelectedAlbum(null); setFilter('Songs') }}><span className={`artist-portrait art-${a.art}`} aria-hidden="true">{a.name.split(' ').map(n => n[0]).join('')}</span><strong>{a.name}</strong><small>Artist · {a.country}</small></button>)}</div>{!artists.some(a => matches(a.name)) && <p className="empty">No sample artists match your search.</p>}</section>}
          <footer className="page-footer"><span>music lab.</span><p>Made for listening. Built for discovery.</p><small>Demo catalog · No live audio or API connection</small></footer>
        </div>
      </main>
      <footer className="player" aria-label="Preview player"><div className="now-playing"><span className={`mini-cover art-${track.art}`} aria-hidden="true">♪</span><span><strong>{track.title}</strong><small>{track.user.name}</small></span><button className={`like-button ${liked.includes(track.id) ? 'is-liked' : ''}`} aria-label="Like current song" aria-pressed={liked.includes(track.id)} onClick={() => toggleLike(track.id)}>{liked.includes(track.id) ? '♥' : '♡'}</button></div><div className="player-center"><div className="player-controls"><button aria-label="Previous sample track" onClick={() => skip(-1)}>▮◀</button><button className="play-button" aria-label={playing ? 'Pause preview' : 'Play preview'} onClick={() => setPlaying(!playing)}>{playing ? 'Ⅱ' : '▶'}</button><button aria-label="Next sample track" onClick={() => skip(1)}>▶▮</button></div><div className="timeline"><span>0:00</span><div className="progress-line" /><span>{time(track.duration)}</span></div></div><div className="player-right"><span role="status">{playing ? 'Preview only · No audio' : 'UI preview'}</span><label>Volume<input type="range" min="0" max="100" value={volume} onChange={e => setVolume(Number(e.target.value))} /></label></div></footer>
    </div>
  )
}
