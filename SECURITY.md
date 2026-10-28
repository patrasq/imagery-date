# Security

Report a vulnerability privately through GitHub's "Report a vulnerability" (Security → Advisories) on
https://github.com/patrasq/imagery-date. Please do not open a public issue for it.

How keys are handled:

- A key is held in memory by the client that was given it and is sent only to its provider (Google).
- Failure details name hosts, never full URLs, so a key never appears in a report or a log line.
- Recordings strip `key` and `token` from every URL before they are written.
- The demo page keeps a key on the device only when "Remember the key" is ticked (browser local storage).
