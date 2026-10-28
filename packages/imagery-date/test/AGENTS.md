# Tests

The coding rules for tests and recordings are in the root AGENTS.md (recordings). These review rules apply to the
files here.

## Code Review Rules

### Recordings

- Flag a change to `recordings/` that the recorder did not write: values edited by hand, a recording changed while
  its spec's expected values did not, or a recording that grew to hundreds of kilobytes (a lost field mask). Safe
  path: `IMAGERY_DATE_RECORD_ONLY=<provider> pnpm record`, then update the spec and the "Tested" line in
  PROVIDERS.md.
- Flag a recorded URL that contains a key or token. Safe path: re-record; the recorder strips `key` and `token`.

### Determinism

- Flag a unit or recorded test that reaches the network, reads the real time or real randomness, or waits on a timer.
  Safe path: `RecordedHttpClient`, `scriptedExchange`, `FixedClock` and `SequenceRandom`; live calls belong only in
  `live/`.
