-- tasks.due_date 를 date → timestamptz 로 변경 (마감 "일시" 저장).
-- Supabase SQL Editor에서 한 번 실행하세요. 이미 timestamptz면 아무 일도 하지 않습니다.

do $$
begin
  if (select data_type from information_schema.columns
      where table_name = 'tasks' and column_name = 'due_date') = 'date' then
    alter table tasks
      alter column due_date type timestamptz using due_date::timestamptz;
  end if;
end $$;
