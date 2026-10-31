import { useEffect, useRef, useState } from 'react'
import { musicApi } from './api/music'
import { Artwork } from './Artwork'
import { canPlay, formatTime, isSample, type Track } from './library'

export function SongDetails({ track, onClose, onPlay, onArtist }: { track: Track; onClose: () => void; onPlay: (id: string) => void; onArtist: (id: string) => void }) {
  const panel = useRef<HTMLElement>(null)
  const [details, setDetails] = useState(track)
  const [status, setStatus] = useState('')
  useEffect(() => {
    let active = true
    panel.current?.scrollIntoView({ block: 'start', behavior: 'instant' })
    setDetails(track)
    if (isSample(track)) { setStatus('Sample catalog · no audio'); return }
    setStatus('Refreshing song information…')
    musicApi.audio.get(track.id).then(item => { if (active) { setDetails({ ...track, ...item }); setStatus('') } }).catch(() => { if (active) setStatus('Could not refresh information. Showing saved details.') })
    return () => { active = false }
  }, [track])
  const available = canPlay(details)
  return <section ref={panel} className="detail-panel song-details" aria-label="Song information"><button className="text-button close-details" onClick={onClose}>Close song information ×</button><Artwork className={`detail-art art-${track.art}`} urls={details.artwork} /><div><p className="eyebrow">SONG INFORMATION</p><h2>{details.title}</h2><p>{details.user.name} · @{details.user.handle}</p><p className="availability">{available ? 'Available to stream' : isSample(track) ? 'Sample · no audio available' : 'Unavailable or restricted'}</p><dl><div><dt>Duration</dt><dd>{formatTime(details.duration)}</dd></div><div><dt>Genre</dt><dd>{details.genre || 'Not provided'}</dd></div><div><dt>Mood</dt><dd>{details.mood || 'Not provided'}</dd></div><div><dt>Released</dt><dd>{details.release_date?.slice(0, 10) || 'Not provided'}</dd></div><div><dt>Plays</dt><dd>{details.play_count?.toLocaleString() ?? 'Not provided'}</dd></div></dl><p className="description">{details.description || 'No description provided.'}</p>{status && <p role="status" className="muted">{status}</p>}<button className="primary" disabled={!available} onClick={() => onPlay(track.id)}>Play song</button>{!isSample(track) && <button className="chip" onClick={() => onArtist(details.user.id)}>View artist profile</button>}{!isSample(track) && <a className="chip" href={`https://audius.co/${encodeURIComponent(details.user.handle)}`} target="_blank" rel="noreferrer">Artist on Audius ↗</a>}</div></section>
}
