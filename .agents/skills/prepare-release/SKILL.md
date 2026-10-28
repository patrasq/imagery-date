---
name: prepare-release
description: Prepare an imagery-date release commit (version, CHANGELOG, verify) and stop before the tag; the maintainer tags and pushes.
---

# Prepare a release

The maintainer publishes by pushing a `v<version>` tag; `.github/workflows/release.yml` verifies and publishes to npm
(CONTRIBUTING.md, Releasing). This skill prepares the commit and stops.

1. Ask for the version if the user did not give one. Semver on the public API (`src/index.ts`,
   `imagery-date/testing`, CLI arguments, JSON fields, CSV columns, exit codes): breaking → minor while the version is
   0.x, otherwise patch.
2. Set `version` in `packages/imagery-date/package.json`.
3. In CHANGELOG.md, turn the unreleased section into `## <version> · <YYYY-MM-DD>` (today's date), in the existing
   style: what changed for users, one line each.
4. `pnpm verify`.
5. Commit: `Release <version>`.
6. Stop. Report the two commands for the maintainer and do not run them:

   ```sh
   git tag v<version>
   git push origin main v<version>
   ```

The release workflow refuses a tag that does not match the package version. It authenticates with the `NPM_TOKEN`
secret until trusted publishing is configured (D-018); if the token has expired, the maintainer creates a new one.
