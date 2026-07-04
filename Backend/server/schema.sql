-- Run this in Supabase → SQL Editor

create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  original_name text not null,
  markdown_path text not null,       -- path inside the 'documents' storage bucket
  size_bytes bigint,
  status text default 'done',
  created_at timestamptz default now()
);

alter table public.files enable row level security;

-- Users can only see their own files
create policy "Users can view their own files"
  on public.files for select
  using (auth.uid() = user_id);

-- Users can only insert files under their own user_id
create policy "Users can insert their own files"
  on public.files for insert
  with check (auth.uid() = user_id);

-- Users can only delete their own files
create policy "Users can delete their own files"
  on public.files for delete
  using (auth.uid() = user_id);

-- Storage bucket setup (run once, or create via Dashboard → Storage → New bucket "documents", private)
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- Storage policy: users can only read their own folder (path starts with their user id)
create policy "Users can read their own documents"
  on storage.objects for select
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
