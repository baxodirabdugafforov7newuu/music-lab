# Setup and testing

## 1. Installation

Requirements: Node.js (current LTS) and npm. Git is needed to clone the repository.

```sh
git clone https://github.com/baxodirabdugafforov7newuu/music-lab.git
cd music-lab
npm install
npm run dev
```

Vite prints the local address, normally `http://localhost:5173/`. If that port is busy, Vite uses the next free one, so always use the address shown in the terminal.

| Command | Result |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm run build` | Type check (`tsc -b`) and production build in `dist/` |
| `npm run preview` | Serves the `dist/` build locally |

The production build contains static files only, so it can be hosted on any static web host.

## 2. Automated tests

The tests are in `tests/music-api.test.mjs` and use Node's built-in test runner. They check the API client with a mocked `fetch`, so they need no internet connection.

```sh
node --experimental-transform-types --test tests/music-api.test.mjs
```

Result when the tests were run for this documentation: 7 tests, 7 passed, 0 failed. `npm run build` also completed successfully (19 modules, JavaScript bundle about 239 kB, 75 kB gzipped).

| # | Test | What it verifies |
| --- | --- | --- |
| 1 | Song search encodes text and normalizes pagination | Quoted query, correct path, result converted to `{ items, total, offset }` |
| 2 | Artist album browsing preserves provider count | Total count from MusicBrainz is kept; artist ID is sent |
| 3 | Invalid input makes no request | Bad IDs, empty text and out-of-range `limit` throw errors and no request is sent |
| 4 | HTTP errors retain status | A 429 response raises `MusicApiError` with `status` 429 |
| 5 | Audio uses Audius IDs and unwraps data | Audius `data` wrapper is removed; stream URL is built; bad ID is rejected |
| 6 | Artwork uses release ID and requested size | Cover Art Archive URL has the requested size |
| 7 | MusicBrainz queues requests even after failure | Two calls start at least 1.05 seconds apart, even when the first fails |

## 3. Manual test checklist (interface)

The interface has no automated tests, so these checks are done by hand. Internet access is required for live music.

| # | Steps | Expected result |
| --- | --- | --- |
| 1 | Open the app | Discover page shows trending tracks; status line reads "Live music · Audius" |
| 2 | Type a word in the search box | View changes to Search; results update after a short delay |
| 3 | Search for nonsense text such as `zzqxjkvw` | Message "No live results. Try another search." |
| 4 | Click a track | Track plays; player bar shows its title and artist |
| 5 | Press pause, then play | Playback stops and resumes |
| 6 | Drag the seek bar and the volume slider | Position and loudness change |
| 7 | Turn on shuffle, press next several times | Tracks are chosen in random order |
| 8 | Set repeat to "one" and let a track finish | The same track starts again |
| 9 | Add two tracks to the queue, press next | Queued tracks play first, in order |
| 10 | Like a track, open Your library | The track appears under Liked songs |
| 11 | Reload the page | Likes, playlists and recently played are still there |
| 12 | Create a playlist and add a track from the track list | The playlist shows the track; adding it again does not duplicate it |
| 13 | Turn off the network and reload | Message that live music is unavailable; sample catalog appears; sample tracks show "no audio" message |
| 14 | Use only the keyboard (Tab, Enter, Space) | All controls can be reached and activated; focus outline is visible |
| 15 | Narrow the browser window to phone width | Layout switches to the mobile arrangement |

## 4. Known test gaps

- No automated interface tests.
- Tests use mocked responses. They do not prove that Audius or MusicBrainz are available or that browser (CORS) requests succeed from the deployed address. This should be checked once on the final address.
- Audio playback depends on the browser and on each track's availability.

## 5. Troubleshooting

| Problem | Cause and fix |
| --- | --- |
| Browser shows `ERR_CONNECTION_REFUSED` for localhost | The dev server is not running. Run `npm run dev` and leave that terminal open |
| On Windows, "Terminate batch job (Y/N)?" appears | Ctrl+C was pressed and the server has stopped. Start it again; do not press Ctrl+C while using the app |
| `npm install` or the build reports version errors | Node.js is too old. Install the current LTS version |
| "Live music unavailable" message | No internet connection, a service outage, or a rate limit (HTTP 429). Wait and try again |
| A track does not start | The track may be removed or restricted. Choose another track |
| Likes disappear | Browser data was cleared, or the browser is in private mode and blocks storage |
