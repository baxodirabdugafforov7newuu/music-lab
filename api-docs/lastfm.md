# Last.fm: optional enrichment

Not implemented. Potential uses: artist descriptions, tags, similar artists and charts. This is metadata, not a full-song streaming service.

Obtain a key before integration. Review current noncommercial eligibility, quotas, attribution and caching rules before use. Call authenticated services through a backend; never commit secrets. Suggested server variable: `LASTFM_API_KEY` (no variable is needed by the current client).

Official sources: [API documentation](https://www.last.fm/api), [API account](https://www.last.fm/api/account/create), [terms](https://www.last.fm/api/tos). These are reference links; this provider was not live-tested or fully reviewed for this change.
