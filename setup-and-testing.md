# Setup and testing

## Installation and configuration

Use Node.js 22.18+ and npm. From the repository root:

```sh
npm ci
npm run dev
```

Open the address Vite prints (normally `http://localhost:5173`). Leave the server running while using the app. `npm run build` creates static production files in `dist/`; `npm run preview` serves that build locally.

API settings are optional. Copy `.env.example` to `.env.local` to set the Audius base URL, application name, or public API key. Restart Vite after changes. Build-time settings must also be supplied when building on a hosting service. No API secret is used; do not add one to browser environment variables. MusicBrainz and Cover Art Archive use their public endpoints.

## Automated checks

```sh
npm test
npm run build
npm run test:e2e
# Or run the complete sequence:
npm run check
```

`npm test` uses Node's native TypeScript support and built-in test runner. No experimental transformation flag is needed. It runs 15 tests across `tests/music-api.test.mjs` and `tests/library.test.mjs`:

- MusicBrainz query escaping, pagination, input validation, artwork URLs, and request spacing after errors.
- Audius response handling, track/profile endpoints, configurable public connection settings, HTTP failures, and timeout cancellation.
- Stream eligibility, nested storage validation, invalid JSON, unavailable storage, and safe duration formatting.

`npm run test:e2e` uses Playwright with Google Chrome. Install Chrome if absent (`npx playwright install chrome`). The test runner starts Vite on `127.0.0.1:5173`. A local server and browser processes must be allowed by your environment.

The browser suite runs 13 scenarios on desktop and mobile (26 checks):

1. Title/artist search, empty results, and song information.
2. Slow older searches cannot overwrite newer results.
3. Artist biography, counts, and playable tracks.
4. Album metadata, track listing, and “Find audio”.
5. Persistent likes, case-insensitive playlist names, duplicate prevention, and track removal.
6. Real audio element play/pause, seeking, volume, queue priority, repeat-one, next after navigation, and history.
7. Provider failure, sample restrictions, and refresh recovery.
8. Malformed persisted data cannot crash the interface.
9. Viewport fit and keyboard skip-link focus.
10. Gated/unavailable tracks are excluded from playback.
11. Collections remain usable in memory when browser storage is blocked.
12. Song information opens the corresponding artist profile directly.
13. Repeat-all restarts a single-track playback list after the media naturally ends.

Requests are intercepted with deterministic fixtures, including a seekable WAV served with byte-range support. No API key or provider connection is required for automated tests. Failure traces are saved under ignored `test-results/`; inspect them with `npx playwright show-trace <path>`.

## Live smoke test

Automated fixtures do not establish external availability or CORS behavior at a deployed address. On the final host:

1. Open Discover, confirm live tracks load, and play one permitted track.
2. Search for a song and artist; open Info and the artist profile.
3. Search an album, open its track listing, and check its cover or graceful fallback.
4. Like a track, create a playlist, reload, and confirm both persist.
5. Check seek, volume, shuffle, repeat, queue removal, and previous/next.

A live Audius trending request was also checked during implementation and returned streamable tracks. Individual streams, metadata, artwork, and provider availability can change.

## Troubleshooting

| Problem | Action |
| --- | --- |
| Local connection refused | Run `npm run dev` and use the printed address |
| Live music unavailable | Check network and API URL; use Refresh music after service recovery |
| No live results | Try another title or artist; restricted tracks are intentionally excluded |
| Track fails to start | Press Play again or choose another track; browser autoplay and provider restrictions apply |
| Album has no cover | A generated placeholder is shown when the image is absent or fails |
| Collections disappear after closing the browser | Browser data may have been cleared; blocked storage supports session state only |
| Browser tests cannot launch | Install Google Chrome and allow local server/browser processes |
