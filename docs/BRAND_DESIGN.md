# Arshan Ashraf — Brand & Design System ("Systems Atlas")

**Status:** Living document. This is the single source of truth for brand identity and UI design.
**Last updated:** 18 October 2026
**Implementation:** token values live in `src/app/globals.css`; fonts and theme bootstrap in `src/app/layout.tsx`.
**Related:** [`PROJECT_DOCUMENTATION.md`](./PROJECT_DOCUMENTATION.md) documents product/architecture/operations.

> **How to use this document.** Sections marked **[Current]** describe what ships today. Sections marked **[Target]** are agreed improvements not yet implemented. When code and this document disagree, this document wins — treat a mismatch as a bug to fix in one place or the other.

---

## 1. Brand foundation

### 1.1 Names

| Context | Value |
| --- | --- |
| Public identity | **Arshan Ashraf** |
| Handle / online reference | **Arshanashraf** |
| Site title template | `%s · Arshan Ashraf` |
| Default meta title | `Arshan Ashraf — Full-Stack Developer` |

Use the full name for the public identity. Use the handle for profile URLs and machine references. Do not invent a company name, personal brand nickname, or invented title.

### 1.2 Positioning

> **"I build modern web applications across frontend, backend, and AI-enabled experiences."**

The brand is a **professional portfolio as a systems field guide**. It should read as precise, technical, and honest — an engineer explaining how things connect.

### 1.3 Voice & tone

- **Precise, not promotional.** State what was built and the trade-offs; avoid superlatives.
- **First person, plain language.** "I build…", "The flow covers…".
- **Evidence over claims.** Anything unverified is labeled as a sample, not asserted.
- **Quiet confidence.** Understatement and whitespace signal seniority more than loud design.

**Do say:** "Selected systems", "Evidence over claims", "Currently building".
**Don't say:** "10x", "world-class", "cutting-edge", "revolutionary", or any fabricated metric, seniority, or outcome.

### 1.4 The "Systems Atlas" concept

Maps, coordinates, labels, index numbers, diagrams, and case-study structure make the portfolio read like an atlas or field guide. Five layers are the recurring vocabulary:

**Interface → Application → Intelligence → Data → Operations**

Every diagram, kicker, and section index should trace back to this structure.

---

## 2. Logo & mark

### 2.1 Current state **[Current]**

- The header mark (`src/components/site-header.tsx`) is a small inline SVG: a node path — two accent dots at the base, an ink apex, and a dashed baseline.
- The hero/brand period is an accent-colored `.` after "Arshan Ashraf".
- The About page shows **three deliberate logo explorations** (node path / layered system / connected modules) and states no final logo has been selected.

### 2.2 Target **[Target]**

The temporary mark must be resolved into **one approved logo** before launch. Requirements:

**Lockups to produce**
1. **Primary horizontal lockup** — mark + "Arshan Ashraf" wordmark.
2. **Mark only** — for the favicon/app icon and small sizes.
3. **Monochrome** — single-color ink version for restricted contexts.

**Rules**
- **Mark geometry** must be built on a consistent grid so it stays crisp from 16px (favicon) to 48px+.
- **Clear space** = the height of one node dot on all sides.
- **Minimum sizes:** mark 16px, horizontal lockup 120px wide.
- **Accent usage:** at most one accent element inside the mark; the rest is `--ink`. Do not use `--warm` inside the logo.
- **Backgrounds:** the mark must work on `--bg`, `--surface`, and `--surface-raised` in both themes.
- Deliver as SVG (mark + lockup), plus raster favicon/OG exports.

### 2.3 Wordmark

Set in the body sans (Geist), weight ~600, tight but not negative tracking. The trailing `.` is always `--accent`.

---

## 3. Color

### 3.1 Token set **[Current]**

Colours are semantic custom properties defined on `:root` and overridden on `:root[data-theme=dark]`. Themes are **separate palettes**, never a mechanical inversion.

| Token | Role |
| --- | --- |
| `--bg` | Page background |
| `--surface` | Cards, panels, header surfaces |
| `--surface-raised` | Raised/secondary surfaces, diagram nodes |
| `--ink` | Primary text |
| `--muted` | Secondary text |
| `--soft` | Tertiary/decorative text and micro-labels |
| `--line` | Rules, borders, diagram paths |
| `--accent` | Links, focus marks, primary action, diagram accents |
| `--accent-contrast` | Text/icon on top of `--accent` |
| `--warm` | Secondary accent, selected diagram node |
| `--focus` | Keyboard focus ring |
| `--success` / `--warning` / `--error` | Status feedback |
| `--shadow` | Elevation |
| `--ease` | Shared easing curve |
| `--mono` / `--sans` | Type stacks |

### 3.2 Values

**Light (default)**

```css
--bg:#f6f6f2; --surface:#fbfbf8; --surface-raised:#fff;
--ink:#1d2523; --muted:#64716d; --soft:#89938f;
--line:#dfe4df; --accent:#346b5b; --accent-contrast:#fff;
--warm:#c67b45; --focus:#1878c8;
--success:#2e7651; --warning:#a55e21; --error:#b3433d;
--shadow:0 16px 50px #20302812;
```

**Dark**

```css
--bg:#111715; --surface:#151d1a; --surface-raised:#1b2521;
--ink:#eef1ed; --muted:#abb6b0; --soft:#77847d;
--line:#2c3933; --accent:#82baa5; --accent-contrast:#102019;
--warm:#e0a16c; --focus:#83bfff;
--success:#78c494; --warning:#e6ac73; --error:#ff928a;
--shadow:0 18px 55px #0003;
```

### 3.3 Contrast audit (estimated WCAG ratios)

| Pair | Ratio | Verdict |
| --- | --- | --- |
| Light `--ink` on `--bg` | ~14:1 | ✅ AAA |
| Light `--muted` on `--bg` | ~4.7:1 | ✅ AA normal |
| Light **`--soft` on `--bg`** | **~2.9:1** | ❌ **Fails AA** (even for large text) |
| Light `--accent` on `--bg` | ~5.7:1 | ✅ AA normal |
| Light `--warm` on `--bg` | ~3.0:1 | ⚠️ Large text / graphics only |
| Dark `--ink` on `--bg` | ~15:1 | ✅ AAA |
| Dark `--soft` on `--bg` | ~4.7:1 | ✅ AA normal |
| Dark `--accent` on `--bg` | ~8.3:1 | ✅ AAA |

> **Required fix [Target].** Light-mode `--soft` fails AA and is currently used for 8–10px micro-labels. Either (a) darken light `--soft` to ≈`#66736f` to reach 4.5:1, or (b) restrict `--soft` to decorative/non-essential marks only and never use it for information a visitor must read. Prefer (a) plus a stricter rule that no functional text sits below 4.5:1.

### 3.4 Usage rules

- **Accent is scarce.** Use `--accent` for links, primary buttons, focus marks, one diagram element, and the brand period. Never fill large areas with it.
- **`--warm` is a garnish.** Reserve for a single selected/diagram node or a subtle highlight.
- **Status colors are semantic only.** Never use `--success`, `--warning`, or `--error` decoratively.
- **New colors must be added as tokens**, used in both themes, and contrast-checked before merge.

---

## 4. Typography

### 4.1 Families **[Current]**

- **Sans:** Geist (`--sans`) via `next/font/google`. Body and headings.
- **Mono:** Geist Mono (`--mono`). Micro-labels, indices, coordinates, technical annotations.

Fallbacks: `Arial, sans-serif` (sans) and `monospace` (mono).

### 4.2 Type scale (observed) **[Current]**

| Role | Size | Notes |
| --- | --- | --- |
| Hero display | `clamp(48px, 6.3vw, 78px)` | lh ~.96, tracking `-.075em` |
| Page intro H1 | `clamp(44px, 7vw, 82px)` | lh .99, tracking `-.065em` |
| Section H2 | `clamp(30px, 4.4vw, 54px)` | weight 450, lh 1.06 |
| Band statement | `clamp(20px, 2.6vw, 32px)` | lh 1.4 |
| Project/Article H3 | `clamp(21px, 4vw, 48px)` | depends on context |
| Body | `16px / 1.65` | default |
| Small body | `12–13px` | card copy, meta |
| Mono label | `8–10px` | uppercase, `letter-spacing .1em` |

### 4.3 Rules

- **Mono labels are metadata, never prose.** Keep them short and uppercase.
- **Display tracking:** heavy negative tracking only at large sizes. Verify at mobile widths (by 480px, `-.075em` can make words collide).
- **Line length:** body copy constrained to ~640px (`max-width`).
- **Weights:** headings use 450–500, not 700. Keep the editorial feel.
- **[Target] Raise the micro-type floor.** No functional text below **12px**; micro-labels may be 10–11px only when non-essential. This is both a readability and accessibility fix.
- **[Target] Add a documented modular scale** (`--text-xs … --text-3xl`) so new UI reuses sizes instead of inventing `clamp()` values.

---

## 5. Spacing, layout & rhythm

### 5.1 Container **[Current]**

- `.shell`: `width: min(1160px, 100% - 64px)`, centred.
- Insets: **64px** desktop → **40px** ≤760px → **32px** ≤480px.

### 5.2 Vertical rhythm **[Current]**

- Page main: `padding-block: 72px 120px`.
- Sections: `padding-block: 78px`, separated by a `1px solid var(--line)` top border, reducing to 58px on mobile.
- Intro band min-height 180px.

### 5.3 Breakpoints **[Current]**

| Width | Behaviour |
| --- | --- |
| `≤1000px` | Grids drop a column; project tech column hides |
| `≤760px` | Nav collapses to menu; hero/contact stack; admin sidebar becomes a scroll row |
| `≤480px` | Type and padding tighten further; card grids go single/2-col |

### 5.4 Rules

- **[Target] Tokenize spacing.** Replace hardcoded px with a `--space-*` scale (e.g. 4/8/12/16/24/32/48/64/80). Current hardcoded values make rhythm inconsistent and hard to tune.
- **Alternate rhythm.** Not every section should be a bordered box. Use at least three section treatments: **bordered block**, **full-bleed tinted band** (`.intro-band`, `.currently-building`, `.contact-strip`), and **open whitespace block**.
- Keep one idea per section; one primary action per section.

---

## 6. Surfaces, borders & elevation

- **Radius:** near-square. Buttons/cards use `3px`. Only the theme toggle and node dots are fully round. **[Target]** define `--radius-sm/md/pill` tokens (e.g. 3px / 5px / 999px).
- **Borders:** 1px `var(--line)` is the primary structuring device. Use it consistently for cards, rules, inputs, and grid cells.
- **Elevation:** `--shadow` is reserved for floating surfaces (sticky header when scrolled, diagram nodes, mobile menu). Flat cards use borders, not shadows.
- **[Target]** Introduce a light `--surface-2`/tint so nested surfaces can be distinguished without adding borders everywhere.

---

## 7. Components

### 7.1 Header (`site-header.tsx`)
Sticky, transparent at top, gains `--line` border + blurred `--bg` when scrolled (min-height 82px → 68px). Brand mark + wordmark; nav (Projects, About, Writing, Contact); GitHub link; optional résumé; theme toggle; mobile menu toggle with `aria-expanded`.

### 7.2 Footer (`site-footer.tsx`)
Brand period, one-line positioning statement, GitHub + LinkedIn links, current-year copyright. Reveals on scroll.

### 7.3 Buttons (`.button`)
- Base: min-height 48px, `3px` radius, mono 11px label, 1px `--line`.
- `--primary`: `--accent` fill, `--accent-contrast` text.
- `--quiet`: `--surface` fill.
- Hover: `translateY(-2px)` + accent border. **Always** pair with a `:focus-visible` ring.

### 7.4 Links (`.text-link`, `.back-link`, `.evidence-link`)
Accent, mono 11px, with a trailing indicator (`↗` external, `↓` download, `←` back). Arrow nudges 3px on hover.

### 7.5 Cards & grids
- `overview-card`, `ecosystem-skill`, `achievement-card` share the bordered-surface treatment with 2px lift on hover.
- Editorial lists (project rows, article cards) are border-separated rows, not boxed cards.

### 7.6 Forms (contact, admin)
Labels above inputs; inputs fill `--surface` with 1px `--line`; textareas min-height 145px. Status regions use `--success`/`--error`.
**[Target]** Add inline field-level errors with `aria-invalid` + `aria-describedby`, and a visible success/error state per field.

### 7.7 Feedback & states
- `sample-notice` — warm-bordered band labeling unverified content.
- `empty-state` — dashed border, explains what will appear and why it's absent.
- `editorial-note` — muted guidance text.
- Admin-only skeleton shimmer (`@keyframes skeleton`). **[Target]** add loading states for public routes.

### 7.8 Diagrams
Two generations exist and should be unified:
- Legacy `.diagram-frame` / `.diagram-node` (CSS-positioned nodes).
- Current `.hero-visual` / `.system-map` (inline SVG with `.map-node`, `.map-path`, `.map-annotation`).
**[Target]** standardize on the inline-SVG map system and delete the legacy one.

---

## 8. Iconography & diagram language

- **No icon library [Current].** Icons are inline SVG or text glyphs: `↗ ↓ ← →` `!` `⟡` `⌁` `.`
- **[Target]** define a small fixed glyph set and reuse it consistently:
  - `↗` external link · `↓` download · `←` back · `·` separator · `.` brand accent
- Diagram annotations (`FIG. 01`, `SYS / 02`, `001—026`) are editorial flavour. **[Target]** only use them with real meaning — remove arbitrary numbers that confuse visitors.
- **Node states:** default, accent (`map-node--accent`), muted (`map-node--muted`), hover/focus (accent border, 2px lift).
- **[Target] Accessibility:** map nodes are currently `tabIndex={0}` but not interactive. Either make them real controls or remove `tabIndex` — focusable non-actionable elements are an anti-pattern.

---

## 9. Motion & interaction

### 9.1 Principles
Motion is **restrained and functional**. It supports hierarchy; it never delays content or demands attention.

- Shared easing: `--ease: cubic-bezier(.2,.7,.2,1)`.
- Micro-interactions: 0.2–0.3s (hover, theme toggle, links).
- Reveals: 0.65–0.9s (IntersectionObserver via `.motion-ready` / `.motion-visible`).
- Hero: scroll-reactive shift/scale/fade driven by `MotionDirector` (`--hero-progress`).
- Continuous loops: technology marquee (36s / 43s, pauses on hover/focus), diagram orbit (24s).

### 9.2 Loader
`IntroLoader` shows a full-screen "Initializing…" overlay **once per tab**, auto-hidden after ~820ms (80ms under reduced motion).
**[Target]** Reconsider: a portfolio should not gate content behind an intro. Either remove it or make it non-blocking and ≤300ms. It must never block LCP or interaction.

### 9.3 Required guarantees
- `prefers-reduced-motion: reduce` disables all continuous loops and entry motion, and reveals content immediately. **This is already implemented — preserve it.**
- No animation library. Motion stays CSS + one small `MotionDirector`.
- Focus is always visible during and after motion.

---

## 10. Accessibility standards

Non-negotiable, per the project's existing commitments:

1. **Body/UI text ≥ 4.5:1**; large text ≥ 3:1. (Fix light `--soft` — see §3.3.)
2. **Micro-type floor:** no essential text below 12px (§4.3).
3. **Keyboard:** every interactive element reachable, with a visible `:focus-visible` ring (`--focus`, 2px, 4px offset).
4. **Semantics:** landmark elements, `<nav>` labels, `aria-current="page"` on active nav.
5. **Forms:** visible labels, `aria-describedby` for errors/help, status regions with `role`/`aria-live`.
6. **Motion:** honor `prefers-reduced-motion` everywhere.
7. **Skip link** to main content at the top of every public page.
8. **External links** use `target="_blank"` + `rel="noreferrer"`.
9. **Contrast must be re-verified** for any new token or one-off colour.

---

## 11. Imagery & media

### 11.1 Current state
- **No project imagery is supplied.** `project_media` exists in the schema but has no editor/workflow.
- Visuals are abstract SVG system maps, explicitly labeled *"SYSTEM STUDY · NO PROJECT SCREENSHOTS SUPPLIED"*.
- `public/` still contains unused Create-Next-App starter art (`next.svg`, `vercel.svg`, `globe.svg`, `window.svg`, `file.svg`).

### 11.2 Rules **[Target]**
- **Never fabricate a screenshot.** Abstract diagrams stay until real media exists.
- When media arrives: prefer screenshots with 1px `--line` framing (no rounded mockups, no drop shadows), always with meaningful `alt` text.
- Establish a consistent aspect ratio (e.g. 16:10) for project media.
- Delete unused starter assets; add real brand assets (`app/icon.svg`, apple icon, OG image).

---

## 12. Content & editorial rules

- **Section kickers** are numbered in order: `01 / SYSTEM`, `02 / STACK`, `03 / WORK`, … Keep the sequence consistent within a page.
- **Indexing:** project rows, article cards, and milestones use zero-padded indices (`01`, `02`).
- **Honesty label:** any unverified record carries `is_sample` and is visibly marked (`.sample-notice`, `SAMPLE CONTENT`, `editorial-note`). Sample pages are `noindex`.
- **Empty states are purposeful.** Explain what will appear and why it's missing; never show fake data.
- **Resume, contact, and images degrade gracefully** to a contact link when content is absent.

---

## 13. Asset & gap checklist

| Asset / gap | Status |
| --- | --- |
| Final logo (mark + lockup + mono) | ❌ not selected |
| Favicon / `app/icon.svg` | ❌ missing |
| Apple touch icon | ❌ missing |
| Open Graph / social image + `openGraph` metadata | ❌ missing |
| Remove unused `public/*.svg` starter art | ❌ pending |
| Light-mode `--soft` contrast fix | ❌ pending |
| Micro-type floor (≥12px) | ❌ pending |
| Spacing / radius / type-scale tokens | ❌ pending |
| Prune dead legacy CSS (`diagram-*`, `.project-row`, `.final-cta`, `.contact-layout`, `.intro-block`) | ❌ pending |
| Decide Tailwind's role (adopt utilities or drop it) | ❌ pending |
| Project media workflow | ❌ deferred |
| Public route loading states | ❌ pending |

---

## 14. Governance

- **Tokens are the contract.** New colours, sizes, and spacings are added as tokens in `globals.css`, used in both themes, and checked for contrast before merge.
- **No new one-off px values** when a token exists. **[Target]** this becomes enforceable once the spacing/type scales land.
- **This document is authoritative.** If implementation drifts, fix the code or amend this document — never silently diverge.
- **Scope note:** brand/design guidance lives here; product/architecture/security/operations live in `PROJECT_DOCUMENTATION.md`.
