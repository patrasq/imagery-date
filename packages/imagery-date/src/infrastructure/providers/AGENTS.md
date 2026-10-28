# Providers

The coding rules for this directory are in the root AGENTS.md (provider-data). These review rules apply to the files
here.

## Code Review Rules

### Capture values

- Flag a capture date, precision, resolution, product or zoom range that the response does not state, including a
  value estimated, rounded, defaulted or taken from a copyright or attribution year. Safe path: `null` for a field the
  source does not state, and the source's own precision (day, month, year or range).

### Failures

- Flag a provider failure that can reject the whole lookup, or a failure after some captures were read that drops
  them. Safe path: a `failed` outcome with a `FailureCode`, or `partial` with the captures already found.

### Sources

- Flag a new provider without a terms class and a PROVIDERS.md section, a billable provider enabled by default, or a
  request that asks for fields the mapper does not use. Safe path: the descriptor and PROVIDERS.md entry from the
  `add-provider` skill; a field mask (`PROPERTYNAME`, `fields=`) as IGN and Google Solar use.
