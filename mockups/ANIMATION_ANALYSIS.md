# Reference site analysis — motion, text effects, scroll effects

**Purpose:** evidence-based breakdown of three reference sites, ranked for fit with **Systems Atlas**, and the list of effects adopted into the preview mockup.
**Method:** each site was opened in the harness browser and its HTML/CSS/JS bundles were fetched and inspected directly (not guessed from appearance).
**Date:** 18 October 2026

---

## 1. What each site actually uses

### 1.1 `lenis.dev` — the reference implementation

| | |
| --- | --- |
| Stack | Next.js + Turbopack, Tailwind v4 |
| Smooth scroll | **Lenis** (its own site) |
| Display type | Anton (condensed poster caps) + Roboto + Panchang |
| Media | **16 `<video>` elements** in a scrolling gallery |

**Techniques found in the CSS bundle:**

- **Scroll values driven through CSS custom properties.**
  `.opacity-[calc(var(--progress1)*2)]` — JavaScript writes `--progress1` once per frame; CSS does all the rendering. This is the single most important pattern here: no per-frame React re-render.
- **Registered custom property for animatable colour.**
  `@property --header-bg { syntax:"<color>"; inherits:true; initial-value:#0000 }` — lets a colour interpolate smoothly as the page scrolls.
- **View Transitions API.** `::view-transition-group(.card-move)`, `::view-transition-new(.card-enter)`, `@keyframes card-fade`, and a named group `::view-transition-group(showcase-filters)` — used for filtering/card swaps.
- **`mix-blend-mode: difference`** — inverting elements over arbitrary backgrounds.
- **`mask-image: linear-gradient(to top, transparent, #000)`** — fading media edges into the page.
- **`@keyframes scroll-hint { 50% { transform: scaleY(1.5) } }`** — the scroll cue.
- Shared easing token **`--ease-out-expo`**.
- 4 sticky elements.

**Feel:** editorial poster — giant condensed type, black + pink, ultra-smooth, restrained.

### 1.2 `jafferidesigns.com`

| | |
| --- | --- |
| Stack | Next.js + Tailwind v4 |
| Smooth scroll | **Lenis** |
| Display type | Bebas Neue + Geist |
| Hero | **WebGL canvas** (`data-atelier-webgl`), 1 `<canvas>` |

**Techniques found:**

- **CSS marquee, done properly:**
  `@keyframes marquee { to { transform: translate(-50%) } }` and `marquee-reverse`, applied as
  `.marquee-track { animation: marquee var(--duration,35s) linear infinite }`, with
  `:hover { animation-play-state: paused }` and a `prefers-reduced-motion` guard.
- **Gradient text:**
  `.blue-text { -webkit-text-fill-color: transparent; background: linear-gradient(135deg,#168fe8,#1e5aa8,#0b1a2e); background-clip: text }`
- **`mask-image` vertical fade** (top/bottom) so cards dissolve at the edges.
- `will-change: transform` used deliberately on buttons.
- Hero is an **image slider with dot indicators**, not a diagram.

**Feel:** agency landing page — condensed caps, blue on dark, photography-led.

### 1.3 `devinton-solutions.vercel.app`

| | |
| --- | --- |
| Stack | Next.js + Tailwind, Inter |
| Smooth scroll | **Lenis** |
| Animation | **GSAP + ScrollTrigger** |
| Text | **SplitText-style word reveal** |

> **Useful lesson:** the HTML check showed no GSAP and only default Tailwind keyframes (`bounce`/`ping`/`pulse`) — it *looks* like plain Tailwind. Scanning the JS chunks found `gsap`, `ScrollTrigger`, `stagger` and SplitText-style `split(` in three separate chunks. **Never judge a site's motion from its CSS alone.**

**Techniques found in JS/HTML:**

- Classes **`reveal-text`** and **`manifesto-line`** — hooks for GSAP word/line reveals (styled by JS, not CSS).
- **`data-value`** — count-up stat counters (`5`, `100%`, `24/7`, `0`).
- `cursor` references — some cursor-follow logic.
- Gradient text on the "Why partner with DEVINTON" heading.

**Feel:** conventional dark SaaS/agency site, blue accent, stats-forward.

---

## 2. Technique catalogue + ranking for Systems Atlas

Ranking criteria: reinforces the "systems" narrative, stays restrained (the brand is calm/editorial), no cost to accessibility, works in a data-driven Next.js app with a single-owner admin.

| # | Technique | Seen on | Verdict | Rationale |
| --- | --- | --- | --- | --- |
| 1 | **Lenis smooth scroll** | all three | ★★★★★ adopt | The calm, controlled baseline. Already in the mockup. |
| 2 | **Scroll values via CSS custom properties** (`--progress`) | lenis | ★★★★★ adopt as core | The "motion harness" itself. One JS write per frame, CSS renders. Ideal for animating the Systems Atlas map paths. |
| 3 | **Word / line masked text reveal** | devinton, lenis | ★★★★★ adopt | Directly serves the editorial typography. No library needed: split into spans + `translateY` + stagger. |
| 4 | **Sticky stacking cards** | (common) | ★★★★☆ adopt | Elegant scroll effect with no scroll-jacking; fully accessible. Used for the project index. |
| 5 | **Gradient text sweep** | jafferi, devinton | ★★★★☆ adopt once | Subtle and technical. **One** line only (the hero accent), or it becomes noise. |
| 6 | **Text scramble / decode** | — | ★★★★☆ adopt | Reads as technical/terminal — a strong Systems Atlas fit. Keep it to mono kickers and indices. |
| 7 | **Marquee with pause + reduced-motion** | jafferi | ★★★★☆ keep | Already in the site; jafferi validates the exact pattern. |
| 8 | **Custom cursor** (dot + ring, blend, magnetic, label) | — | ★★★★☆ adopt | Requested. Desktop-only; must be disabled on touch and reduced-motion. |
| 9 | **View Transitions API** (`::view-transition-group`) | lenis | ★★★★☆ adopt later | Perfect for project filtering and route changes. Progressive enhancement with a normal-nav fallback. |
| 10 | **Count-up counters** | devinton | ★★★☆☆ adopt | familiar; fine for the stats row. |
| 11 | **`@property` colour transition** | lenis | ★★★☆☆ adopt | Nice header polish; cheap. |
| 12 | **`mix-blend-mode: difference`** | lenis | ★★★☆☆ limited | Great for the cursor; harmful to contrast if overused. |
| 13 | **Hero parallax** | common | ★★★☆☆ keep subtle | Shift + scale + fade only; verify no CLS. |
| 14 | **WebGL hero canvas** | jafferi | ★★☆☆☆ defer | Beautiful but heavy (Three.js) and at odds with "restrained". Revisit only if a real 3D system diagram is wanted. |
| 15 | **Scroll-jacked horizontal sections** | common | ★★☆☆☆ avoid | Hurts usability and accessibility; sticky stack gives the same wow without the hijack. |
| 16 | **Image-slider hero** | jafferi | ★★☆☆☆ avoid | Systems Atlas is diagram-led, not photo-led. |

**Recommendation for "both, ranked":** adopt **1–9**. That set is coherent (all calm/technical), adds no runtime dependency except Lenis, and every item degrades gracefully.

---

## 3. What was added to the preview mockup (v2)

`mockups/index.html`:

**Custom cursor**
- 6px accent dot that tracks the pointer 1:1, plus a 38px ring that lerps behind it (~0.16 easing).
- Ring uses `mix-blend-mode: difference`, so it inverts over any background.
- Grows to 92px and reveals a contextual label on interactive elements (`View`, `Download`, `Read`, `Index`…).
- **Magnetic:** on buttons the ring snaps to the element centre instead of the pointer.
- Enabled only for `(hover:hover) and (pointer:fine)`; disabled for touch and for `prefers-reduced-motion`.
- **Form fields keep the native text cursor** — `cursor:none` must never apply to inputs.

**Text effects**
- Masked line-by-line hero reveal (upgraded easing to `--ease-out-expo`).
- **Word-by-word stagger** on the statement band (28ms per word).
- **Scramble/decode** on mono kickers and the Writing heading.
- **Gradient sweep** on the hero accent line, using jafferi's `background-clip: text` technique with an animated `background-position`.

**Scroll effects**
- Scroll progress written to a CSS variable `--scroll`; the progress bar is rendered purely in CSS.
- **Sticky stacking project cards** (4 cards, `--i` offset) — the scroll effect replacing the bento grid.
- Existing marquee, parallax and count-ups retained.

---

## 4. Proposed "motion harness" architecture

One place owns all motion, so effects stay consistent and cheap:

1. **One client component** (`MotionDirector`) registers everything after mount.
2. **Lenis** drives scroll; it writes state into CSS custom properties only.
3. **CSS does all rendering** — no per-frame React state, no layout thrash.
4. **One `IntersectionObserver`** handles all reveals (adds `.in`, unobserves).
5. **One rAF loop** for the cursor; it stops when frozen/disabled.
6. **Guards live in one place:** `prefers-reduced-motion` and pointer capability.
7. **No animation library** except Lenis. Split-text and scramble are ~30 lines each.

This is what "make the harness better" means in practice: centralised registration, a single rAF loop, and a CSS-variable contract instead of scattered event listeners.

---

## 5. Open items

- Screenshots of v2 could not be captured because the harness desktop window was not visible; re-run the capture pass once it is in the foreground.
- The custom cursor has not yet been tested against real form controls in the app (contact form, admin editors).
- Lenis + `prefers-reduced-motion` interaction needs a real-device check before shipping.
