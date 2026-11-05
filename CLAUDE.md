## End-to-end tests

Run them only with `npm run test:e2e`; pass Playwright options after `--`. If port
3003 is free, Playwright seeds the database, builds, starts a production server, runs
the tests and stops it. If a server is already running on 3003, Playwright uses it as
it is, with no seed and no build. See "Testing" in `README.md`.

## Merging

Before merging, run the checks in the `pre-merge-checks` skill (`.claude/skills/pre-merge-checks/`).
