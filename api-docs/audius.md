# Audius: playable tracks

Reviewed official API reference: 2026-10-22.

Base URL: `https://api.audius.co/v1/`. Most read-only endpoints work without credentials; keys can provide higher limits. No fixed quota is assumed in the client. Handle 429 and service errors.

Implemented: `GET /users/search?query=...`, `/users/{id}`, `/users/{id}/tracks`, `/tracks/search?query=...`, `/tracks/trending`, `/tracks/{id}`, and stream URLs `/tracks/{id}/stream`. JSON responses wrap results in `data`, which the client unwraps. Stream URLs are for media elements, not JSON requests. Audius IDs are opaque strings, unrelated to MusicBrainz UUIDs. Search and trending accept `limit` and `offset`.

```ts
const tracks = await musicApi.audio.search('ambient', { limit: 10 })
const track = tracks.find(t => t.is_streamable === true && !t.is_stream_gated)
if (track) {
  const url = musicApi.audio.streamUrl(track.id)
  // Use url as the src of an audio element; handle media errors.
}
```

Not every track is streamable. The client does not unlock gated content, implement purchases, or provide uploads. Honor track access restrictions and provider terms. Playback access does not grant permission to redistribute recordings. Keep attribution to the uploader and link to Audius. Do not put an API secret in the React app.

Official references: [REST API](https://docs.audius.co/api/), [machine-readable API specification](https://api.audius.co/v1/swagger.yaml), [terms](https://audius.co/legal/terms-of-use).

Connection settings are optional: `VITE_AUDIUS_API_URL`, `VITE_AUDIUS_APP_NAME`, and `VITE_AUDIUS_API_KEY` (public key only). Both JSON requests and media URLs use the same base URL and public attribution settings. The official OpenAPI specification was checked again on 2026-10-31 for the connected track/user endpoints.
