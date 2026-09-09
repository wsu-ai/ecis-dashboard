-- profiles.is_admin 컬럼 + 관리자용 tasks 업데이트 정책 추가.
-- Supabase SQL Editor에서 한 번 실행하세요. 여러 번 실행해도 안전합니다.

alter table profiles add column if not exists is_admin boolean not null default false;

drop policy if exists "tasks_update_admin" on tasks;
create policy "tasks_update_admin" on tasks
  for update
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin));

-- 관리자 지정 예시 (이메일은 실제 값으로 바꾸세요):
update profiles set is_admin = true
where id = (select id from auth.users where email = 'john.yun@wsu.ac.kr');
