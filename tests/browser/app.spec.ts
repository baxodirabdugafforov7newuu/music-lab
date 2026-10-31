import { test, expect, type Page } from '@playwright/test'
const user = { id: 'u123', name: 'Test Artist', handle: 'testartist', bio: 'Independent electronic musician.', location: 'Tashkent', follower_count: 42, track_count: 2 }
const tracks = [
  { id: 'abc12', title: 'First Light', duration: 30, user, is_streamable: true, is_available: true, genre: 'Electronic', mood: 'Peaceful', description: 'A song for the morning.', play_count: 123, release_date: '2026-10-01' },
  { id: 'def34', title: 'Afterglow', duration: 30, user, is_streamable: true, is_available: true },
]
const mbid = '76df3287-6cda-33eb-8e9a-044b5e15ffdd'
const album = { id: mbid, title: 'First Light', date: '2026-10-01', 'artist-credit': [{ name: user.name, artist: { id: mbid, name: user.name } }] }
const wav = Buffer.alloc(44 + 8000 * 2 * 30)
wav.write('RIFF'); wav.writeUInt32LE(wav.length - 8, 4); wav.write('WAVEfmt ', 8); wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22); wav.writeUInt32LE(8000, 24); wav.writeUInt32LE(16000, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(wav.length - 44, 40)
async function api(page: Page) {
  await page.route('https://api.audius.co/**', async route => {
    const url = new URL(route.request().url())
    if (url.pathname.endsWith('/stream')) {
      const range = route.request().headers()['range']
      const start = Number(range?.match(/bytes=(\d+)/)?.[1] ?? 0)
      await route.fulfill({ status: range ? 206 : 200, contentType: 'audio/wav', headers: { 'Accept-Ranges': 'bytes', 'Content-Length': String(wav.length - start), ...(range ? { 'Content-Range': `bytes ${start}-${wav.length - 1}/${wav.length}` } : {}) }, body: wav.subarray(start) }); return
    }
    let data: unknown = tracks
    if (url.pathname.endsWith('/users/search')) data = [user]
    else if (url.pathname.endsWith('/users/u123')) data = user
    else if (/\/tracks\/(abc12|def34)$/.test(url.pathname)) data = tracks.find(t => url.pathname.endsWith(t.id))
    else if (url.pathname.endsWith('/tracks/search')) {
      const q = url.searchParams.get('query') ?? ''
      if (q === 'slow') { await new Promise(resolve => setTimeout(resolve, 650)); data = [tracks[0]] }
      else if (q === 'fast') data = [tracks[1]]
      else if (q === 'nothing') data = []
      else data = tracks.filter(t => `${t.title} ${t.user.name}`.toLowerCase().includes(q.toLowerCase()))
    }
    await route.fulfill({ json: { data } })
  })
  await page.route('https://musicbrainz.org/**', route => route.fulfill({ json: route.request().url().includes(`/release/${mbid}`) ? { ...album, media: [{ position: 1, tracks: [{ id: mbid, title: 'First Light', position: 1, recording: { id: mbid, title: 'First Light', length: 30000 } }] }] } : { releases: [album], count: 1 } }))
  await page.route('https://coverartarchive.org/**', route => route.fulfill({ status: 404 }))
}
async function open(page: Page) { await api(page); await page.goto('/'); await expect(page.getByRole('status').first()).toHaveText('Live music · Audius') }
const player = (page: Page) => page.getByRole('contentinfo', { name: 'Music player' })

test('search by title and artist, empty results, and song information', async ({ page }, testInfo) => {
  await open(page)
  const search = page.getByRole('textbox', { name: 'Search songs, artists and albums' })
  await search.fill('First Light')
  await expect(page.getByRole('button', { name: 'Play First Light', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Play Afterglow', exact: true })).toHaveCount(0)
  await page.getByRole('button', { name: 'Information about First Light', exact: true }).click()
  const info = page.getByRole('region', { name: 'Song information' })
  await expect(info.getByRole('heading', { name: 'First Light' })).toBeVisible()
  await expect(info).toContainText('Available to stream')
  await expect(info).toContainText('Electronic')
  await expect(info).toContainText('A song for the morning.')
  await page.screenshot({ path: `/tmp/music-lab-${testInfo.project.name}-song.png`, fullPage: true })
  await search.fill('Test Artist')
  await expect(page.getByRole('button', { name: 'Play Afterglow', exact: true })).toBeVisible()
  await search.fill('nothing')
  await expect(page.getByRole('status').first()).toHaveText('No live results. Try another search.')
})

test('older searches never overwrite newer results', async ({ page }) => {
  await open(page)
  const search = page.getByRole('textbox', { name: 'Search songs, artists and albums' })
  await search.fill('slow'); await page.waitForRequest(r => r.url().includes('query=slow'))
  await search.fill('fast'); await page.waitForResponse(r => r.url().includes('query=fast'))
  await page.waitForTimeout(700)
  await expect(page.getByRole('button', { name: 'Play Afterglow', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Play First Light', exact: true })).toHaveCount(0)
})

test('artist profile loads biography and playable tracks', async ({ page }) => {
  await open(page)
  await page.getByRole('button', { name: 'Artists', exact: true }).click()
  await page.getByRole('button', { name: 'Test Artist @testartist' }).click()
  const detail = page.getByRole('region', { name: 'Catalog details' })
  await expect(detail).toContainText('Independent electronic musician.')
  await expect(detail).toContainText('42 followers')
  await expect(page.getByRole('button', { name: 'Play First Light', exact: true })).toBeVisible()
})

test('album catalog displays release metadata and track listing', async ({ page }) => {
  await open(page)
  await page.getByRole('textbox', { name: 'Search songs, artists and albums' }).fill('First Light')
  await page.getByRole('button', { name: 'Albums', exact: true }).click()
  await page.getByRole('button', { name: /First Light Test Artist · 2026 View album/ }).click()
  const detail = page.getByRole('region', { name: 'Catalog details' })
  await expect(detail).toContainText('2026-10-01')
  await expect(detail.getByRole('button', { name: 'Find audio' })).toBeVisible()
  await detail.getByRole('button', { name: 'Find audio' }).click()
  await expect(page.getByRole('textbox', { name: 'Search songs, artists and albums' })).toHaveValue('First Light Test Artist')
})

test('likes and unique playlists persist, tracks can be removed', async ({ page }) => {
  await open(page)
  await page.getByRole('button', { name: 'Like First Light', exact: true }).click()
  await page.getByRole('button', { name: 'Your library', exact: true }).click()
  await page.getByRole('textbox', { name: 'New playlist name' }).fill('Morning')
  await page.getByRole('button', { name: 'Create playlist' }).click()
  await page.getByRole('textbox', { name: 'New playlist name' }).fill('morning')
  await page.getByRole('button', { name: 'Create playlist' }).click()
  await expect(page.getByRole('status').first()).toContainText('Enter a unique playlist name')
  await page.getByRole('combobox', { name: 'Add First Light to playlist' }).selectOption('Morning')
  await page.getByRole('combobox', { name: 'Add First Light to playlist' }).selectOption('Morning')
  await page.reload()
  await page.getByRole('button', { name: 'Your library', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Morning · 1', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Unlike First Light', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Morning · 1', exact: true }).click()
  await page.getByRole('button', { name: 'Remove First Light from playlist' }).click()
  await expect(page.getByRole('button', { name: 'Morning · 0', exact: true })).toBeVisible()
})

test('real media playback, seek, volume, queue, repeat, and navigation', async ({ page }) => {
  await open(page)
  await page.getByRole('button', { name: 'Play First Light', exact: true }).click()
  await expect(player(page).getByRole('button', { name: 'Pause', exact: true })).toBeVisible()
  await expect.poll(() => page.locator('audio').evaluate((a: HTMLAudioElement) => !a.paused)).toBe(true)
  await player(page).getByRole('button', { name: 'Pause', exact: true }).click()
  await expect.poll(() => page.locator('audio').evaluate((a: HTMLAudioElement) => a.paused)).toBe(true)
  await player(page).getByRole('slider', { name: 'Seek', exact: true }).fill('10')
  await expect.poll(() => page.locator('audio').evaluate((a: HTMLAudioElement) => Math.floor(a.currentTime))).toBe(10)
  await player(page).getByRole('slider', { name: 'Volume' }).fill('35')
  await expect.poll(() => page.locator('audio').evaluate((a: HTMLAudioElement) => a.volume)).toBe(.35)
  await page.getByRole('button', { name: 'Queue Afterglow', exact: true }).click()
  await player(page).getByRole('button', { name: 'Next track' }).click()
  await expect(player(page)).toContainText('Afterglow')
  await player(page).getByRole('button', { name: 'Repeat: off' }).click()
  await player(page).getByRole('button', { name: 'Repeat: all' }).click()
  await page.locator('audio').dispatchEvent('ended')
  await expect(player(page)).toContainText('Afterglow')
  await page.getByRole('button', { name: 'Your library', exact: true }).click()
  await player(page).getByRole('button', { name: 'Next track' }).click()
  await expect(player(page)).toContainText('First Light')
  await page.getByRole('button', { name: 'History · 2', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Listening history' })).toBeVisible()
})

test('network failure gives a usable sample catalog and recovery', async ({ page }) => {
  await api(page)
  await page.route('https://api.audius.co/**', route => route.abort())
  await page.goto('/')
  await expect(page.getByRole('status').first()).toContainText('Live music unavailable')
  await page.getByRole('button', { name: 'Play Midnight Somewhere', exact: true }).click()
  await expect(page.getByRole('status').first()).toContainText('sample has no audio')
  await expect(page.getByRole('button', { name: 'Queue Midnight Somewhere', exact: true })).toBeDisabled()
  await page.unroute('https://api.audius.co/**')
  await api(page)
  await page.getByRole('button', { name: 'Refresh music' }).click()
  await expect(page.getByRole('status').first()).toHaveText('Live music · Audius')
})

test('malformed saved data cannot crash the interface', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('music-lab-tracks', JSON.stringify([{ id: '../bad' }]))
    localStorage.setItem('music-lab-playlists', JSON.stringify([{ name: 'Broken', tracks: [{ id: 'x' }] }]))
    localStorage.setItem('music-lab-history', JSON.stringify(['oops']))
    localStorage.setItem('music-lab-likes', '{broken')
  })
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message))
  await open(page)
  await page.getByRole('button', { name: 'Your library', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Make yourself a collection.' })).toBeVisible()
  expect(errors).toEqual([])
})

test('responsive layout stays within viewport and skip link focuses content', async ({ page }, testInfo) => {
  await open(page)
  await page.screenshot({ path: `/tmp/music-lab-${testInfo.project.name}-discover.png`, fullPage: true })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to music' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('#content')).toBeFocused()
})


test('restricted and unavailable music is excluded from playback', async ({ page }) => {
  await api(page)
  await page.route('https://api.audius.co/v1/tracks/trending**', route => route.fulfill({ json: { data: [
    { ...tracks[0], is_stream_gated: true }, { ...tracks[1], is_available: false },
  ] } }))
  await page.goto('/')
  await expect(page.getByRole('status').first()).toHaveText('No live results. Try another search.')
  await expect(page.getByRole('button', { name: 'Play First Light', exact: true })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Play Afterglow', exact: true })).toHaveCount(0)
})

test('blocked browser storage allows session collections', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage is disabled') } }))
  await open(page)
  await page.getByRole('button', { name: 'Like First Light', exact: true }).click()
  await page.getByRole('button', { name: 'Your library', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Unlike First Light', exact: true })).toBeVisible()
})


test('song information opens its corresponding artist profile', async ({ page }) => {
  await open(page)
  await page.getByRole('button', { name: 'Information about First Light', exact: true }).click()
  await page.getByRole('button', { name: 'View artist profile', exact: true }).click()
  const profile = page.getByRole('region', { name: 'Catalog details' })
  await expect(profile.getByRole('heading', { name: 'Test Artist', exact: true })).toBeVisible()
  await expect(profile).toContainText('Independent electronic musician.')
  await expect(page.getByRole('button', { name: 'Play Afterglow', exact: true })).toBeVisible()
})


test('repeat all restarts a single-track playback list after natural ending', async ({ page }) => {
  await open(page)
  await page.getByRole('textbox', { name: 'Search songs, artists and albums' }).fill('First Light')
  await expect(page.getByRole('button', { name: 'Play Afterglow', exact: true })).toHaveCount(0)
  await page.getByRole('button', { name: 'Play First Light', exact: true }).click()
  await player(page).getByRole('button', { name: 'Repeat: off', exact: true }).click()
  await expect(player(page).getByRole('slider', { name: 'Seek', exact: true })).toBeEnabled()
  await page.locator('audio').evaluate((a: HTMLAudioElement) => { a.currentTime = 29.8 })
  await expect.poll(() => page.locator('audio').evaluate((a: HTMLAudioElement) => a.currentTime < 5 && !a.paused)).toBe(true)
  await expect(player(page).getByRole('button', { name: 'Pause', exact: true })).toBeVisible()
})
