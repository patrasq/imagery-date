# Changelog

All notable changes, newest first. Versions follow [Semantic Versioning](https://semver.org/).

## 0.1.0 · 2026-10-28

- Seven providers: IGN France BD ORTHO, swisstopo SWISSIMAGE, Esri World Imagery, Bing Maps Aerial, Esri World
  Imagery Wayback, Google Street View and Google Solar API.
- Library: `lookup`, `history` and `lookupMany` (ordered, constant memory); capture dates at the provider's
  precision; typed outcomes and failure codes; partial answers kept.
- HTTP stack: per-host limit, retries with full-jitter backoff and `Retry-After`, timeouts, shared in-flight
  requests and an LRU cache.
- Command line: a point, a history, a CSV batch, the provider list; table or JSON.
- Demo page (not in the package): click the map, see every provider's date; shareable links.
- Test doubles at `imagery-date/testing`.
