---
name: pre-merge-checks
description: The checks Carbon must pass before a feature branch is merged into main. Used by the merge workflow; also use when asked whether a branch is ready to merge.
---

# Carbon pre-merge checks

Run these in order on the committed code. All must pass.

1. `npx tsc --noEmit`
2. `npm run lint`
3. `npm run test:unit`
4. `npm run build`
5. `npm run test:e2e:seeded`: seeds the database, then runs the Playwright suite. The seed
   resets the database; that is expected. Every test must pass, with none failed or skipped.
   - Playwright starts `npm run dev` on port 3003 unless something is already listening
     there. If something is, stop it first without asking, so the run uses this branch's code.
   - The `setup` project (auth) runs first and the specs depend on it, so one failure can
     cause others. Report the first failure.
6. `docker build -t carbon:premerge .`, the real production path. If Docker isn't available, say so: that check was skipped.

## For the deploy

- If the branch added anything under `prisma/migrations/`, say that the deploy must run
  `npx prisma migrate deploy`.
