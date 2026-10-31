# Music Lab APIs

The React/TypeScript app can import `musicApi` from `src/api/music.ts`. These are reusable read-only client functions, not a hosted backend. Accounts are outside the client-only scope.

## Implemented

| Feature | Client method | Provider |
| --- | --- | --- |
| Song search/details | `songs.search(query, options)`, `songs.get(mbid)` | MusicBrainz recordings |
| Artist search/details | `artists.search(query, options)`, `artists.get(mbid)` | MusicBrainz |
| Artist albums | `artists.albums(mbid, options)` | MusicBrainz releases |
| Album search/track list | `albums.search(query, options)`, `albums.get(mbid)` | MusicBrainz releases |
| Album image URL | `artwork.frontUrl(releaseMbid, size)` | Cover Art Archive |
| Playable song search/details | `audio.search(query, options)`, `audio.get(audiusId)` | Audius |
| Playable artist profiles/tracks | `users.search(query)`, `users.get(id)`, `users.tracks(id)` | Audius |
| Trending audio | `audio.trending(options)` | Audius |
| Stream URL | `audio.streamUrl(audiusId)` | Audius |

No API keys or new dependencies are required for the implemented public reads. Use a modern browser with fetch and AbortSignal.timeout. MusicBrainz UUIDs and Audius IDs are separate namespaces: never send one provider's ID to another. MusicBrainz has no audio and its recordings cannot automatically be matched to Audius tracks.

## Example

```tsx
import { musicApi } from './api/music'

const songs = await musicApi.songs.search('Radiohead', { limit: 10 })
const artists = await musicApi.artists.search('Radiohead')
const albums = await musicApi.artists.albums(artists.items[0].id)
const album = albums.items[0]
if (album) {
  const imageUrl = musicApi.artwork.frontUrl(album.id)
  const details = await musicApi.albums.get(album.id)
  console.log(imageUrl, details.media)
}
const tracks = await musicApi.audio.search('ambient')
const playable = tracks.find(track => track.is_streamable === true && !track.is_stream_gated)
if (playable) console.log(musicApi.audio.streamUrl(playable.id))
```

Check arrays before indexing in real UI code. Put asynchronous calls in event handlers or effects and catch failures. Display loading, empty and error states. MusicBrainz search returns `{ items, total, offset }`; Audius returns an array. Search options default to 20 results at offset 0; limit must be 1–100. Durations: MusicBrainz `length` is milliseconds; Audius `duration` is seconds. Optional fields may be absent.

For playback, set an `<audio controls src={url}>` after a user action and handle media errors. Streams may be unavailable, removed, gated or restricted. For images, handle `onError` with a placeholder: a generated URL does not guarantee artwork exists.

## Reliability and deployment

Requests time out after 10 seconds. Non-success responses throw `MusicApiError` with an HTTP status; network/timeout failures retain native fetch errors. No automatic retries: let the user retry after a delay, especially on 429/503. MusicBrainz requests are serialized at 1.1-second intervals within each client instance. Import the shared singleton. This does not coordinate multiple tabs, users or servers behind one IP; add a shared backend queue/cache before wider deployment. Avoid searching on every keystroke: submit a form or debounce.

MusicBrainz requires application identification. Browser JavaScript cannot reliably set User-Agent; browsers supply their own and identify the requesting origin. For server use, supply a custom fetch wrapper that sets a meaningful User-Agent such as `MusicLab/0.1 (your-real-project-contact-url)`. Use a shared server queue if you deploy a proxy. Only optional public API keys may be configured; never add secrets to browser source or VITE variables; Vite bundles those publicly.

## Validation

Run from the repository root with Node 22.18+:

```sh
npm test
npm run build
```

Tests mock providers and cover URL encoding, validation, paging, errors, artwork URLs, audio responses and MusicBrainz throttling. They do not establish live service availability. The production build, API/storage tests, and desktop/mobile browser suite are verified. A live Audius trending request was also checked. Verify CORS and playback from your deployed origin before the demo.

Provider notes and official sources: [MusicBrainz](musicbrainz.md), [Cover Art Archive](cover-art-archive.md), [Audius](audius.md), [Last.fm](lastfm.md), [Jamendo](jamendo.md), [ListenBrainz](listenbrainz.md). The latter three are future options, not implemented integrations. These notes summarize integration choices rather than copying provider documentation.
