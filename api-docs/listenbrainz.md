# ListenBrainz: optional listening history and recommendations

Not implemented. Consider it when Music Lab has real users and needs listening history or recommendations. MusicBrainz identifiers can help connect catalog metadata to listening data, but recommendations should not be assumed available for a new account.

Read endpoint authentication requirements before integration. User listen submissions need explicit user intent and appropriate credentials. Keep tokens server-side and avoid logging listening history or tokens. Suggested future server variable: `LISTENBRAINZ_TOKEN`; the current client needs none.

Official sources: [API](https://listenbrainz.readthedocs.io/en/latest/users/api/), [project](https://listenbrainz.org/). These are reference links; this provider was not live-tested or fully reviewed for this change.
