---
name: pre-merge-checks
description: The checks Carbon must pass before a feature branch is merged into main. Used by the merge workflow; also use when asked whether a branch is ready to merge.
---

# Carbon pre-merge checks

Run these in order on the committed code. All must pass.

1. `npx tsc --noEmit`
2. `npm run lint`
3. `npm run test:unit`
4. `npm run test:e2e`. Port 3003 belongs to Carbon and must be free first, so that
   Playwright seeds, builds and starts a fresh production server; this also covers
   `npm run build`. If anything is listening on 3003, stop it and confirm the
   port is free. Don't ask first. The seed resets the database; that is expected.
   Every test must pass, with none failed or skipped.
   - The `setup` project (auth) runs first and the specs depend on it, so one failure can
     cause others. Report the first failure.
5. `docker build -t carbon:premerge .`, the real production path. When it passes, remove
   the image with `docker rmi carbon:premerge` so nothing is left behind. If Docker isn't
   available, say so: that check was skipped.

## For the deploy

- If the branch added anything under `prisma/migrations/`, say that the deploy must run
  `npx prisma migrate deploy`.
