# Markdrop — UI/UX Design Brief

## 1. Design Philosophy

Markdrop's visual identity is built around one idea: **the product's job is to turn documents into Markdown, so the interface itself should visually reference both halves of that transformation** — real document content on one side, raw Markdown syntax on the other. This shows up most clearly in the landing page hero, where a background grid of tiles alternates between "document" styling (warm paper tones, serif-adjacent type) and "Markdown output" styling (dark, monospace, syntax-highlighted), literally illustrating the conversion happening.

The overall tone is dark, technical, and quietly confident — closer to a developer tool (like a terminal or a code editor) than a consumer SaaS product, since much of the target audience is students, writers, and developers who value clarity over decoration.

## 2. Design Tokens

All colors are CSS custom properties defined once in `src/index.css`, and every component references them by variable name rather than hardcoded hex values. This is what makes the dark/light theme toggle possible with zero per-component logic — flipping `data-theme="light"` on `<html>` just swaps the variable values.

| Token | Dark mode | Light mode | Usage |
|---|---|---|---|
| `--ink` | near-black | warm off-white | Page background |
| `--ink-2` | slightly lighter dark | white | Card/panel backgrounds |
| `--ink-3` | lighter still | light grey-green | Input fields, secondary surfaces |
| `--paper` | warm off-white | dark ink | Primary text color |
| `--accent` | terminal green (`#7CFFB2`) | deeper green | Primary buttons, links, highlights |
| `--accent-dim` | muted green | light green | Borders, hover states |
| `--muted` | grey | grey | Secondary/label text |
| `--line` | low-opacity white | low-opacity dark | Borders, dividers |
| `--danger` | red | red | Error states |

**Typography**: two typefaces only —
- `Space Grotesk` for all UI text and headings (geometric, modern, slightly technical)
- `JetBrains Mono` for anything representing code, file syntax, or OTP codes (reinforces the "developer tool" feel and visually distinguishes literal document/code content from UI chrome)

## 3. Signature Visual Element: The Hero Tile Grid

Rather than generic photography or abstract shapes, the landing page hero background is a grid of small "before/after" cards:
- **Document tiles**: styled like a physical page (warm cream background, serif-leaning text), showing a snippet of realistic content (a resume paragraph, a spreadsheet row, meeting notes).
- **Markdown tiles**: dark background, green monospace text, showing the same content's Markdown syntax (`# Heading`, `**bold**`, table syntax, etc.)
- **Blank tiles**: empty dark cells used as spacing/rhythm between content tiles.

This grid subtly animates on hover (tiles lift slightly) and is intentionally not derived from any template — it was designed specifically to be *about* the product rather than decorative.

## 4. Motion & Animation Principles

Animation is used to add polish and responsiveness feedback, never for decoration alone:
- **Hover/press feedback** on every interactive element (buttons lift and glow slightly on hover, press down slightly on click) — reusable CSS classes (`.btn-lift`, `.cta-primary`, `.card-hover`, `.row-hover`, etc.) defined once in `index.css` and applied via `className`, not per-component inline styles.
- **Entrance animation** (`fade-up`, `fade-in`) on hero content and cards, staggered slightly so elements don't all appear at once.
- **Loading spinners** appear on any button triggering an async action (auth submit, file conversion) — never a silently frozen UI.
- **`prefers-reduced-motion` is respected** — all animations collapse to near-instant if the user's OS accessibility setting requests it. This is a genuine accessibility requirement, not optional polish.

## 5. Page-Level Design Notes

### Landing (`/`)
Sections in order: hero (tile grid + headline + CTA) → "what it is" (plain-language explainer) → "how it works" (3-step card row: Upload, Convert, Export) → "supported formats" (pill row) → footer (product/developer/company links).

### Auth (`/auth`, `/verify-otp`, `/forgot-password`)
All three share a consistent card-on-dark-background layout, centered, max-width ~420px. OAuth buttons are stacked above an email/password form, separated by a labeled divider ("or use email") rather than mixed together, so the two paths feel distinct. Validation feedback appears as small "bubble" hints anchored directly under the relevant field (via `FieldHint.jsx`) rather than in a single error summary at the top — this keeps feedback spatially tied to the field that caused it.

### Upload/Convert (`/app`)
Two-column workspace layout: left column is a fixed-width file management panel (dropzone + file list with per-file progress/status), right column is the Markdown preview, taking up remaining space. This mirrors familiar patterns from tools like VS Code or email clients (list + detail view) rather than inventing a new interaction pattern for something users already have muscle memory for.

## 6. Component Inventory (for contributors extending the UI)

| Component | File | Reused where |
|---|---|---|
| `Navbar` | `components/Navbar.jsx` | Landing page only |
| `Footer` | `components/Footer.jsx` | Landing page only |
| `UserMenu` (avatar + dropdown) | `components/UserMenu.jsx` | Landing navbar, Upload page navbar |
| `FieldHint` (validation bubble) | `components/FieldHint.jsx` | Auth, ForgotPassword |
| `RequireAuth` (route guard) | `components/RequireAuth.jsx` | Wraps `/app` route in `App.jsx` |
| `ThemeContext` / `useTheme` | `context/ThemeContext.jsx` | Any component needing the toggle |
| Validation helpers | `utils/validation.js` | Auth, ForgotPassword |

## 7. Accessibility Notes

- All theme colors maintain reasonable contrast in both dark and light modes (not formally audited against WCAG, but designed with contrast in mind — a genuine accessibility audit is a good candidate for a future contribution).
- `aria-label`s are present on icon-only buttons (theme toggle, account menu).
- Animations respect `prefers-reduced-motion`, as noted above.
- Form inputs use semantic `<label>` wrapping and appropriate `type` attributes (`email`, `password`) for browser/assistive-tech affordances like autofill and password managers.

## 8. Open Design Questions for Future Contributors

- No file history / past conversions UI exists yet, despite the database schema supporting it — a natural v2 UI addition.
- No mobile-specific layout testing has been done beyond basic responsive breakpoints on the landing page; the `/app` two-column layout in particular would benefit from a dedicated mobile treatment (e.g. tabbed view instead of side-by-side).
- No loading skeleton states exist for the file list/preview — currently relies on the per-row progress bar and a generic "Converting…" text state.
