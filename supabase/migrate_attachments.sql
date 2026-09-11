-- 업무 첨부파일(이미지/워드/PDF/한글 파일) 지원: tasks 컬럼 + Storage 버킷/정책 추가.
-- Supabase SQL Editor에서 한 번 실행하세요. 여러 번 실행해도 안전합니다.

alter table tasks add column if not exists attachment_path text;
alter table tasks add column if not exists attachment_name text;

-- 비공개 버킷: 다운로드 시 매번 서명된 URL(signed URL)을 발급해서 접근한다
insert into storage.buckets (id, name, public)
values ('task-attachments', 'task-attachments', false)
on conflict (id) do nothing;

-- 로그인 사용자는 누구나 첨부파일을 올리고/보고/바꾸고/지울 수 있다
-- (tasks 테이블처럼 소유자/관리자로 세밀하게 제한하고 싶다면 이 정책들을 조정하세요)
drop policy if exists "task_attachments_select" on storage.objects;
create policy "task_attachments_select" on storage.objects
  for select using (bucket_id = 'task-attachments' and auth.role() = 'authenticated');

drop policy if exists "task_attachments_insert" on storage.objects;
create policy "task_attachments_insert" on storage.objects
  for insert with check (bucket_id = 'task-attachments' and auth.role() = 'authenticated');

drop policy if exists "task_attachments_update" on storage.objects;
create policy "task_attachments_update" on storage.objects
  for update using (bucket_id = 'task-attachments' and auth.role() = 'authenticated');

drop policy if exists "task_attachments_delete" on storage.objects;
create policy "task_attachments_delete" on storage.objects
  for delete using (bucket_id = 'task-attachments' and auth.role() = 'authenticated');
