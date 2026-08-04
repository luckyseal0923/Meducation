alter table public.questions add column if not exists category text;

drop policy if exists "public reads questions in published quizzes" on public.questions;
create policy "public reads questions in published quizzes"
on public.questions for select
using (
  exists (
    select 1
    from public.quiz_questions qq
    join public.quizzes q on q.id = qq.quiz_id
    where qq.question_id = questions.id
      and q.is_published = true
  )
);
