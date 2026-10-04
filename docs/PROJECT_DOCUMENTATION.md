# Arshan Ashraf Portfolio — Project and UI Documentation

**Document scope:** describes the implementation in this repository as inspected on 4 October 2026. It documents what exists, how it is structured, how to operate it, and what still needs configuration. This is not a claim that deployment, database setup, or content verification has been completed.

## 1. Product overview

This project is a personal portfolio and private content-management platform for Arshan Ashraf (`Arshanashraf`). The public portfolio presents projects, profile information, skills, experience, achievements, writing, and contact options. A single-owner admin area edits this content. The application is a Next.js App Router monolith with TypeScript, React, PostgreSQL, and server-rendered public pages.

The portfolio’s positioning is: **“I build modern web applications across frontend, backend, and AI-enabled experiences.”** It intentionally avoids unverified seniority, project outcomes, performance numbers, and skill levels. Owner-supplied project candidates begin as private sample drafts in the database. They must be checked and rewritten with verified details before publication.

The design direction is called **Systems Atlas**: an editorial, technical portfolio that uses maps, labels, diagrams, indexes, and case-study structure to communicate how applications fit together. It is designed as a professional portfolio rather than a generic dashboard or template landing page.

## 2. Technology and runtime

- Next.js `16.3.8` App Router and route handlers
- React `19.2.8`
- TypeScript `5`
- PostgreSQL through `pg` connection pooling
- Node.js `scrypt` for admin password derivation
- CSS custom properties and Tailwind CSS v4 PostCSS integration; the current page styling is authored primarily in `src/app/globals.css`
- Geist and Geist Mono configured through `next/font/google`

Next’s installed documentation and this repository’s `AGENTS.md` should be consulted before changing framework APIs. This project uses the current Next version installed in `node_modules`, so older examples may not apply.

## 3. Information architecture and routes

### Public site

| Route | Purpose | Data |
| --- | --- | --- |
| `/` | Introductory hero, system diagram, positioning, selected projects, focus areas, and contact CTA | Public projects; public GitHub setting for the header |
| `/projects` | Full project index, sample notice, and an empty state if no published work exists | Published project records; local sample fallback only in development without a DB |
| `/projects/[slug]` | Project case-study shell with summary, notes, technologies, and sample safeguards | Published DB projects; development fallback samples when DB is absent |
| `/about` | Bio, focus areas, owner-entered skill confidence, experience timeline, achievements, logo exploration, profile links | Visible profile records and public settings |
| `/writing` | Published article list, with a private-draft explanation in the empty state | Published posts only |
| `/writing/[slug]` | Individual published article rendered with a safe Markdown subset | Published and scheduled-ready posts only |
| `/contact` | Contact form only when a retention policy has been configured; otherwise contact setup message; professional profile links remain available | `privacy_retention_days` and configurable profile links |
| `/resume` | Active résumé landing page, or a professional contact fallback when unavailable | Active resume metadata and private file presence |
| `/robots.txt` | Crawler policy that excludes admin and API paths | Static route metadata |
| `/sitemap.xml` | Canonical public pages plus non-sample projects and published articles, when the site URL is set | `NEXT_PUBLIC_SITE_URL`, published records |

### Admin site and APIs

| Route | Purpose |
| --- | --- |
| `/admin/login` | Owner sign-in; explains setup when the database is not configured |
| `/admin` | Protected overview with record counts and publishing reminders |
| `/admin/projects` | Create, edit, publish, archive, preview, and delete projects; edit technology list |
| `/admin/skills` | Maintain skills and manually selected confidence labels |
| `/admin/experience` | Maintain experience entries and visibility |
| `/admin/achievements` | Maintain milestones and evidence links |
| `/admin/blog-posts` | Manage article drafts and publication status |
| `/admin/messages` | Read, archive, or delete contact submissions |
| `/admin/settings` | Manage profile text, profile links, SEO defaults, theme preference, and contact retention |
| `/admin/resume` | Upload PDFs, inspect versions, activate, view, replace, and delete résumé records |
| `/api/admin/login`, `/api/admin/logout` | Create/revoke the owner session |
| `/api/admin/[resource]`, `/api/admin/[resource]/[id]` | Authenticated resource reads and writes; resource and field allowlists are server-side |
| `/api/admin/settings`, `/api/admin/settings/[key]` | Authenticated settings management |
| `/api/contact` | Validates and stores contact submissions; it does not send email |
| `/api/admin/resumes`, `/api/admin/resumes/[id]` | Authenticated resume upload, activation, list and confirmed deletion |
| `/api/admin/resumes/[id]/file`, `/api/resume` | Admin-only historic-file read and public active PDF stream |

The dashboard navigation links to the content areas and settings. The admin section has a distinct layout from the public header and footer.

## 4. Visual design system: Systems Atlas

### Composition and visual language

The public UI uses a quiet technical/editorial style: generous whitespace, precise borders, compact metadata, clear type hierarchy, understated cards, and teal emphasis. Repeated system labels and index numbers make the portfolio read like a map or field guide. The system diagram in the homepage hero is inline SVG and remains crisp at different sizes. It diagrams Interface, Application, Intelligence, Data, and Operations, with connecting paths and small annotations.

The header mark is a small connected-node sketch. On About, three rough logo directions (node path, layered system, connected modules) are explicitly identified as explorations; no final logo has been selected. These are in-page CSS shapes, not uploaded artwork.

### Color tokens

`src/app/globals.css` defines semantic custom properties on `:root` and overrides them for `data-theme="dark"`. The themes are intentionally designed as separate palettes rather than merely inverted colors.

| Token | Use |
| --- | --- |
| `--bg` | Main page background |
| `--surface` | Cards, panels, and header surfaces |
| `--surface-raised` | Raised or secondary surfaces |
| `--ink` | Primary text |
| `--muted`, `--soft` | Secondary and tertiary text |
| `--line` | Rules, borders, and diagram paths |
| `--accent`, `--accent-contrast` | Links, focus marks, primary action, diagram accents |
| `--warm` | Secondary warm accent and selected diagram node |
| `--focus` | Keyboard focus ring |
| `--success`, `--warning`, `--error` | Feedback and status colors |
| `--mono`, `--sans` | Technical metadata and interface typography |

The light palette uses a cool near-white background, dark blue-gray text, teal accents, and fine blue-gray rules. The dark palette uses a deep blue background, raised blue-gray surfaces, light text, and brighter teal accents. Theme behavior starts with a persisted visitor choice if one exists, otherwise the configured owner default, otherwise the system color preference. The visitor’s explicit light/dark toggle is saved in local storage.

### Typography

Geist and Geist Mono are loaded through `next/font/google` and assigned CSS variables by the root layout. Body text uses a clean sans-serif stack. Mono is used for small all-caps section labels, coordinates, indices, and technical annotations. Large display headings use tight tracking and responsive `clamp()` sizing. Body copy is kept readable with generous line height and constrained widths.

### Layout and responsive behavior

The shared `.shell` is capped at 1160px and uses a 64px total side inset on desktop, then reduces to 40px and 32px on narrower screens. The homepage hero is a two-column layout that becomes a stacked composition on mobile. The project showcase uses an abstract system illustration because project imagery has not been supplied; the project index remains an editorial row list. About and case-study content use editorial blocks and timelines.

Below 1000px, skill and admin grids reduce columns. Below 760px, the public hero and contact layout stack, and the admin sidebar becomes a horizontally scrollable navigation row. Below 480px, typography, project rows, cards, and admin forms tighten further. Media queries are in `src/app/globals.css` at 1000px, 760px, and 480px.

### Motion and interaction

Motion is deliberately restrained. The first visit per tab receives a short initialization layer. Shared IntersectionObserver reveals, CSS-driven carousel/ticker motion, hover/focus responses, and the project-map treatment support the editorial hierarchy without a motion library. The marquee pauses on hover; reduced-motion preferences remove continuous movement and reveal content immediately. Theme-color changes are transitioned. The stylesheet contains a global prefers-reduced-motion override.

The theme toggle switches between light and dark, saves an explicit selection in local storage, and falls back to the system preference when no visitor choice exists. The mobile menu updates `aria-expanded` and closes when a navigation link or Escape is used. Links and controls have visible keyboard focus treatment (`:focus-visible`).

## 5. Page and component details

### Homepage

The homepage is server rendered and dynamically queries current public content. Its hero pairs the owner’s headline and calls to action with an accessible Systems Atlas diagram. Visible database skills drive the moving technology lanes and category explorer; selected published projects drive the interactive carousel. Optional experience, achievements, the active project, and published writing appear only when verified records exist. Sample project entries are visibly identified. The final contact CTA and résumé action provide graceful states when content is missing.

### Project index and case study

Project rows include index, category, title, summary, technologies, and a link indicator. A sample notice is shown if the project list contains samples. A case study identifies sample content in its eyebrow and notice, lists known technologies, and states which facts remain unverified. It does not fabricate role, timeline, architecture, outcome, media, or links. Sample pages have `robots` metadata set to noindex.

### About

The About page provides editable bio and public role, focus areas, skills, experience timeline, achievements and evidence links, early logo studies, and external profile links. Skill confidence is an explicit owner choice among Core, Working knowledge, Currently learning, and Exploring. Empty states explain that verified records have not yet been supplied.

### Writing

The Writing index only displays published articles. A post’s title, excerpt, category, date, and slug appear in a card. Article bodies are processed by `MarkdownContent`, which supports a small safe Markdown subset; arbitrary HTML is not executed or rendered as markup. Draft posts remain private.

### Contact

The form asks for the visitor’s name, reply email, message, and privacy consent. It includes a hidden honeypot field. The form is hidden until the owner has set an integer retention duration from 1 to 365 days. The page displays that exact retention interval. Submissions are stored in the database inbox only; there is no email delivery integration.

### Shared components

- `SiteHeader`: brand mark, primary links, configurable GitHub URL, theme toggle, mobile navigation toggle
- `SiteFooter`: short positioning statement, GitHub and LinkedIn links, current-year copyright
- `AdminNavigation`: dashboard menu and sign-out action
- `ResourceManager`: shared resource editor/list for projects, skills, experience, achievements, blog posts, and inbox messages
- `SettingsManager`: profile/site setting editor
- `LoginForm`: owner sign-in form
- `ContactForm`: privacy-gated message form
- `MarkdownContent`: safe subset renderer for article text

## 6. Application structure

```text
src/
  app/
    (public)/                 Public route group and shared public layout
      page.tsx                Homepage
      about/page.tsx
      contact/page.tsx
      projects/page.tsx
      projects/[slug]/page.tsx
      writing/page.tsx
      writing/[slug]/page.tsx
    admin/
      login/page.tsx
      (dashboard)/             Authenticated dashboard shell and routes
    api/                       Route handlers for admin and contact
    globals.css                Global tokens, layouts, components, breakpoints
    layout.tsx                 Root fonts, metadata, theme bootstrap
    robots.ts
    sitemap.ts
  components/                   Reusable public/admin/client components
  data/                         Project fallback data and admin form schemas
  lib/                          DB, profile, projects, writing, auth, security

database/migrations/001_initial.sql
scripts/migrate.mjs
scripts/create-admin.mjs
scripts/update-admin.mjs
public/                         Current static starter assets
```

`src/lib` modules that access PostgreSQL or secrets are marked `server-only`. Public route-group layout owns the public header/footer, while the root layout owns metadata, fonts, CSS, and theme startup. The admin dashboard has its own server-side auth gate.

## 7. Data model

The initial migration creates these tables:

- `admin_users`: single owner email, password hash, activation state, timestamps. A unique expression index ensures only one owner row.
- `admin_sessions`: owner session token digest and expiry.
- `request_limits`: fixed-window rate-limit counters keyed by an HMAC of client identity.
- `projects`: project narrative fields, publication state, sample flag, feature/order fields, external links, SEO, and timestamps.
- `technologies`: normalized technology names and slugs.
- `project_technologies`: project/technology relationship with ordering and optional context.
- `project_media`: media URL, alt text, caption, order (schema support only; upload/editor workflow is deferred).
- `skills`: name, group, manually chosen confidence, description, visibility, order.
- `experiences`: organization, role, dates, description, visibility, order.
- `achievements`: title, date, description, evidence URL, visibility, order.
- `blog_posts`: title, slug, excerpt, Markdown body, image fields, category, status, SEO, publication timestamps.
- `messages`: sender details, message body, unread/read/archived status, received time.
- `portfolio_settings`: JSON value by setting key and update time.
- `schema_migrations`: applied migration versions.

The migration seeds six project candidates (AIMS, TrustRAG, ApexBot, Kafka CRUD, Personal Blog, E-commerce Application) with `status='draft'` and `is_sample=true`. It also seeds only the technologies named by the owner’s project brief. It does not publish the records.

## 8. Content lifecycle and admin workflow

1. Configure PostgreSQL and apply the initial migration.
2. Create the owner account using the local CLI. There is no public registration route.
3. Sign in at `/admin/login`.
4. Review seeded projects. Keep sample flag enabled until content is verified. Replace descriptions with actual project details and set status to Published only when ready.
5. Add skills and explicitly select each confidence value. Add experience and achievements only when details and evidence are available.
6. Write an article, preview it, and publish only after review. Public queries select published posts whose publication time is not in the future.
7. Set site profile/SEO/theme options in Settings. Configure message retention before enabling contact.
8. Review inbox entries. Mark them read or archive them; deletion requires confirmation.

The reusable editor displays a private preview for project and blog records. Saves write to PostgreSQL. Project technologies are entered as comma-separated names and synchronized into the normalized technology tables within a transaction. Publication and visibility status affect public output; drafts are queried only by admin APIs.

## 9. API behavior and validation

Admin resource handlers use a fixed resource map that binds URL slugs to known table names and allowed columns. User-supplied values are parameterized; only server-selected table/column identifiers are interpolated. Admin writes require same-origin checks and a valid owner session. JSON body sizes are limited, slugs are constrained to lowercase hyphenated values, URL fields require HTTPS, status/confidence/outcome types are enumerated, and numeric fields must be safe bounded integers. Deletes require `{ "confirm": true }`.

Settings keys are allowlisted. Retention is constrained to 1–365 days, theme to `light` or `dark`, and URL settings to HTTPS. Contact validates JSON size, field lengths, email shape, consent, honeypot, and retention availability before storing. Contact/login attempts use database rate limits. Rate-limit identities are HMAC keyed by `APP_SECRET` rather than storing raw IP/email identity in the bucket key.

## 10. Authentication, privacy, and security notes

- Passwords are salted and derived with Node.js `scrypt`; the local create/update scripts hide terminal password input and require 14+ characters.
- Admin sessions use random 32-byte opaque tokens. Only a SHA-256 digest is stored in PostgreSQL. Cookie is HTTP-only, SameSite strict, path `/`, seven-day lifetime, and secure in production. The default production cookie name uses the `__Host-` prefix.
- Login uses a dummy scrypt hash for unknown emails to reduce timing-based account enumeration.
- Admin pages and APIs check the session server-side. API mutations additionally check request origin.
- SQL value data is parameterized. Resource tables/fields are selected from allowlists.
- Contact messages are sensitive personal data. Retention must be deliberately chosen by the owner; old entries are pruned when a submission arrives and when the inbox is accessed. The page communicates the configured period.
- No contact email is sent. The owner must review the inbox in the dashboard.
- No secrets should be placed in `NEXT_PUBLIC_*` variables or committed to source control. `DATABASE_URL` and `APP_SECRET` must remain server-only.

This documentation records implementation choices, not a substitute for production security review or a privacy/legal review before launch.

## 11. Local setup

### Requirements

- Node.js 20.9 or newer
- npm
- PostgreSQL database for admin, profile records, blog, and contact inbox

### Install and configure

```powershell
npm ci
Copy-Item .env.example .env.local
```

Edit `.env.local`:

```dotenv
DATABASE_URL=postgresql://user:password@localhost:5432/arshan_portfolio
APP_SECRET=<at-least-32-random-bytes>
DB_SSL=false
NEXT_PUBLIC_SITE_URL=
```

Use a strong, random server secret, for example generate one with Node:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

When the chosen database requires TLS, set `DB_SSL=true`. Certificate verification remains enabled by default. Set `DB_SSL_REJECT_UNAUTHORIZED=false` only if the selected provider documents that need. A provider has not been selected by this repository.

### Initialize and run

```powershell
npm run db:migrate
npm run admin:create
npm run dev
```

Open `http://localhost:3000`. `npm run admin:create` and `npm run admin:update` require an interactive terminal for hidden password entry. The update command also revokes all sessions for that account.

### Without a database

The public site can be previewed locally without PostgreSQL. In development only, the project list falls back to clearly identified sample cards. Admin, profile records, article publishing, settings, and contact storage require a configured and migrated database. In production, the no-database project fallback is disabled.

## 12. Available commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Next development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve a production build |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit --incremental false` | Type-check without writing TypeScript incremental build info |
| `npm run db:migrate` | Apply the SQL migration transactionally using a PostgreSQL advisory lock |
| `npm run admin:create` | Create the sole admin owner interactively |
| `npm run admin:update` | Change the owner password and revoke existing sessions |

The documented implementation checks performed during this work were TypeScript, lint, diff whitespace, and local HTTP status checks. Database-backed end-to-end behavior was not verified because no database credentials were configured.

## 13. Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | For DB features | PostgreSQL connection string; server only |
| `APP_SECRET` | For rate-limited endpoints | At least 32 bytes, used to HMAC rate-limit keys |
| `DB_SSL` | Optional | `true` enables TLS |
| `DB_SSL_REJECT_UNAUTHORIZED` | Optional | Defaults to certificate verification; disable only for a documented provider case |
| `NEXT_PUBLIC_SITE_URL` | Recommended before launch | Canonical origin used as metadata base and sitemap origin |
| `SESSION_COOKIE_NAME` | Optional | Overrides default session cookie name; default is environment-sensitive |

## 14. SEO, accessibility, and browser behavior

The root metadata uses configured SEO title and description, with accurate defaults. Pages supply titles/descriptions where appropriate. Sitemap excludes sample project entries and uses the configured canonical origin; robots disallows admin/API paths. Project samples are marked noindex. Article metadata can override default title and description.

The diagram has an accessible SVG title and description. Navigation has labels; the mobile toggle exposes `aria-expanded`; focusable controls have a visible focus outline; forms use labels and status/alert regions; form inputs have bounded content. The design supports keyboard navigation and honors reduced-motion preferences. External profile links open a new tab with `rel="noreferrer"`.

## 15. Current boundaries and deferred work

The following are not implemented or not configured yet:

- No deployment target/provider has been selected; do not assume the site is deployed.
- No PostgreSQL service or credentials are supplied in the repository.
- No final, verified project case-study content, verified skill confidence, complete work history, achievements, resume file, or final logo is supplied.
- No contact inbox retention period is selected until the owner sets it; consequently, the contact form is unavailable by default.
- Contact messages do not trigger email or notifications.
- Project/blog media uploads are deferred. The project media schema exists, but no public media adapter or gallery editor is included. Résumé PDF upload has its own local private-storage workflow.
- No analytics, scheduled publishing, public registration, multi-user roles, search/filter UI, or mobile app.
- The admin editor uses a shared structured form and plain-text fields; it is not a rich-text/WYSIWYG editor.
- No dedicated privacy-policy route is currently present; review the privacy disclosures and any legal requirements before launch.

## 16. Launch and content checklist

- [ ] Choose hosting and PostgreSQL providers after checking current terms, quotas, and professional-use suitability.
- [ ] Configure production environment variables and verified TLS behavior.
- [ ] Apply migrations and create the owner account securely.
- [ ] Set a contact retention policy (1–365 days) and review the consent/privacy wording.
- [ ] Replace or keep unpublished every sample project until its facts are verified; confirm links and technology lists.
- [ ] Add only owner-verified skills, confidence levels, experience, and achievements.
- [ ] Review profile links, resume link, SEO title/description, and social presentation.
- [ ] Decide whether the temporary system mark is acceptable or provide an approved logo.
- [ ] Confirm published blog content and check metadata/canonical site URL.
- [ ] Test login/logout, publishing, contact storage, expiry/pruning, and responsive pages against the selected production database and host.
- [ ] Review privacy, backup, incident response, and data deletion procedures before collecting real contact messages.

## 17. Key source files

- Root layout, fonts, metadata, theme bootstrap: `src/app/layout.tsx`
- Design tokens, component styling, responsive rules and transitions: `src/app/globals.css`
- Homepage and SVG system diagram: `src/app/(public)/page.tsx`
- Shared public header/footer: `src/components/site-header.tsx`, `src/components/site-footer.tsx`
- Dashboard form definitions: `src/data/admin-resources.ts`
- Schema and sample project seeds: `database/migrations/001_initial.sql`
- Database pool: `src/lib/database.ts`
- Public project data mapping: `src/lib/projects.ts`
- Public profile/settings and privacy retention: `src/lib/profile.ts`
- Public writing queries: `src/lib/articles.ts`
- Session and password logic: `src/lib/auth.ts`, `src/lib/password.ts`
- Request origin and rate-limit logic: `src/lib/security.ts`
- Local setup: `README.md`

---

**Naming:** Public identity uses “Arshan Ashraf.” “Arshanashraf” is the handle for profile references. Use the full legal name only where formal/legal context requires it.

## 18. Interactive Systems Atlas and recent enhancements

The upgraded homepage composes the existing editorial atlas into an interactive but restrained sequence: responsive animated hero, live technology slider/category explorer, keyboard-and-swipe project showcase, admin-selected active project, optional verified experience and achievements, published writing, contact, and résumé actions. Sections that depend on verified database content are omitted or show a purposeful empty state. The abstract project system map is design artwork and is explicitly labeled as such; it is not represented as a project screenshot.

`src/components/intro-loader.tsx` presents a once-per-tab initialization layer for under one second. It does not run again during ordinary internal navigation and shortens to a simple transition for reduced-motion users. `src/components/reveal.tsx` is the shared IntersectionObserver reveal primitive. CSS keyframes handle diagram paths, small node pulses, hero entrance, carousel transitions, and ticker loops; no animation package was added. Continuous ticker movement pauses on hover/focus and becomes a static wrapped list under `prefers-reduced-motion`. Route transitions use browser View Transitions CSS where supported, with ordinary navigation as fallback.

`src/components/skill-atlas.tsx` receives visible skills from the existing `skills` table and preserves owner-set confidence labels and sort order. It does not define a second public skill list. `src/components/project-showcase.tsx` receives projects from the existing published-project query and adds previous/next controls, index dots, arrow-key support, and pointer swipe. It uses an abstract SVG system map instead of fabricating imagery. Real repository/demo links are surfaced when present in the project record.

### Résumé management and storage

Migration `002_resume_and_portfolio_enhancements.sql` adds an owner-controlled `projects.currently_building` field with a single-current-project index, plus `resumes` metadata with version, filename, upload/update time, storage key, and one-active-version constraint. It is additive; do not rewrite an already-applied migration.

`/admin/resume` supports PDF upload (8 MB maximum), replacement through a new version, activating/deactivating a version, viewing versions, and deleting a version with confirmation. Admin file metadata is fetched through an authenticated API. An uploaded PDF must have a `.pdf` name, accepted PDF media type, and `%PDF-` signature. It receives an opaque UUID filename and is saved outside `public/` by the server-only adapter in `src/lib/resume-storage.ts`. The public route `/api/resume` streams only the active file; historical versions are streamed only through an authenticated admin route. Public pages query the active version and verify the file exists before rendering download actions. `/resume` supplies a graceful unavailable state that links to Contact.

Storage defaults to `data/resumes/`, ignored by Git. `RESUME_STORAGE_DIR` can configure a different server path. This is local-filesystem storage, not object storage; it requires persistent disk and backup on a self-hosted deployment. Ephemeral/serverless hosting must not be used for résumé uploads until a persistent storage adapter has been configured. Do not publish or commit stored PDFs.

### Migration operation

`scripts/migrate.mjs` now enumerates sorted numbered SQL migrations, serializes runs with a PostgreSQL advisory lock, checks `schema_migrations`, and applies each unapplied version in its own transaction. The initial migration remains idempotent and seeds draft examples. Run `npm run db:migrate` after deploying this update. No migration can be claimed as applied from a workspace without a working database connection.

### Route feedback and dashboard

`src/app/loading.tsx`, `src/app/not-found.tsx`, and `src/app/error.tsx` add loading, 404, and retryable failure states. Authenticated dashboard routes are explicitly dynamic so build-time rendering never attempts an owner/database read. Dashboard overview cards query live counts and a recent-updated list from content tables, including résumé versions. Navigation marks the active public/admin route. The public header is sticky and responsive, with a compact accessible mobile menu.

### Current enhancement limits

- No project image upload/editor was introduced. Existing `project_media` schema support remains; showcase visuals use abstract diagrams until verified media and a deployment-appropriate public media storage adapter are available.
- Resume storage is local filesystem only. It is suitable for local development or a self-hosted persistent disk and is not deployment-ready on ephemeral/serverless hosts.
- No database credentials are present, so migration, resume upload/activation, and PostgreSQL-backed page behavior still need operational verification after configuring a database.
- No fabricated project, skill, timeline, result, or achievement data was added. “Currently building” is empty until the owner marks a verified, published, non-sample project.






