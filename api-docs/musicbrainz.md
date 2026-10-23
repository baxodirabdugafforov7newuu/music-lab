# MusicBrainz: songs, artists and albums

Reviewed official API documentation: 2026-10-22.

Base URL: `https://musicbrainz.org/ws/2/`. Public metadata reads need no key. Noncommercial use is free; identify the application and keep requests to at most one per second. The client spaces calls at 1.1 seconds, but a public deployment needs shared throttling.

Used endpoints: `GET /recording?query=...`, `/recording/{mbid}?inc=artists+releases`, `/artist?query=...`, `/artist/{mbid}`, `/release?artist={mbid}`, `/release?query=...`, `/release/{mbid}?inc=artists+recordings`. All include `fmt=json`. A recording represents recorded audio metadata; a release represents a particular album edition. Editions can duplicate titles and track lists. This API does not stream songs.

```sh
curl 'https://musicbrainz.org/ws/2/recording?query=Radiohead&limit=5&fmt=json' \
  -H 'User-Agent: MusicLab/0.1 (replace-with-your-project-contact-url)'
```

Search recordings return `recordings`, `count`, and `offset`. The client maps these to a Page. Preserve provider IDs and credit names. Some supplementary data has different license conditions from core data; review the data license before redistributing a dataset. Credit MusicBrainz and link entities back to their source.

Official references: [API](https://musicbrainz.org/doc/MusicBrainz_API), [search](https://musicbrainz.org/doc/MusicBrainz_API/Search), [rate limiting](https://musicbrainz.org/doc/MusicBrainz_API/Rate_Limiting), [data licenses](https://musicbrainz.org/doc/About/Data_License).
