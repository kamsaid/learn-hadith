-- Enable the pgvector extension for embeddings
create extension if not exists vector;

-- Create the hadiths table
create table if not exists public.hadiths (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  arabic_text text,
  book text not null,
  narrator text not null,
  chapter text,
  explanation text,
  topics text[],
  embedding vector(1536),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create the profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique,
  hadiths_read integer default 0,
  quizzes_completed integer default 0,
  current_streak integer default 0,
  points integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create the user_hadith_progress table
create table if not exists public.user_hadith_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  hadith_id uuid references public.hadiths(id) on delete cascade,
  has_read boolean default false,
  quiz_score integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, hadith_id)
);

-- Create the quizzes table
create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  hadith_id uuid references public.hadiths(id) on delete cascade,
  questions jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create the user_quiz_attempts table
create table if not exists public.user_quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  quiz_id uuid references public.quizzes(id) on delete cascade,
  score integer not null,
  answers jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, quiz_id)
);

-- Enable Row Level Security (RLS)
alter table public.hadiths enable row level security;
alter table public.profiles enable row level security;
alter table public.user_hadith_progress enable row level security;
alter table public.quizzes enable row level security;
alter table public.user_quiz_attempts enable row level security;

-- Create policies
create policy "Hadiths are viewable by everyone"
  on public.hadiths for select
  using (true);

create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can create their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can view their own progress"
  on public.user_hadith_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert their own progress"
  on public.user_hadith_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own progress"
  on public.user_hadith_progress for update
  using (auth.uid() = user_id);

-- Create function for similarity search
create or replace function search_hadiths(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  text text,
  book text,
  narrator text,
  chapter text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    hadiths.id,
    hadiths.text,
    hadiths.book,
    hadiths.narrator,
    hadiths.chapter,
    1 - (hadiths.embedding <=> query_embedding) as similarity
  from hadiths
  where 1 - (hadiths.embedding <=> query_embedding) > match_threshold
  order by hadiths.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Create policies for profiles
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can create their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Enable RLS
alter table public.profiles enable row level security;

-- Add policy for upsert
create policy "Users can upsert their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id); 