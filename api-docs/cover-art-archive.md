# Cover Art Archive: album images

Reviewed official API documentation: 2026-10-22.

`artwork.frontUrl(releaseMbid, 500)` produces `https://coverartarchive.org/release/{mbid}/front-500`. Sizes 250, 500 and 1200 are supported by the client. This takes a MusicBrainz release UUID, not a recording or artist ID. No API key is required.

The service redirects image requests to its storage. Missing artwork returns 404; throttling can return 503. Use an image placeholder and allow redirects. The client returns a URL without making a request or checking availability. For a full listing, the upstream endpoint is `GET /release/{mbid}/`; it is not wrapped here.

Album images remain subject to their owners' rights; a free API is not a blanket image license. Preserve source links and review appropriate use for your submission and any later publication.

Official sources: [API and response codes](https://musicbrainz.org/doc/Cover_Art_Archive/API), [archive overview](https://musicbrainz.org/doc/Cover_Art_Archive).
