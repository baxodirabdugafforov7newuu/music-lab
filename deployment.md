# Deployment guide

Music Lab builds to static HTML, CSS, and JavaScript. It needs no application server, database, account system, or server-side secrets. Audio and metadata are fetched from the public providers by each visitor's browser.

## Build and verify locally

Use Node.js 22.18+:

```sh
npm ci
npm test
npm run build
npm run test:e2e
npm run preview -- --host 127.0.0.1
```

Browser tests require Google Chrome (`npx playwright install chrome` if it is not installed). Preview serves the production output at the address printed in the terminal.

## Static hosting settings

Create a static-site project on a host that serves a directory of files:

| Setting | Value |
| --- | --- |
| Source | This repository, using the reviewed release branch/commit |
| Root directory | Repository root |
| Install | `npm ci` |
| Build command | `npm run build` |
| Output / publish directory | `dist` |
| Runtime | Node.js 22.18+ for the build; no Node server in production |

If the host combines install and build in one field, use `npm ci && npm run build`. Alternatively, build locally and upload the contents of `dist/` using the host's static-file workflow. Do not publish source files, `node_modules`, or `.env.local` as the site directory.

Serve over HTTPS. The default Vite asset paths assume the app is hosted at a domain root. For hosting in a subdirectory, build with that prefix, for example:

```sh
npm run build -- --base=/music-lab/
```

There are no client-side pathname routes to rewrite; the interface changes views within the page. Keep `index.html` revalidated so visitors receive the latest build, and let the host cache Vite's hashed assets normally.

## Optional environment variables

Defaults work without credentials. Set these **before the production build** only if customization is required:

```dotenv
VITE_AUDIUS_API_URL=https://api.audius.co/v1/
VITE_AUDIUS_APP_NAME=MusicLab
VITE_AUDIUS_API_KEY=
```

Every `VITE_` value is public in the compiled app. An optional Audius API key must be public; never add an API secret, wallet key, or signing credential. Rebuild/redeploy after changing configuration. MusicBrainz and Cover Art Archive use their public URLs.

## Validate the deployed address

- Confirm the page and static assets load without a blank screen.
- Confirm Discover shows live Audius tracks; play a permitted track and check pause/resume, seeking, and volume.
- Search a title/artist. Open song information, follow View artist profile, and confirm the matching artist loads.
- Search an album. Check its track listing and its cover or fallback.
- Like a song, add it to a playlist, reload, and confirm collections remain on that browser.
- Check a phone-size viewport and keyboard navigation.
- If a provider fails, confirm the app shows a useful status and can recover with Refresh music.

The automated suite uses provider fixtures. Live checks on the deployed origin are required to establish current browser/CORS and stream availability. Missing artwork and unavailable tracks are handled by the app. The offline sample catalog cannot play audio.

## Release and rollback

Review and merge the tested changes, then deploy that commit using the host's release workflow. Record the deployed URL and commit in your normal release notes. If verification fails, restore the host's previous successful deployment or rebuild the previous commit. Browser collections remain local to each origin; changing the domain creates a separate storage area.
