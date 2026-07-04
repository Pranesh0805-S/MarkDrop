# Markdrop — App Flow & User Journey Document

## 1. Page Map

```
/                 Landing page (public)
/auth             Sign in / Sign up (public)
/verify-otp       Email OTP confirmation (public, post-signup only)
/forgot-password  Password reset flow (public)
/app              Upload & conversion workspace (requires session)
```

## 2. Primary User Journey: New User, Email/Password Signup

1. User lands on `/` (Landing page). Reads hero, "what it is", "how it works", supported formats.
2. Clicks **"Convert a file"** or **"Sign in"** → routed to `/auth`.
3. Toggles to **Sign up** tab.
4. Types email → real-time validation bubble appears if the format is invalid.
5. Types password → live checklist appears (8+ characters, uppercase, number, special character), each rule turning green as satisfied.
6. Clicks **Create account**.
7. Supabase creates the account in an unconfirmed state and sends an OTP email.
8. User is routed to `/verify-otp?email=...`.
9. Checks inbox, receives a themed email with a numeric code.
10. Enters the code → on success, Supabase issues a session.
11. User is routed to `/app`.

**Failure branches:**
- Invalid/expired code → inline error shown, user can request a new code via "Resend code".
- Email already registered → Supabase returns an error, shown inline above the form.

## 3. Primary User Journey: Existing User, Sign In

1. User lands on `/auth` (directly, or via clicking "Sign in" from `/`).
2. Default tab is **Sign in**.
3. Enters email + password.
4. Clicks **Sign in** → on success, routed directly to `/app` (no OTP step — only new signups require OTP).

## 4. OAuth Journey (Google / GitHub / Microsoft / Apple)

1. From `/auth`, user clicks one of the four OAuth buttons.
2. Browser redirects to the provider's own login/consent screen.
3. On approval, the provider redirects back through Supabase's OAuth callback, which redirects into the app at `/app`.
4. No OTP step occurs — the provider already proved the email is real.
5. If this is the user's first time authenticating this way, their profile photo (if the provider supplies one) and name are pulled into `user_metadata` and used by the avatar component.

## 5. Forgot Password Journey

1. From `/auth` (Sign in tab), user clicks **"Forgot password?"** → routed to `/forgot-password`.
2. **Step 1 — Email**: enters their account email (validated live) → clicks "Send code" → Supabase emails an OTP.
3. **Step 2 — Code**: enters the code → verified against Supabase.
4. **Step 3 — New password**: enters a new password (same live strength checklist as signup) → submits.
5. On success, the user's session is deliberately signed out, and after a short confirmation message, they're redirected back to `/auth` to sign in fresh with the new password.

This "sign out and require fresh sign-in" step is a deliberate design choice — it confirms the new password actually works before the user leaves the reset flow, rather than trusting the recovery session silently.

## 6. Core Product Journey: Converting a File

1. Authenticated user is on `/app`.
2. Drags a file (or clicks "Select files") into the dropzone. Accepted types shown: `.docx .pdf .pptx .xlsx .html .csv`.
3. File appears in the left-hand file list with a live progress bar.
4. Behind the scenes: file is sent via `POST /api/convert` to the backend, along with the user's Supabase access token.
5. Backend runs MarkItDown, returns the Markdown text.
6. File list entry flips to "Converted" with a checkmark; the file becomes selectable.
7. Clicking a file in the list shows its converted Markdown in the right-hand preview pane.
8. User can **Copy** (to clipboard) or **Download .md** (saves the file locally via a generated Blob).
9. User can upload additional files — each is processed and listed independently; clicking between them swaps the preview.
10. User can remove a file from the list (does not delete anything already downloaded).

**Failure branch**: if conversion fails (bad file, backend error, expired session), the file's entry shows an error state with the failure reason in place of Markdown output, rather than failing silently.

## 7. Session & Navigation Behavior

- The Landing page's navbar shows a **"Sign in"** button when logged out, and swaps to the user's **avatar** (OAuth profile photo, or initials from name/email) once a session exists.
- The `/app` page requires an active session; visiting it directly without one redirects to `/auth`.
- The avatar menu (available on both the Landing navbar and the `/app` navbar) offers **Sign out**, which clears the session and returns the user to `/`.
- Theme (dark/light) is a global toggle available in both navbars, persisted in the browser regardless of login state.

## 8. Cross-Cutting UI States Worth Noting for Contributors

- **Loading states**: buttons show a spinner and disable themselves during async auth/convert operations rather than allowing double-submission.
- **Error display**: auth errors render in a styled inline banner above the form, not as browser alerts or silent console logs.
- **Empty states**: the file list and preview pane both show explicit "nothing here yet" messaging rather than blank space, so the UI never looks broken before the user's first action.
