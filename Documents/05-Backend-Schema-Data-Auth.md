# Markdrop — Backend Schema, Data & Auth Document

## 1. Overview

All persistent data and identity lives in Supabase (Postgres + Auth + Storage). The Node/Express backend is stateless — it holds no database of its own, verifies incoming requests against Supabase, and writes conversion results back into Supabase on the user's behalf using a service-role key.

## 2. Authentication

Supabase Auth handles all identity. Supported sign-in methods:
- Email + password (with mandatory OTP email confirmation before first login)
- Google OAuth
- GitHub OAuth
- Microsoft OAuth (Supabase calls this provider `azure`)
- Apple OAuth (requires a paid Apple Developer account to configure — see setup notes below)

Every user, regardless of method, is represented by a single row in Supabase's built-in `auth.users` table and receives a stable `id` (UUID) — this is `auth.uid()` in Postgres/RLS policy context, and `user.id` in the frontend JS client. All authorization logic in this project keys off this single ID, so it behaves identically across every login method.

### OTP configuration (required manual setup, not code)
By default, Supabase's auth emails contain a clickable confirmation link, not a typed code. To get OTP behavior:
1. Enable **custom SMTP** in Supabase (Authentication → Emails → SMTP Settings) — required because Supabase locks template editing behind having SMTP configured. Any standard SMTP provider works (this project used Resend's free tier).
2. In **Authentication → Emails → Confirm sign up**, edit the template body to display `{{ .Token }}` as plain text instead of `{{ .ConfirmationURL }}` inside a link.
3. Repeat for the **Reset password** template.
4. Turn on **Authentication → Sign In/Providers → Email → "Confirm email"**.

The OTP code length is controlled by Supabase project settings and is not guaranteed to be exactly 6 digits (this project observed 8-digit codes) — frontend OTP inputs should accept a variable length rather than hardcoding one.

### Auth API calls used (frontend, via `@supabase/supabase-js`)
| Action | Call |
|---|---|
| Sign up | `supabase.auth.signUp({ email, password })` |
| Sign in | `supabase.auth.signInWithPassword({ email, password })` |
| OAuth sign-in | `supabase.auth.signInWithOAuth({ provider })` |
| Verify signup OTP | `supabase.auth.verifyOtp({ email, token, type: 'signup' })` |
| Request password reset code | `supabase.auth.resetPasswordForEmail(email)` |
| Verify recovery OTP | `supabase.auth.verifyOtp({ email, token, type: 'recovery' })` |
| Set new password | `supabase.auth.updateUser({ password })` |
| Sign out | `supabase.auth.signOut()` |
| Get current session | `supabase.auth.getSession()` |
| Listen for auth changes | `supabase.auth.onAuthStateChange(callback)` |

## 3. Database Schema

### `public.files`
```sql
create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  original_name text not null,
  markdown_path text not null,       -- path inside the 'documents' storage bucket
  size_bytes bigint,
  status text default 'done',
  created_at timestamptz default now()
);
```

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key, auto-generated |
| `user_id` | uuid | Foreign key to `auth.users.id`; cascade-deletes if the user is deleted |
| `original_name` | text | The uploaded file's original filename |
| `markdown_path` | text | Storage path to the converted `.md` file, not the content itself |
| `size_bytes` | bigint | Original file size |
| `status` | text | Currently always `'done'` on success; reserved for future states like `'processing'`, `'error'` |
| `created_at` | timestamptz | Defaults to now on insert |

**Note for contributors**: this table already supports building a "file history" UI (list of past conversions per user) — no such UI currently exists, only the write path (backend inserts a row per conversion).

### Row Level Security (RLS) Policies on `files`
```sql
alter table public.files enable row level security;

create policy "Users can view their own files"
  on public.files for select
  using (auth.uid() = user_id);

create policy "Users can insert their own files"
  on public.files for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own files"
  on public.files for delete
  using (auth.uid() = user_id);
```

No `update` policy currently exists (rows are effectively immutable after creation — reasonable default, but worth deciding on deliberately if edit functionality is ever added).

## 4. Storage

### Bucket: `documents` (private)
```sql
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;
```

**Path convention**: `{user_id}/{timestamp}-{filename}.md` — files are namespaced by user ID as the top-level folder, which is what the storage RLS policy checks against.

### Storage RLS Policy
```sql
create policy "Users can read their own documents"
  on storage.objects for select
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
```

This means even if someone obtained a direct storage URL for another user's file, Supabase would reject the read unless the requester's `auth.uid()` matches the folder name — authorization is enforced at the storage layer, not just hidden in the UI.

## 5. Backend's Relationship to This Schema

The Express backend (`Backend/server/index.js`) uses a **service-role Supabase client**, which bypasses RLS entirely — this is necessary because the backend acts on the user's behalf after independently verifying their identity via their access token, and needs to write into `files` and `documents` regardless of RLS (RLS is designed to restrict direct client access, not trusted server-side writes). The request flow:

1. Frontend sends the file with `Authorization: Bearer <user's access token>`.
2. Backend calls `supabaseAdmin.auth.getUser(token)` to confirm the token is valid and extract the real `user.id` — this step is what prevents a forged or arbitrary `user_id` from being written.
3. Backend runs the conversion, then writes to Storage and `files` using that verified `user.id`, never trusting any user-supplied ID from the request body.

**This is the one place in the system where the service role key's power is actually needed and used correctly** — everywhere else (the frontend), only the restricted `anon` key is used, and RLS does the enforcement.

## 6. Environment/Secrets Summary

| Secret | Lives in | Bypasses RLS? | Exposure risk if leaked |
|---|---|---|---|
| `anon` / publishable key | Frontend `.env`, safe to expose | No | Low — meant to be public, RLS still applies |
| `service_role` key | Backend `.env` only | Yes | High — full database access, must be rotated immediately if leaked |

## 7. Suggestions for Contributors Extending the Schema

- Add a `deleted_at` column instead of hard-deleting rows, if a "trash/undo" feature is wanted.
- Add an `updated_at` trigger if editing converted Markdown post-hoc is ever supported.
- Consider a `folders` or `projects` table with a foreign key on `files` if team/workspace grouping is added — current schema is flat, one row per file, no grouping concept.
- If a public sharing feature is added (e.g. shareable read-only links to a converted file), it should be a deliberate new policy, not a relaxation of the existing per-user policies — keep private-by-default files separate from any future public-sharing table/flag.
