/** Read-only live smoke test. Node 24 and curl required; preserves proxy settings. */
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { mkdir, writeFile } from 'node:fs/promises'
const exec = promisify(execFile)
const output = process.argv[2] || 'api-docs/results/retrieval-latest.json'
const checks = [
  { name: 'MusicBrainz artist search', url: 'https://musicbrainz.org/ws/2/artist?query=Radiohead&limit=2&fmt=json', validate: d => Array.isArray(d.artists) && d.artists.length > 0 && typeof d.artists[0].id === 'string' },
  { name: 'MusicBrainz recording search', url: 'https://musicbrainz.org/ws/2/recording?query=Karma%20Police&limit=2&fmt=json', validate: d => Array.isArray(d.recordings) && d.recordings.length > 0 },
  { name: 'MusicBrainz album search', url: 'https://musicbrainz.org/ws/2/release?query=OK%20Computer&limit=2&fmt=json', validate: d => Array.isArray(d.releases) && d.releases.length > 0 },
  { name: 'Audius track search', url: 'https://api.audius.co/v1/tracks/search?query=ambient&limit=2&offset=0', validate: d => Array.isArray(d.data) && d.data.length > 0 && typeof d.data[0].id === 'string' },
  { name: 'Audius trending', url: 'https://api.audius.co/v1/tracks/trending?limit=2&offset=0', validate: d => Array.isArray(d.data) && d.data.length > 0 },
  { name: 'Cover Art Archive metadata', url: 'https://coverartarchive.org/release/f5093c06-23e3-4f01-9c39-40f85e2d08c3/', validate: d => Array.isArray(d.images) },
]
const results = []
for (const check of checks) {
  // Space MusicBrainz calls even after a failed request.
  if (check.url.includes('musicbrainz.org') && results.length) await new Promise(r => setTimeout(r, 1100))
  const started = Date.now()
  try {
    const { stdout } = await exec('curl', ['--silent', '--show-error', '--location', '--max-time', '15', '--max-filesize', '1048576', '--user-agent', 'MusicLab/0.1 (https://github.com/baxodirabdugafforov7newuu/music-lab)', '--header', 'Accept: application/json', '--write-out', '\n%{http_code}', check.url], { maxBuffer: 2 * 1024 * 1024 })
    const split = stdout.lastIndexOf('\n')
    const status = Number(stdout.slice(split + 1))
    let valid = false
    let parseError = null
    if (status === 200) { try { valid = check.validate(JSON.parse(stdout.slice(0, split))) } catch { parseError = 'Response was not valid JSON' } }
    results.push({ name: check.name, url: check.url, outcome: status === 200 && valid ? 'PASS' : 'FAIL', httpStatus: status, schemaValid: valid, parseError, elapsedMs: Date.now() - started })
  } catch (error) {
    results.push({ name: check.name, url: check.url, outcome: 'BLOCKED', httpStatus: null, elapsedMs: Date.now() - started, error: String(error.stderr || error.message).trim() })
  }
}
const report = { recordedAt: new Date().toISOString(), scope: 'Direct provider HTTP reads with minimal response-shape checks; not client integration, browser CORS, artwork rendering or audio playback.', results }
await mkdir(output.substring(0, output.lastIndexOf('/')) || '.', { recursive: true })
await writeFile(output, JSON.stringify(report, null, 2) + '\n')
for (const r of results) console.log(`${r.outcome}: ${r.name}${r.httpStatus ? ` (HTTP ${r.httpStatus})` : ''}`)
console.log(`Report: ${output}`)
if (results.some(r => r.outcome !== 'PASS')) process.exitCode = 1
