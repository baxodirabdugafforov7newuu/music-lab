# Music Lab

A minimal music streaming MVP with a responsive dashboard, song/artist search, genre filters, a persistent audio player, and account-based liked songs.

## Run locally

Use Node.js 22.13 or later, then run:

```sh
npm run dev
```

Open http://127.0.0.1:5173. The dependencies are already installed and the local database migration has been applied.

The local sign-in flow uses the starter's development-only test account. Hosted sign-in uses ChatGPT identity. Email/password registration is not implemented.

## Included features

- Six original 48-second instrumental demo tracks with custom cover artwork.
- Search by song or artist, plus Electronic, Ambient, and Chill filters.
- Play/pause, previous/next, seek, volume, mute, and automatic advancement.
- Like/unlike and a saved-song library backed by D1, scoped to the signed-in user.
- Authentication checks and input validation for library mutations.
- Responsive layouts and accessible labels on controls.

## Data and source

- `lib/catalog.ts`: initial catalog metadata.
- `public/audio`: original synthesized instrumental demos.
- `public/covers`: generated SVG cover art.
- `db/schema.ts`: songs and user likes.
- `drizzle`: schema migration.
- `app/api/catalog` and `app/api/library`: database endpoints.
- `app/music-app.tsx` and `app/globals.css`: interface and player.

The catalog endpoint initializes the six demo songs in the database using conflict-safe inserts. Seed data is separate from schema migrations. Real music can replace these demos when the team has suitable streaming permissions.

## Verification

TypeScript checks and the production build were run. Local integration checks verified the home page, catalog, anonymous access rejection, development sign-in, durable like/unlike, invalid-song rejection, and all six audio and cover assets. Browser automation was unavailable, so visual layout and browser playback controls have not been manually verified.

## Scope

Custom playlists, downloads, sharing, shuffle, recommendations, and artist pages are deferred. The app has not been deployed or pushed to a remote Git repository.
