-- "Meetings" 탭: 미팅은 로그인한 누구나 수정할 수 있게 허용하는 정책 추가.
-- (삭제는 여전히 tasks_update_own / tasks_update_admin 을 통해 소유자·관리자만 가능)
-- Supabase SQL Editor에서 한 번 실행하세요. 여러 번 실행해도 안전합니다.

drop policy if exists "tasks_update_meeting_any" on tasks;
create policy "tasks_update_meeting_any" on tasks
  for update
  using (task_type = 'Meeting')
  with check (task_type = 'Meeting');
