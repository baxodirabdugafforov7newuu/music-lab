import { test } from 'node:test'
import assert from 'node:assert/strict'
import { canPlay, formatTime, liveTracks, trackList, likeList, playlistList, readSaved } from '../src/library.ts'
const track = { id: 'abc12', title: 'Song', duration: 60, album: 'Audius', art: 'blue', user: { id: 'user1', name: 'Artist', handle: 'artist' } }
test('only usable public tracks can enter playback', () => {
  assert.equal(canPlay(track), true)
  assert.deepEqual(liveTracks([track, { ...track, id: 'demoAudio1' }, { ...track, is_stream_gated: true }, { ...track, is_streamable: false }, { ...track, is_available: false }, { ...track, user: null }]), [track])
})
test('storage guards validate nested tracks, IDs, and duration', () => {
  assert.equal(trackList([track]), true)
  assert.equal(trackList(['bad']), false)
  assert.equal(trackList([{ id: 'x' }]), false)
  assert.equal(trackList([{ ...track, id: '../bad' }]), false)
  assert.equal(trackList([{ ...track, duration: Infinity }]), false)
  assert.equal(likeList(['abc12']), true)
  assert.equal(likeList([track]), false)
  assert.equal(playlistList([{ name: 'Mix', tracks: [track] }]), true)
  assert.equal(playlistList([{ name: 'Mix', tracks: [{ id: 'x' }] }]), false)
  assert.equal(playlistList([{ name: ' '.repeat(4), tracks: [] }]), false)
})
test('storage falls back for invalid JSON, data, and inaccessible storage', () => {
  for (const data of ['{broken', 'null', '[{"id":"x"}]']) assert.deepEqual(readSaved({ getItem: () => data }, 'tracks', [], trackList), [])
  assert.deepEqual(readSaved({ getItem: () => { throw Error('blocked') } }, 'tracks', [], trackList), [])
  assert.deepEqual(readSaved({ getItem: () => JSON.stringify([track]) }, 'tracks', [], trackList), [track])
})
test('time formatting handles missing or invalid media duration', () => {
  assert.equal(formatTime(125.9), '2:05')
  assert.equal(formatTime(NaN), '0:00')
  assert.equal(formatTime(-1), '0:00')
})
