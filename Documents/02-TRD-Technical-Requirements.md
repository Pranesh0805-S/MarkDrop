# Markdrop — Technical Requirements Document (TRD)

## 1. Architecture Overview

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────────┐
│   Frontend       │      │   Backend         │      │   Supabase           │
│   React + Vite   │─────▶│   Node/Express    │      │   Postgres + Auth    │
│   (Vercel)       │      │   (Render)        │      │   + Storage          │
│                  │◀─────│   runs MarkItDown │      │                      │
└────────┬─────────┘      └─────────┬─────────┘      └──────────┬───────────┘
         │                          │                            │
         │        auth (signup/signin/OAuth/OTP)                 │
         └──────────────────────────┴────────────────────────────┘
                    (frontend talks to Supabase directly for auth)
```

**Why this split:**
- Supabase handles everything that doesn't need custom server logic: accounts, sessions, OAuth, Postgres database, Row Level Security, and file storage.
- The one thing Supabase cannot do is run Python — so a small, separate Express server exists for exactly one job: receive an uploaded file, shell out to the `markitdown` CLI, return the Markdown text.
- The frontend calls Supabase directly for all auth operations (no backend involvement needed there) and calls the Express backend only for the `/api/convert` endpoint.

## 2. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend framework | React 18 + Vite | Client-side routing via `react-router-dom` |
| Frontend hosting | Vercel | Free tier, static build, auto-deploys from GitHub `main` branch |
| Backend framework | Node.js + Express | Minimal API surface — one real endpoint |
| Backend hosting | Render (free tier) | Persistent process required for Python subprocess support |
| Conversion engine | MarkItDown (Python, Microsoft OSS) | Installed via `pip install "markitdown[all]"` on the backend host |
| Auth | Supabase Auth | Email/password + OAuth (Google, GitHub, Microsoft/Azure, Apple) |
| Database | Supabase Postgres | Free tier; Row Level Security enforced on all user data |
| File storage | Supabase Storage | Private `documents` bucket, one folder per user ID |
| Email delivery | Resend (via Supabase custom SMTP) | Needed to send OTP codes; default Supabase mailer doesn't allow template edits |
| Icons | `lucide-react` | |
| Styling | Plain CSS with CSS custom properties (no Tailwind/CSS-in-JS framework) | All theme colors are variables in `src/index.css`, enabling the dark/light toggle |

## 3. Environment Variables

### Frontend (`Frontend/.env`)
```
VITE_SUPABASE_URL=            # Supabase project URL
VITE_SUPABASE_ANON_KEY=       # Supabase anon/public key (safe for browser)
VITE_API_URL=                 # Backend base URL (e.g. https://markdrop.onrender.com)
```

### Backend (`Backend/server/.env`)
```
SUPABASE_URL=                 # Same Supabase project URL
SUPABASE_SERVICE_ROLE_KEY=    # Server-only secret — bypasses RLS, never expose to frontend
PORT=8787
```

## 4. Backend API

### `POST /api/convert`
- **Auth**: requires `Authorization: Bearer <supabase-access-token>` header. Verified server-side via `supabaseAdmin.auth.getUser(token)`.
- **Body**: `multipart/form-data` with a single `file` field.
- **Limits**: 25MB max file size (via `multer` config — adjustable).
- **Process**:
  1. Save uploaded file to a temp path
  2. Run `markitdown <path>` as a subprocess, capture stdout as Markdown text
  3. Upload the resulting Markdown to Supabase Storage under `documents/{user_id}/{timestamp}-{filename}.md`
  4. Insert a row into the `files` table recording the conversion
  5. Return `{ markdown, file }` to the client
  6. Delete the temp file
- **Deployment note**: on Windows dev machines the command is `py -m markitdown <path>`; on Linux hosts (Render, Railway, etc.) it must be `markitdown <path>` directly. This is a one-line change in `server/index.js`.

## 5. Frontend Routes

| Route | Component | Auth required | Purpose |
|---|---|---|---|
| `/` | `Landing.jsx` | No | Marketing homepage: hero, what-it-is, how-it-works, formats, footer |
| `/auth` | `Auth.jsx` | No | Sign in / sign up, OAuth buttons, live field validation |
| `/verify-otp` | `VerifyOtp.jsx` | No (post-signup only) | Enter emailed OTP to confirm a new email/password account |
| `/forgot-password` | `ForgotPassword.jsx` | No | 3-step flow: email → OTP → new password |
| `/app` | `Upload.jsx` (wrapped in `RequireAuth`) | Yes | Upload, convert, preview, copy, download |

`RequireAuth.jsx` checks `supabase.auth.getSession()` on mount and subscribes to `onAuthStateChange`; redirects to `/auth` if no session exists.

## 6. Authentication Flow Logic

- **Sign in** (existing user, any method) → lands directly on `/app`.
- **Sign up via email/password** → account is created in an unconfirmed state → user is routed to `/verify-otp` → must enter the code emailed to them → only then does Supabase issue a session and the user reaches `/app`.
- **Sign up/sign in via OAuth** (Google/GitHub/Microsoft/Apple) → skips the OTP step entirely, since the provider has already verified the user's email → lands directly on `/app`.
- **Forgot password** → `/forgot-password` → email → OTP → new password → user is deliberately signed out and redirected to `/auth` to sign in fresh with the new password (rather than staying logged in from the reset session).

OTP codes are generated by Supabase and delivered via whatever length its project settings define (commonly 6 or 8 digits) — the frontend inputs accept up to 8 digits and do not hardcode a length.

## 7. Security Model

- **Row Level Security (RLS)** is enabled on the `files` table and the `documents` storage bucket, scoped to `auth.uid()`. This is provider-agnostic: a user who signed in via Google has the same `auth.uid()` as if they'd used email/password, so authorization logic never needs to know or care which method was used.
- **Service role key** exists only in the backend's environment variables, never in any frontend code or the git repository. It is the only credential capable of bypassing RLS, so it must be treated as a full-access database credential.
- **CORS**: `Backend/server/index.js` currently allows all origins for local development convenience. Before wider deployment, this should be restricted to the known frontend domain(s).
- **Secrets in git**: both `Frontend/` and `Backend/server/` have their own `.gitignore` excluding `.env` files; only `.env.example` placeholder files are committed.

## 8. Known Technical Limitations / Trade-offs

- Free-tier Render hosting spins the backend down after inactivity; first request after idle incurs a ~50 second cold start.
- Resend's shared `onboarding@resend.dev` sending domain can only deliver to the Resend account owner's own email address — real multi-user email delivery requires the deployer to verify their own domain.
- MarkItDown output quality depends entirely on the upstream library — no custom parsing/cleanup layer currently exists on top of it (see PRD's "AI formatting cleanup" future idea).
- No automated test suite currently exists (unit or end-to-end) — all testing so far has been manual, in-browser.
