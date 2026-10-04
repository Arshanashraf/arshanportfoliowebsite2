# Arshan Ashraf — portfolio and admin platform

A Next.js App Router portfolio for Arshan Ashraf. The public site presents project case studies, skills, experience, achievements, and published writing. A private, single-owner dashboard manages the same content and the contact inbox.

For the full product, UI, architecture, data, security, operations, and launch guide, see [Project Documentation](docs/PROJECT_DOCUMENTATION.md).

## Local development

1. Use Node.js 20.9 or later and install the locked dependencies with `npm ci`.
2. Copy `.env.example` to `.env.local` and set `DATABASE_URL` to a PostgreSQL database and `APP_SECRET` to at least 32 random bytes. No provider is selected in this repository; use a provider whose current terms and free quota fit the intended use.
3. Run `npm run db:migrate` to create the schema and add the owner-provided project candidates as **draft** sample content.
4. Run `npm run admin:create` in an interactive terminal to create the first owner account. The password is entered without echo. There is no public sign-up. To rotate the password later and revoke all active sessions, run `npm run admin:update`.
5. Run `npm run dev`.

If `DATABASE_URL` is not configured, local development shows clearly marked sample project cards. In production, project routes only read published database records. A configured database without published projects shows an empty state.

## Environment

- `DATABASE_URL`: PostgreSQL connection string. Keep it server-only.
- `APP_SECRET`: random server-only secret of at least 32 bytes used to key anonymous rate-limit identifiers.
- `DB_SSL=true`: enable TLS when required by the selected database. Certificate verification remains enabled unless a provider requires another configuration.
- `DB_SSL_REJECT_UNAUTHORIZED=false`: only use when the database provider documents that requirement.
- `NEXT_PUBLIC_SITE_URL`: canonical public URL for the sitemap when a deployment host has been selected.

Never commit `.env.local` or database credentials.

## Content and operations

- `/admin` is protected by database-backed sessions. Sessions use HTTP-only, same-site cookies and expire after seven days. Admin APIs repeat authorization checks server-side.
- Content mutations validate fields and use parameterized PostgreSQL queries. Deletes require explicit confirmation. Passwords use Node.js `scrypt`; owner setup is a local CLI operation.
- Projects seeded from the brief are private drafts and visibly marked as samples. No role, date, outcome, or metric is fabricated. Set confidence levels for skills in the dashboard rather than inferring them.
- The contact form is accepted only after a `privacy_retention_days` value (1–365) is set in **Admin → Settings**. Contact submissions are rate-limited and stored in the admin inbox; no email is sent. Old messages are pruned when a submission arrives or an administrator opens the inbox.
- Blog authoring accepts plain text and a small safe Markdown subset. Arbitrary HTML is rendered as text, not markup. Draft posts are private.
- Project/blog media uploads, scheduled publishing, mobile client, analytics, and deployment are intentionally deferred. Résumé PDFs have a separate local persistent-disk workflow. No provider accounts or paid services are provisioned by this repository.

Before launch, choose the hosting and database services, verify their current terms and free quotas against the intended professional use, configure the canonical site URL, review message retention/privacy copy, and replace the draft project content with verified case-study details.


## Interactive experience and résumé versions

The public homepage uses a once-per-tab, sub-second Systems Atlas intro; CSS and IntersectionObserver reveals; an owner-data-backed technology marquee and category explorer; and a keyboard/touch project showcase. Abstract technical maps stand in for unavailable project screenshots. Reduced-motion preferences disable the continuous loops and entry motion. No animation package has been added.

The admin now includes `/admin/resume`. The additive `002_resume_and_portfolio_enhancements.sql` migration creates versioned résumé metadata and a single-active constraint, and adds an owner-controlled `currently_building` project flag. Run `npm run db:migrate` to apply both current and future unapplied migrations.

PDFs are validated (signature, MIME/extension, max 8 MB), stored with generated opaque names outside `public/`, and streamed via `/api/resume`; filesystem paths are never returned. `RESUME_STORAGE_DIR` can point at the storage directory; by default it is `./data/resumes`, which is git-ignored. On a server, use a persistent disk and back it up. The local-filesystem adapter is **not suitable for ephemeral/serverless deployments without persistent storage**. Admin upload/list/activate/delete require migration 002 and a configured database. When there is no active readable PDF, public controls direct visitors to Contact.

The owner may mark one project as “Currently building” in its admin form. It appears on the public home page only after it is published and is not marked sample. A unique partial index prevents multiple current projects.

Verification commands:

```powershell
npx next typegen
npx tsc --noEmit --incremental false
npm run lint
npm run build
```

A database-backed migration or upload was not exercised unless a working `DATABASE_URL` and persistent resume disk are configured.
