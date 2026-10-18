# Arshan Ashraf — portfolio and admin platform

A Next.js App Router portfolio for Arshan Ashraf. The public site presents project case studies, skills, experience, achievements, and published writing. A private, single-owner dashboard manages the same content and the contact inbox.

For the full product, UI, architecture, data, security, operations, and launch guide, see [Project Documentation](docs/PROJECT_DOCUMENTATION.md).

## Local development

1. Use Node.js 20.9 or later and install the locked dependencies with `npm ci`.
2. Copy `.env.example` to `.env.local` and set `DATABASE_URL` to a PostgreSQL database and `APP_SECRET` to at least 32 random bytes. No provider is selected in this repository; use a provider whose current terms and free quota fit the intended use.
3. Run `npm run db:setup`. That one command applies the schema, publishes the verified projects and internship, installs the CV as the active résumé, and creates the owner account. Every step is idempotent, so it is safe to re-run after a failure or against a database that is already in use.
4. Run `npm run db:status` to confirm which database it resolved from `DATABASE_URL`, and that the environment, schema, content, owner account, and résumé are all in place.
5. Run `npm run dev`.

To run step 3 without any prompts — needed when pointing a fresh deployment at a hosted database — set `ADMIN_EMAIL` and `ADMIN_PASSWORD` first:

```powershell
$env:DATABASE_URL = "<hosted connection string>"
$env:ADMIN_EMAIL = "you@example.com"
$env:ADMIN_PASSWORD = "<at least 14 characters>"
npm run db:setup
```

The individual steps remain available as `db:migrate`, `db:seed-content`, `db:install-resume`, and `db:ensure-admin` if only one is needed.

If `DATABASE_URL` is not configured, local development shows clearly marked sample project cards. In production, project routes only read published database records. A configured database without published projects shows an empty state.

## Deploying

`vercel.json` sets the build command to `npm run build:deploy`, which applies any unapplied migrations and then builds. A migration failure is logged but does not fail the build, because a database that is briefly unreachable or scaled to zero should not block a deployment; the public site already degrades to empty sections instead of erroring. Set `DATABASE_URL` and `APP_SECRET` in the hosting environment, run `npm run db:setup` once against that database, and redeploy.

Do not set `DB_SSL=true` for a local database. Hosted connection strings normally carry `?sslmode=require`, which enables TLS on its own, and turning the flag on against a server without TLS makes every query fail.

## Environment

- `DATABASE_URL`: PostgreSQL connection string. Keep it server-only.
- `APP_SECRET`: random server-only secret of at least 32 bytes used to key anonymous rate-limit identifiers. Sign-in and the contact form refuse requests while it is missing or shorter than 32 bytes.
- `DB_SSL=true`: enable TLS when the database requires it and the connection string does not already say so. Certificate verification remains enabled unless a provider requires another configuration.
- `DB_SSL_REJECT_UNAUTHORIZED=false`: only use when the database provider documents that requirement.
- `NEXT_PUBLIC_SITE_URL`: optional canonical public URL. Falls back to Vercel's production URL, then to the request host.

Never commit `.env.local` or database credentials.

## Content and operations

- `/admin` is protected by database-backed sessions. Sessions use HTTP-only, same-site cookies and expire after seven days. Admin APIs repeat authorization checks server-side.
- Content mutations validate fields and use parameterized PostgreSQL queries. Deletes require explicit confirmation. Passwords use Node.js `scrypt`; owner setup is a local CLI operation.
- Projects seeded from the brief are private drafts and visibly marked as samples. No role, date, outcome, or metric is fabricated. Set confidence levels for skills in the dashboard rather than inferring them.
- The contact form is accepted only after a `privacy_retention_days` value (1–365) is set in **Admin → Settings**. Contact submissions are rate-limited and stored in the admin inbox; no email is sent. Old messages are pruned when a submission arrives or an administrator opens the inbox.
- Blog authoring accepts plain text and a small safe Markdown subset. Arbitrary HTML is rendered as text, not markup. Draft posts are private.
- Project/blog media uploads, scheduled publishing, mobile client, analytics, and deployment are intentionally deferred. Résumé PDFs are stored in the database, so they survive deploys without a persistent disk. No provider accounts or paid services are provisioned by this repository.

Before launch, choose the hosting and database services, verify their current terms and free quotas against the intended professional use, configure the canonical site URL, review message retention/privacy copy, and replace the draft project content with verified case-study details.


## Interactive experience and résumé versions

The public homepage uses a once-per-tab, sub-second Systems Atlas intro; CSS and IntersectionObserver reveals; an owner-data-backed technology marquee and category explorer; and a keyboard/touch project showcase. Abstract technical maps stand in for unavailable project screenshots. Reduced-motion preferences disable the continuous loops and entry motion. No animation package has been added.

The admin now includes `/admin/resume`. The additive `002_resume_and_portfolio_enhancements.sql` migration creates versioned résumé metadata and a single-active constraint, and adds an owner-controlled `currently_building` project flag. Run `npm run db:migrate` to apply both current and future unapplied migrations.
PDFs are validated (signature, MIME/extension, max 8 MB), stored with generated opaque names, and streamed via `/api/resume`; storage keys are never returned as paths. The bytes live in PostgreSQL (`resume_files`, created by `003_resume_storage.sql`) rather than on disk, because a serverless host offers no writable filesystem outside `/tmp` and `/tmp` is per-instance. Uploads therefore survive a deploy and remain readable in production, and no `RESUME_STORAGE_DIR` or persistent disk is required. Admin upload/list/activate/delete require migrations 002 and 003 and a configured database. When there is no active readable PDF, public controls direct visitors to Contact.

The owner may mark one project as “Currently building” in its admin form. It appears on the public home page only after it is published and is not marked sample. A unique partial index prevents multiple current projects.

Verification commands:

```powershell
npx next typegen
npx tsc --noEmit --incremental false
npm run lint
npm run build
```

A database-backed migration or upload was not exercised unless a working `DATABASE_URL` is configured.
