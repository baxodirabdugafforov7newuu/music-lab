# Requirements

## 1. Purpose and scope

Music Lab lets a listener find and play music in a web browser and keep personal collections without creating an account. The scope is a client-side application that uses public APIs. Accounts, uploads, purchases and social features are out of scope.

Status column: **Done** means implemented and present in the code; **Partial** means implemented only in part; **Not done** means planned but not implemented.

## 2. Users

| User | Description | Main goal |
| --- | --- | --- |
| Listener | A visitor using the app in a desktop or mobile browser, with no account | Find a song quickly and listen to it |
| Returning listener | A listener who comes back on the same device | Find liked songs and playlists again |

## 3. Functional requirements

| ID | Requirement | Status |
| --- | --- | --- |
| FR-1 | The system shall show trending tracks on the start page | Done |
| FR-2 | The system shall let the user search for tracks by title or artist name | Done |
| FR-3 | The system shall show only tracks that can be streamed | Done |
| FR-4 | The system shall play a selected track and allow pause and resume | Done |
| FR-5 | The system shall provide previous and next track controls | Done |
| FR-6 | The system shall provide a seek bar and a volume control | Done |
| FR-7 | The system shall provide shuffle and repeat (off, all, one) | Done |
| FR-8 | The system shall let the user add tracks to an "Up next" queue and remove them | Done |
| FR-9 | The system shall let the user like and unlike a track | Done |
| FR-10 | The system shall list liked tracks in "Your library" | Done |
| FR-11 | The system shall let the user create playlists with unique names (up to 80 characters) and add tracks to them | Done |
| FR-12 | The system shall list the last 50 played tracks | Done |
| FR-13 | The system shall keep likes, playlists and history after the page is reloaded | Done |
| FR-14 | The system shall filter content by type (All, Songs, Albums, Artists) | Done: live Audius tracks/artists and MusicBrainz albums |
| FR-15 | The system shall show a clear message and a sample catalog when live music cannot be loaded | Done |
| FR-16 | The system shall show album and artist information from a live source | Done: album details/track listings and Audius artist profiles connected |
| FR-17 | The system shall show album cover images | Done: provider artwork and Cover Art Archive, with generated fallback |
| FR-18 | The system shall let users log in and keep data across devices | Out of scope: requires accounts and a backend |

## 4. Non-functional requirements

| ID | Category | Requirement | Status |
| --- | --- | --- | --- |
| NFR-1 | Performance | Search shall not send a request on every keystroke (delay of 350 ms) | Done |
| NFR-2 | Performance | Out-of-date search answers shall not replace newer results | Done |
| NFR-3 | Reliability | Every network request shall time out after 10 seconds | Done |
| NFR-4 | Reliability | The app shall keep working if browser storage is unavailable or contains invalid data | Done |
| NFR-5 | Provider rules | MusicBrainz requests shall be at least 1.1 seconds apart | Done (per tab) |
| NFR-6 | Security | Input used in URLs shall be validated or escaped; no secrets in browser code | Done |
| NFR-7 | Accessibility | Controls shall have text labels; the page shall have a skip link and status announcements | Done |
| NFR-8 | Usability | The layout shall work on desktop and mobile screens | Done (responsive styles in `styles.css`) |
| NFR-9 | Maintainability | The code shall be type-checked in strict mode and the API client shall have automated tests | Done |
| NFR-10 | Portability | The production build shall be static files that any web host can serve | Done |

## 5. User stories

| ID | Story | Acceptance criteria |
| --- | --- | --- |
| US-1 | As a listener, I want to see popular music when I open the app, so I can start listening without searching | Discover page loads up to 50 trending tracks. If loading fails, a message and the sample catalog appear |
| US-2 | As a listener, I want to search by song or artist, so I can find a specific song | After typing, results update within about a second; an empty result shows "No live results. Try another search." |
| US-3 | As a listener, I want to control playback, so I can listen the way I like | Play, pause, next, previous, seek, volume, shuffle and repeat work as described in FR-4 to FR-7 |
| US-4 | As a listener, I want to like songs, so I can find them again | Liked songs appear in Your library and remain after reloading the page |
| US-5 | As a listener, I want to make playlists, so I can group songs | A new playlist appears in the library; adding the same song twice has no effect |
| US-6 | As a listener, I want to queue songs, so I can decide what plays next | A queued song plays before the normal next song; it can be removed from the queue |
| US-7 | As a listener who uses a keyboard or screen reader, I want labelled controls, so I can use the app without a mouse | All player and navigation controls have accessible names; the skip link moves focus to the content |

## 6. Constraints and assumptions

- The browser must support `fetch`, `AbortSignal.timeout` and `localStorage`.
- Audio is available only for tracks that Audius allows to stream; some tracks can be removed or restricted.
- The user needs an internet connection for live music. Without one, only the sample catalog appears, and it has no audio.
- Use of Audius and MusicBrainz data must follow their terms and attribution rules.
