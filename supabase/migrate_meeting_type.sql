-- "New Task" 팝업에 Task/Meeting 유형 추가: tasks 컬럼 추가.
-- Supabase SQL Editor에서 한 번 실행하세요. 여러 번 실행해도 안전합니다.

alter table tasks add column if not exists task_type text not null default 'Task';

-- 이 컬럼이 생기기 전에 등록된 기존 업무는 모두 'Task'로 확정한다
update tasks set task_type = 'Task' where task_type is distinct from 'Meeting';

alter table tasks drop constraint if exists tasks_task_type_check;
alter table tasks
  add constraint tasks_task_type_check check (task_type in ('Task', 'Meeting'));

alter table tasks add column if not exists meeting_location text;
alter table tasks add column if not exists meeting_duration text;
