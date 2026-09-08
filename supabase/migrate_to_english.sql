-- 기존(한국어) 스키마로 만들어진 프로젝트를 영어 값으로 맞추는 마이그레이션.
-- Supabase SQL Editor에서 한 번 실행하세요. 여러 번 실행해도 안전합니다.

-- ── profiles.role ──
alter table profiles drop constraint if exists profiles_role_check;
update profiles set role = case role
  when '교원'   then 'Faculty'
  when '조교'   then 'Assistant'
  when '스태프' then 'Staff'
  else role
end;
alter table profiles alter column role set default 'Staff';
alter table profiles
  add constraint profiles_role_check check (role in ('Faculty', 'Assistant', 'Staff'));

-- ── tasks.status ──
alter table tasks drop constraint if exists tasks_status_check;
update tasks set status = case status
  when '접수'   then 'Received'
  when '진행중' then 'In Progress'
  when '완료'   then 'Completed'
  when '보류'   then 'On Hold'
  else status
end;
alter table tasks alter column status set default 'Received';
alter table tasks
  add constraint tasks_status_check check (status in ('Received', 'In Progress', 'Completed', 'On Hold'));

-- ── tasks.priority ──
alter table tasks drop constraint if exists tasks_priority_check;
update tasks set priority = case priority
  when '낮음' then 'Low'
  when '보통' then 'Medium'
  when '높음' then 'High'
  else priority
end;
alter table tasks alter column priority set default 'Medium';
alter table tasks
  add constraint tasks_priority_check check (priority in ('Low', 'Medium', 'High'));
