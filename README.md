## Carbon CMS

A small block-based CMS for publishing pages: text, images, tables, project
cards and downloadable files.

### Local development

```bash
npm install
npx prisma migrate deploy   # create the tables
npm run seed                # sample users and page (local database only)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The seed creates
`admin@example.com` and `user@example.com`, using the passwords in
`USER_PASSWORD_ADMIN` and `USER_PASSWORD_USER` in `.env`. It refuses to run
unless `DATABASE_URL` points at localhost.

### Testing

```bash
npm run test:unit        # Vitest: the pure logic in lib/
npm run test:e2e:seeded  # reset the database with the seed, then run Playwright
npm run test:e2e         # Playwright against the database as it is
```

`npm run seed` **wipes the database** and rebuilds a known state: the two
accounts, the preset templates, categories, and pages used by the tests
(`block-showcase` has one of every block type; `secret-draft` and
`coming-soon` are unpublished). Playwright reuses the dev server on port 3000
or starts one. Run `npx playwright install chromium` once for the browser.

Specs are grouped by who is using the site, and each group runs as a
Playwright project:

- `e2e/guest/` not logged in. The public site, and being kept out of `/admin`
  and `/api`.
- `e2e/user/` logged in as `user@example.com` (role USER).
- `e2e/admin/` logged in as `admin@example.com`: the editor and the theme
  screen.

`e2e/auth.setup.ts` logs in once per role and saves the session under
`playwright/.auth/`. Specs that change data put it back, so they can be run
again without reseeding.

### Content

- **Home page:** the published page with the slug `home` is shown at `/`.
- **Pages:** published when their publish date has passed. Pages with no date
  or a future date are drafts, visible only to admins as a preview.
- **Blocks:** Heading, Paragraph, RichText (links, tables, images), Image,
  File (download), Card and Query. Consecutive Card blocks display as a grid.

### Adding a block

A block is three files, found by the block's name (`Foo` below):

1. `config/blocks/foo.ts`: the block's `name`, `icon` and `properties`, added
   to `ALL_BLOCKS` in `config/blocks/index.ts`.
2. `components/Block/FooEditable.tsx`: how it looks and edits in the editor
   (client side). Receives `{ block, onChange(patch) }`.
3. `components/Block/FooView.tsx`: how it renders on the public site (server
   side, may use the database). Receives `{ block, shared, currentPageId }`;
   `shared` is the id, class and style every block gets.

Types come from the config, and renderers load only when a page uses them.
`npm run lint` also runs `npm run check:blocks`, which fails if a block is
missing either renderer file.

### Deploying

- **Migrations:** run `prisma migrate deploy` against the production database
  on each deploy (`~/scripts/deploy` does this when `migrations: true`).
- **Uploads:** files are stored in `UPLOAD_DIR` (`/data/uploads` in the
  Docker image). Mount a persistent volume there in the compose file, for
  example `carbon-uploads:/data/uploads`.
- **Upload size:** the app allows files up to 50 MB. If a reverse proxy sits
  in front (nginx), raise `client_max_body_size` to match, as the default is
  1 MB.
- **First admin:** accounts need `emailVerified` set and `role = ADMIN` in the
  database before they can use the admin area. Self-registered accounts are
  `USER` and cannot log in until verified.
- **Environment:** `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL` (plus the OAuth
  client IDs and secrets if those providers are used).
