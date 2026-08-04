create table if not exists public.quizzes (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
 title text not null, slug text not null unique, is_published boolean not null default false, created_at timestamptz default now()
);
create table if not exists public.questions (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
 term text not null, clue text not null, category text, created_at timestamptz default now(), unique(owner_id,term)
);
create table if not exists public.shared_questions (
 id uuid primary key default gen_random_uuid(),
 term text not null unique, clue text not null, category text, created_at timestamptz default now()
);
create table if not exists public.quiz_questions (
 quiz_id uuid references public.quizzes(id) on delete cascade, question_id uuid references public.questions(id) on delete cascade,
 primary key(quiz_id,question_id)
);
alter table public.quizzes enable row level security;
alter table public.questions enable row level security;
alter table public.shared_questions enable row level security;
alter table public.quiz_questions enable row level security;
create policy "owners manage quizzes" on public.quizzes for all to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy "owners manage questions" on public.questions for all to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy "public reads shared questions" on public.shared_questions for select using(true);
create policy "owners manage quiz links" on public.quiz_questions for all to authenticated using(exists(select 1 from public.quizzes q where q.id=quiz_id and q.owner_id=auth.uid())) with check(exists(select 1 from public.quizzes q where q.id=quiz_id and q.owner_id=auth.uid()));
create policy "public reads published quizzes" on public.quizzes for select using(is_published);
create policy "public reads published quiz questions" on public.quiz_questions for select using(exists(select 1 from public.quizzes q where q.id=quiz_id and q.is_published));
create policy "public reads questions in published quizzes" on public.questions for select using(
  exists(
    select 1 from public.quiz_questions qq
    join public.quizzes q on q.id = qq.quiz_id
    where qq.question_id = questions.id and q.is_published
  )
);
