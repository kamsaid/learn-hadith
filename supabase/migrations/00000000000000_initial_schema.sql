-- Enable pgvector extension for AI embeddings
create extension if not exists vector;

-- Create tables
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade,
    username text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    points integer default 0,
    streak integer default 0,
    last_login timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (id),
    unique(username)
);

create table if not exists public.hadiths (
    id uuid default gen_random_uuid() primary key,
    book_name text not null,
    chapter_number integer not null,
    hadith_number integer not null,
    arabic_text text not null,
    english_text text not null,
    narrated_by text not null,
    grade text,
    topics text[] default '{}',
    references jsonb,
    embedding vector(1536),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(book_name, hadith_number)
);

create table if not exists public.progress (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade,
    hadith_id uuid references public.hadiths(id) on delete cascade,
    status text check (status in ('completed', 'in_progress', 'not_started')) default 'not_started',
    last_read timestamp with time zone default timezone('utc'::text, now()) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, hadith_id)
);

create table if not exists public.favorites (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade,
    hadith_id uuid references public.hadiths(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, hadith_id)
);

create table if not exists public.quizzes (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    description text,
    difficulty text check (difficulty in ('beginner', 'intermediate', 'advanced')) default 'beginner',
    time_limit integer, -- in minutes
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.quiz_questions (
    id uuid default gen_random_uuid() primary key,
    quiz_id uuid references public.quizzes(id) on delete cascade,
    hadith_id uuid references public.hadiths(id) on delete cascade,
    question text not null,
    options text[] not null,
    correct_answer text not null,
    explanation text,
    points integer default 10,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.quiz_results (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade,
    quiz_id uuid references public.quizzes(id) on delete cascade,
    score integer not null,
    time_spent integer not null, -- in seconds
    answers jsonb not null,
    completed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.achievements (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade,
    type text not null,
    name text not null,
    description text not null,
    earned_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.activities (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade,
    type text not null,
    details jsonb not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes
create index if not exists hadiths_book_name_idx on public.hadiths(book_name);
create index if not exists hadiths_topics_idx on public.hadiths using gin(topics);
create index if not exists hadiths_embedding_idx on public.hadiths using ivfflat (embedding vector_cosine_ops);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.hadiths enable row level security;
alter table public.progress enable row level security;
alter table public.favorites enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_results enable row level security;
alter table public.achievements enable row level security;
alter table public.activities enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone"
on public.profiles for select
to authenticated
using (true);

create policy "Users can update own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id);

create policy "Hadiths are viewable by everyone"
on public.hadiths for select
to authenticated
using (true);

create policy "Progress is viewable by user"
on public.progress for select
to authenticated
using (auth.uid() = user_id);

create policy "Progress is insertable by user"
on public.progress for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Progress is updatable by user"
on public.progress for update
to authenticated
using (auth.uid() = user_id);

-- Create functions
create or replace function public.match_hadiths (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  book_name text,
  hadith_number int,
  english_text text,
  similarity float
)
language sql stable
as $$
  select
    id,
    book_name,
    hadith_number,
    english_text,
    1 - (embedding <=> query_embedding) as similarity
  from hadiths
  where 1 - (embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
$$;

-- Create triggers
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

create trigger handle_updated_at
  before update
  on public.profiles
  for each row
  execute function public.handle_updated_at(); 