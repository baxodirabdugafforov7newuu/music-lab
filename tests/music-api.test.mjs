import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createMusicApi, MusicApiError } from '../src/api/music.ts'
const id = '76df3287-6cda-33eb-8e9a-044b5e15ffdd'
function mock(body, status = 200) {
  const urls = []
  const api = createMusicApi({ fetch: async url => { urls.push(new URL(url)); return new Response(JSON.stringify(body), { status }) } })
  return { api, urls }
}
test('song search encodes text and normalizes pagination', async () => {
  const { api, urls } = mock({ recordings: [{ id, title: 'Song' }], count: 42 })
  const page = await api.songs.search('A & B', { limit: 5, offset: 10 })
  assert.equal(urls[0].pathname, '/ws/2/recording')
  assert.equal(urls[0].searchParams.get('query'), '"A & B"')
  assert.deepEqual(page, { items: [{ id, title: 'Song' }], total: 42, offset: 10 })
})
test('artist album browsing preserves provider count', async () => {
  const { api, urls } = mock({ releases: [], 'release-count': 12 })
  assert.deepEqual(await api.artists.albums(id), { items: [], total: 12, offset: 0 })
  assert.equal(urls[0].searchParams.get('artist'), id)
})
test('invalid input makes no request', async () => {
  const { api, urls } = mock({})
  assert.throws(() => api.songs.get('../bad'), TypeError)
  await assert.rejects(api.songs.search('  '), TypeError)
  await assert.rejects(api.albums.search('ok', { limit: 101 }), RangeError)
  assert.equal(urls.length, 0)
})
test('HTTP errors retain status', async () => {
  const { api } = mock({}, 429)
  await assert.rejects(api.audio.trending(), error => error instanceof MusicApiError && error.status === 429)
})
test('audio uses Audius IDs and unwraps data', async () => {
  const { api, urls } = mock({ data: [{ id: 'abc12', title: 'Demo' }] })
  assert.equal((await api.audio.search('ambient'))[0].id, 'abc12')
  assert.equal(urls[0].searchParams.get('query'), 'ambient')
  assert.equal(api.audio.streamUrl('abc12'), 'https://api.audius.co/v1/tracks/abc12/stream')
  assert.throws(() => api.audio.streamUrl('../bad'))
})
test('artwork uses release ID and requested size', () => {
  assert.equal(mock({}).api.artwork.frontUrl(id, 250), `https://coverartarchive.org/release/${id}/front-250`)
})
test('MusicBrainz queues requests even after failure', async () => {
  const starts = []
  const api = createMusicApi({ fetch: async () => { starts.push(Date.now()); return new Response('{}', { status: starts.length === 1 ? 503 : 200 }) } })
  await Promise.allSettled([api.artists.get(id), api.artists.get(id)])
  assert.equal(starts.length, 2)
  assert.ok(starts[1] - starts[0] >= 1050)
})
