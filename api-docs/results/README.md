# Retrieval test results — 2026-10-25

Branch tested: `api-docs` at `df64660318685f583c63432060c23946a444aca3`.

## Observed results

| Check | Result |
| --- | --- |
| Existing mocked client test command | PASS (exit 0; runner reported one passing test file) |
| MusicBrainz artist, recording and release searches | BLOCKED |
| Audius search and trending | BLOCKED |
| Cover Art Archive release metadata | BLOCKED |

All six live requests failed before receiving an HTTP response because the execution environment could not connect to its configured proxy on port 8080. This is an environment access failure, not evidence of provider downtime or a provider HTTP error. No live provider data was retrieved. Exact timestamps, URLs, elapsed times and curl errors are in [the JSON report](retrieval-2026-10-25.json).

The mocked command was `node --experimental-transform-types --test tests/music-api.test.mjs` on Node v24.19.0. It checks local client behavior with mocked fetch responses; it does not verify live retrieval.

## Repeat the live checks

From the repository root, with Node 24, curl and provider network access:

```sh
node scripts/test-retrieval.mjs
```

The script writes `api-docs/results/retrieval-latest.json` (or a path supplied as its first argument), prints each outcome, and exits nonzero when any check fails or is blocked. It preserves inherited proxy settings, makes bounded read-only requests, spaces MusicBrainz requests by at least 1.1 seconds and checks minimal JSON shapes. Response bodies are not saved. A 404 on the fixed artwork fixture indicates unavailable artwork for that release, not necessarily a service outage.

Scope is direct provider HTTP retrieval only. Client-to-provider integration, browser CORS, detail/track-list endpoints, image redirects/rendering and streaming playback remain unverified. No UI integration or API client modifications were made. Last.fm, Jamendo and ListenBrainz are not implemented and were not tested.
