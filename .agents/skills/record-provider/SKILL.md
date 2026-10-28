---
name: record-provider
description: Re-record imagery-date provider responses from the live services (`pnpm record`) after a provider changed its service or a new recording case was added, and check the recordings before committing.
---

# Record provider responses

`pnpm record` calls the live services and rewrites `packages/imagery-date/test/recordings/`. It needs network access,
and with `IMAGERY_DATE_GOOGLE_KEY` set it calls the two Google APIs, which Google bills.

1. Get the user's approval to call the live services. Say whether the Google providers are included.
2. Record only what changed: `IMAGERY_DATE_RECORD_ONLY=<provider-id> pnpm record`. Without
   `IMAGERY_DATE_GOOGLE_KEY` the Google cases are skipped. Never print the key or pass it on the command line; the user
   sets it in their environment.
3. Check the diff before anything else:
   - `git diff --stat packages/imagery-date/test/recordings` — a recording that grew to hundreds of kilobytes means a
     field mask was lost.
   - `rg -n '[?&](key|token)=' packages/imagery-date/test/recordings` must print nothing.
   - Read the changed dates: a provider that published new imagery changes the expected values in its spec; a
     provider that changed its response shape fails schema parsing.
4. Update the expected values in the spec and the "Tested" line in PROVIDERS.md (date of recording and result).
5. `pnpm verify`.

Never edit a recording by hand. If a service is slow or returns 5xx, the recorder retries; the Wayback metadata
services take 25–61 s per request (D-009).

`pnpm test:live` checks the keyless providers against the live services without writing recordings; use it to find
which provider changed before recording.
