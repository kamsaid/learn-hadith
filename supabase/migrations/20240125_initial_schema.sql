-- Enable the pgvector extension for similarity search
create extension if not exists vector;

-- Create tables
create table public.hadiths (
    id uuid primary key default gen_random_uuid(),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    book_name text not null,
    hadith_number text not null,
    chapter text,
    narrated_by text not null,
    arabic_text text not null,
    english_text text not null,
    grade text,
    topics text[],
    embedding vector(384),  -- DeepSeek embeddings are 384-dimensional
    references jsonb,
    unique(book_name, hadith_number)
);

create table public.profiles (
    id uuid primary key references auth.users on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    username text unique not null,
    full_name text,
    avatar_url text,
    website text,
    saved_hadiths uuid[] default array[]::uuid[],
    quiz_stats jsonb default '{"total_quizzes": 0, "correct_answers": 0, "streak": 0, "last_quiz_date": null}'::jsonb
);

create table public.progress (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    hadith_id uuid references public.hadiths(id) on delete cascade not null,
    status text check (status in ('completed', 'in_progress', 'not_started')) default 'not_started',
    last_read timestamp with time zone default timezone('utc'::text, now()) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, hadith_id)
);

create table public.quiz_results (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    quiz_id uuid not null,
    score integer not null check (score >= 0),
    time_spent integer not null check (time_spent >= 0),
    completed_at timestamp with time zone default timezone('utc'::text, now()) not null,
    answers jsonb not null
);

create table public.achievements (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    type text not null,
    name text not null,
    description text not null,
    earned_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.activities (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    type text not null,
    details jsonb not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes
create index hadiths_book_name_idx on public.hadiths(book_name);
create index hadiths_embedding_idx on public.hadiths using ivfflat (embedding vector_cosine_ops);
create index profiles_username_idx on public.profiles(username);
create index progress_user_id_idx on public.progress(user_id);
create index progress_hadith_id_idx on public.progress(hadith_id);
create index quiz_results_user_id_idx on public.quiz_results(user_id);
create index achievements_user_id_idx on public.achievements(user_id);
create index activities_user_id_idx on public.activities(user_id);

-- Create RLS policies
alter table public.hadiths enable row level security;
alter table public.profiles enable row level security;
alter table public.progress enable row level security;
alter table public.quiz_results enable row level security;
alter table public.achievements enable row level security;
alter table public.activities enable row level security;

-- Hadiths policies (public read, admin write)
create policy "Hadiths are viewable by everyone"
    on public.hadiths for select
    to authenticated, anon
    using (true);

-- Profiles policies
create policy "Users can view their own profile"
    on public.profiles for select
    to authenticated
    using (auth.uid() = id);

create policy "Users can update their own profile"
    on public.profiles for update
    to authenticated
    using (auth.uid() = id)
    with check (auth.uid() = id);

-- Progress policies
create policy "Users can view their own progress"
    on public.progress for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can update their own progress"
    on public.progress for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Users can update their own progress"
    on public.progress for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- Create function for similarity search
create or replace function match_hadiths(
    query_embedding vector(384),
    match_threshold float,
    match_count int
)
returns table (
    id uuid,
    similarity float
)
language sql stable
as $$
    select id, 1 - (embedding <=> query_embedding) as similarity
    from hadiths
    where 1 - (embedding <=> query_embedding) > match_threshold
    order by similarity desc
    limit match_count;
$$; 