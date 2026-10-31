import { useState } from 'react'

export function Artwork({ urls, className, label = '♪' }: { urls?: Record<string, string> | null; className: string; label?: string }) {
  const source = urls?.['480x480'] || urls?.['150x150'] || urls?.['1000x1000'] || Object.values(urls ?? {})[0]
  const safe = source && /^https?:\/\//.test(source) ? source : undefined
  const [failed, setFailed] = useState<string>()
  return <span className={className} aria-hidden="true">{safe && failed !== safe ? <img src={safe} alt="" loading="lazy" onError={() => setFailed(safe)} /> : label}</span>
}
