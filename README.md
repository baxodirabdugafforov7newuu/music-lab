# Music Lab

Spotify-inspired React + TypeScript + Vite UI starter.

```sh
npm install
npm run dev
```

Build with `npm run build` and preview with `npm run preview`.

## UI scope

Discover, local search (songs/albums/artists), album and artist filters, session-only liked songs, and a persistent mock player. Responsive desktop sidebar and mobile navigation. Artwork is CSS-generated; no external image requests or added dependencies.

All content in `src/data/demo.ts` is fictional sample data. Type-only imports follow the existing album, artist and Audius track interfaces. Catalog and audio IDs are distinct; these demo identifiers must never be passed to a provider. The UI makes no API calls. Player buttons only change preview state; there is no audio, seek behavior, authentication or persistence.

Existing clients and provider documentation remain in `src/api/music.ts` and `api-docs/`. Future wiring can replace the fixture arrays with MusicBrainz catalog reads, Cover Art Archive artwork, and separately identified Audius audio/trending results. See the provider notes before integration.
