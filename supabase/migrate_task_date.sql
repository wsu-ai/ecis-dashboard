-- tasks.task_date 컬럼 추가 (업무 일자, 사용자가 등록 시 입력).
-- "Enter Date"(등록 일시)는 기존 created_at 컬럼을 그대로 사용합니다 — 새 컬럼 필요 없음.
-- Supabase SQL Editor에서 한 번 실행하세요. 여러 번 실행해도 안전합니다.

alter table tasks add column if not exists task_date date;
