# Markdrop

React + Vite frontend, Node/Express backend, Supabase for auth + database + storage.

```
markdrop/
  Frontend/     <- React app
  Backend/
    server/     <- Node/Express API that runs MarkItDown
```

## Step 0 - Supabase project setup

1. Create a free project at supabase.com.
2. SQL Editor -> paste `Backend/server/schema.sql` -> Run.
3. Settings -> API -> copy Project URL, `anon` key, `service_role` key into your two `.env` files.

## Step 1 - Email delivery (required for OTP signup + password reset)

Supabase's built-in mailer only lets you edit templates once custom SMTP is enabled. Recommended:
free SMTP via Resend (resend.com), plugged into Authentication -> Emails -> SMTP Settings.

Then edit both templates under Authentication -> Emails:
- **Confirm sign up**: replace `{{ .ConfirmationURL }}` with `{{ .Token }}`, shown as plain text
  (not inside a link) in the email body.
- **Reset password**: same swap.

Note: the actual code length depends on your Supabase project's OTP settings - it may be 6 or 8
digits. The frontend here accepts up to 8 digits, so either works without further changes.

Also turn ON: Authentication -> Sign In / Providers -> Email -> "Confirm email".

## Step 2 - Run the Frontend

```powershell
cd Frontend
copy .env.example .env
```
Fill in `.env` with your Supabase URL, anon key, and `VITE_API_URL=http://localhost:8787`.
```powershell
npm install
npm run dev
```

## Step 3 - Run the Backend

```powershell
cd Backend/server
copy .env.example .env
```
Fill in `.env` with your Supabase URL and service_role key.
```powershell
npm install
py -m pip install "markitdown[all]"
npm run dev
```

## Features in this version

1. **Authorization** - Row Level Security in `schema.sql` means one user's files are never visible
   to another, regardless of login method (Google/GitHub/Microsoft/Apple/email).
2. **Sign in vs sign up** - sign in goes straight to `/app`; email/password sign up goes through
   `/verify-otp` first; OAuth skips that step since the provider already verified the email.
   Once logged in, the "Sign in" button becomes an avatar (`UserMenu.jsx`) - real photo if the
   provider gave one, initials otherwise.
3. **Live validation** - email format and a 4-rule password checklist update in real time as you type
   (`utils/validation.js`, `components/FieldHint.jsx`).
4. **Signup OTP** (`/verify-otp`) - emailed code required before a new account can log in.
5. **Forgot password OTP** (`/forgot-password`) - email -> code -> new password -> back to sign in.

## Security notes

- Service role key only ever lives in `Backend/server/.env` - never in the frontend.
- Backend caps uploads at 25MB (multer config in `server/index.js`).
- `cors()` in `server/index.js` currently allows all origins - restrict this to your real frontend
  domain before deploying.
