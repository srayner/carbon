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

### Content

- **Home page:** the published page with the slug `home` is shown at `/`.
- **Pages:** published when their publish date has passed. Pages with no date
  or a future date are drafts, visible only to admins as a preview.
- **Blocks:** Heading, Paragraph, RichText (links, tables, images), Image,
  File (download) and Card. Consecutive Card blocks display as a grid.

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
