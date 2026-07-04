# Markdrop — Implementation Plan / Build Order Document

This document describes the order in which Markdrop was actually built, and the recommended order for anyone extending it or rebuilding a similar project from scratch. It's written so a contributor (human or AI) can understand *why* things were sequenced this way, not just *what* exists.

## Phase 0 — Concept & Validation
- Start from an existing open-source engine (MarkItDown) rather than building document parsing from scratch.
- Decide the product wraps that engine in a GUI rather than trying to compete with it — the value-add is UX, not conversion logic.
- Sketch a milestone plan: V1 (GUI + core conversion) → V2 (auth, security, polish) → V3 (AI features, batch processing) — deliberately avoid building V3 ideas before V1 is solid.

## Phase 1 — Static Frontend Shell (no backend, no auth)
1. Build the Landing page first, as a static design exercise — establishes the visual identity (color tokens, typography, the document/Markdown tile-grid concept) before any functionality exists.
2. Build the Auth page UI (sign in/sign up toggle, OAuth button placeholders, form fields) — UI only, no real logic yet.
3. Build the Upload/Convert page UI with **simulated** conversion (a fake progress bar and placeholder Markdown output) — this validates the interaction design (drag-drop, file list, preview pane) before wiring up anything real.

**Why this order**: getting the look and feel right first, with fake data, is faster to iterate on than building real functionality and design simultaneously. It also means later backend work has a clear UI contract to build against.

## Phase 2 — Real Backend for Conversion (still no accounts)
1. Scaffold a Node/Express server with a single `/api/convert` endpoint.
2. Wire it to shell out to the `markitdown` CLI via `child_process.execFile`.
3. Connect the frontend's Upload page to this real endpoint, replacing the simulated conversion.
4. Add a `.gitignore` and `.env.example` pattern from the start, even before real secrets exist — establishes the security habit early rather than retrofitting it.

**Why before auth**: proves the core value proposition (does the conversion actually work end-to-end?) before investing in the more complex authentication system. If the conversion approach didn't work, better to find out early.

## Phase 3 — Authentication & Database
1. Choose Supabase specifically because it bundles Postgres + Auth + Storage + built-in OAuth support for multiple providers — avoids hand-rolling a Passport.js backend with separate strategies per provider, which would be significantly more work for a solo/free project.
2. Write the database schema (`files` table) and Row Level Security policies **before** wiring up any frontend auth calls — security rules should exist from the first row ever written, not bolted on after data exists.
3. Wire up the Supabase client in the frontend; connect the previously-placeholder OAuth buttons and email/password form to real `supabase.auth` calls.
4. Add a `RequireAuth` route guard so the `/app` route can't be reached without a session.
5. Update the Upload page's backend calls to include the user's access token, and update the backend to verify that token before performing any conversion or write.

**Why after core conversion works**: authentication adds real complexity (sessions, tokens, redirects) — layering it onto an already-working conversion flow is more tractable than debugging both systems simultaneously.

## Phase 4 — Security Hardening & UX Polish
1. Add real-time input validation (email format, password strength) — a deliberate security/UX improvement once the basic auth flow was proven to work.
2. Add OTP-based email confirmation for new signups (rather than trusting Supabase's default link-based flow, for tighter control and a friendlier in-app experience).
3. Add the OTP-based forgot-password flow, mirroring the signup OTP pattern.
4. Add the avatar/account menu, theme toggle, and micro-animations (hover states, transitions) — cosmetic and UX polish layered on top of a functionally complete app.
5. Fix real bugs surfaced by manual testing (e.g., a missing download button handler, an OTP length assumption that didn't match the actual Supabase project configuration) — this phase is where hands-on testing catches issues that code review alone wouldn't.

**Why this order**: validation and OTP security work depend on the auth system from Phase 3 already existing; cosmetic polish is deliberately last since it's the least likely to reveal structural problems, and iterating on visuals is cheap once the underlying logic is stable.

## Phase 5 — Deployment
1. Push to GitHub, with `.gitignore` verified (via `git status`) to confirm no secrets are staged, *before* the first commit — not after.
2. Deploy the backend first (Render), since the frontend's environment variables depend on knowing the backend's live URL.
3. Fix platform-specific bugs surfaced only by deployment (e.g., a Windows-specific `py -m markitdown` command needing to become `markitdown` on Render's Linux environment) — this is expected; local development environments rarely match production exactly.
4. Deploy the frontend (Vercel), pointing its `VITE_API_URL` at the now-live backend.
5. Update Supabase's **Site URL** and **Redirect URLs** to the live frontend domain — necessary for OAuth and OTP-related redirects to be trusted by Supabase.
6. Perform a full end-to-end test on the *live* deployment (not localhost) — signup, OTP, conversion, download — since local testing cannot catch cross-origin, environment-variable, or cold-start issues that only appear in the real deployed environment.

**Why deployment is last**: deploying earlier would have meant debugging platform differences (Linux vs. Windows, environment variables, CORS) at the same time as building core features — better to have a fully working local app first, then solve "how do I put this on the internet" as its own distinct problem.

## Phase 6 — Not Yet Done (Recommended Next Steps for Contributors)
1. **OAuth provider registration** — Google Cloud Console, GitHub OAuth App, Azure App Registration, and (optionally, requires a paid developer account) Apple Sign In — each needs manual setup in that provider's console, pointing at Supabase's callback URL.
2. **Custom email domain** — verify a real domain in the email provider (Resend) to lift the "can only email yourself" restriction of shared testing domains, enabling real multi-user signups.
3. **File history UI** — the database already supports it; no frontend view of past conversions exists yet.
4. **Batch/folder upload** — currently one file at a time.
5. **Automated testing** — no unit or end-to-end tests currently exist.
6. **Custom domain for hosting** — currently running on free `vercel.app` / `onrender.com` subdomains, which is fully functional but could be upgraded to a purchased domain for branding purposes.

## General Principle for Extending This Project

When adding a new feature, follow the same phase logic that built the original: get the UI/interaction right with fake data first if it's substantially new, wire up the real backend/data layer second, and only then layer on security refinements and visual polish — rather than trying to get all three perfect in one pass.
