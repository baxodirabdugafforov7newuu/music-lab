# Music Lab

A responsive music discovery and playback app built with React, TypeScript, and Vite. No account or backend is required.

```sh
npm ci
npm run dev
```

Use Node.js 22.18+ and the address printed by Vite. Build with `npm run build`, then preview with `npm run preview`. Upload `dist/` to a static host to deploy.

## Features

- Live trending tracks and debounced song/artist search on Audius.
- Song information: artist, duration, availability, genre, mood, release date, description, and play count when provided.
- Live artist profiles, biographies, and available tracks.
- MusicBrainz album search, release information, track listings, and Cover Art Archive images. Catalog recordings and Audius audio have separate IDs; “Find audio” starts a search rather than assuming a match.
- Actual audio playback, pause/resume, seek, volume, previous/next, shuffle, repeat, and a removable queue.
- Persistent liked songs, unique playlists, and the last 50 played tracks on this browser.
- Desktop/mobile layouts, keyboard navigation, status announcements, and offline sample fallback.

## API configuration

The app works with the default public read-only endpoints. To customize Audius settings, copy `.env.example` to `.env.local`, then restart Vite:

```dotenv
VITE_AUDIUS_API_URL=https://api.audius.co/v1/
VITE_AUDIUS_APP_NAME=MusicLab
VITE_AUDIUS_API_KEY=
```

The API key is optional and must be a **public** key. Vite exposes every `VITE_` variable to the browser; never place API secrets there. No login or signing credentials are required for the operations used here. Requests time out after 10 seconds; MusicBrainz requests are serialized with at least 1.1 seconds between starts.

## Verification

```sh
npm test           # API and saved-data tests; no network required
npm run build      # Strict TypeScript check and production build
npm run test:e2e   # Desktop and mobile browser flows
npm run check      # All three
```

Browser tests use installed Google Chrome. If needed, install it with `npx playwright install chrome`. Test data and audio are intercepted locally, so browser tests do not depend on provider uptime.

See [deployment.md](deployment.md) for hosting instructions, [setup-and-testing.md](setup-and-testing.md) for details and [completion.md](completion.md) for the GitHub/Jira work mapping. Provider references are in [api-docs](api-docs/README.md).

Live music requires a working network and provider permission to stream. Offline sample tracks are fictional and have no audio. Collections stay on this browser; accounts and cross-device synchronization are outside this project's scope.
