# Music Lab

Music Lab is a browser-based music player in the style of Spotify. Users can discover trending tracks, search for songs, play them, and keep liked songs and playlists on their device. Songs are streamed from the public Audius API. The project is a client-side single-page application with no backend of its own.

Built with React 19, TypeScript and Vite.

## Features

- Discover, Search and Your library views
- Live search and trending tracks from Audius (search starts 350 ms after the user stops typing)
- Audio player: play and pause, previous and next, seek bar, volume, shuffle, repeat (off, all, one)
- Play queue ("Up next") with add and remove
- Liked songs, user-created playlists and a recently played list (last 50 tracks), all saved in the browser
- Fallback sample catalog when the live service cannot be reached
- Keyboard and screen-reader support: skip link, labelled controls, status messages

## Quick start

Requirements: Node.js (current LTS) and npm.

```sh
git clone https://github.com/baxodirabdugafforov7newuu/music-lab.git
cd music-lab
npm install
npm run dev
```

Open the address printed in the terminal (normally http://localhost:5173/) and keep the terminal open while using the app.

Other commands:

| Command | Purpose |
| --- | --- |
| `npm run build` | Type-check with `tsc` and create a production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `node --experimental-transform-types --test tests/music-api.test.mjs` | Run the API client tests |

## Project structure

```
music-lab/
├── index.html              Page shell
├── src/
│   ├── main.tsx            Entry point, mounts <App />
│   ├── App.tsx             User interface, player logic and screen state
│   ├── useSavedState.ts    State hook that saves to localStorage
│   ├── api/music.ts        API client for Audius, MusicBrainz and Cover Art Archive
│   ├── data/demo.ts        Fictional sample data used as a fallback
│   └── styles.css          All styling
├── tests/music-api.test.mjs  Unit tests for the API client
├── api-docs/               Notes on each external music service
└── docs/                   Project documentation (see below)
```

## Documentation

| Document | Contents |
| --- | --- |
| [docs/architecture.md](docs/architecture.md) | System context, components, data flow, design decisions, limitations |
| [docs/requirements.md](docs/requirements.md) | Functional and non-functional requirements, user stories |
| [docs/data-model.md](docs/data-model.md) | Data types and browser storage format |
| [docs/setup-and-testing.md](docs/setup-and-testing.md) | Installation, testing, manual test checklist, troubleshooting |
| [api-docs/README.md](api-docs/README.md) | How to use the API client and the external services |

## Data sources and attribution

- **Audius** provides the playable audio and track metadata. Only tracks that are streamable and not stream-gated are shown.
- **MusicBrainz** (song, artist and album metadata) and **Cover Art Archive** (album images) are implemented in the API client but are not yet used by the interface.
- Albums and artists shown on the Discover page, and the fallback tracks, are fictional sample data from `src/data/demo.ts`. They have no audio.

Playback access does not give permission to redistribute recordings. Credit goes to the uploaders on Audius.
