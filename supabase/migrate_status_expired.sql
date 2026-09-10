-- tasks.status 에 'Expired' 옵션 추가.
-- Supabase SQL Editor에서 한 번 실행하세요. 여러 번 실행해도 안전합니다.

alter table tasks drop constraint if exists tasks_status_check;
alter table tasks
  add constraint tasks_status_check
  check (status in ('Received', 'In Progress', 'Completed', 'On Hold', 'Expired'));
