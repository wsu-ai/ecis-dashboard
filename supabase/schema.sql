-- 대학 업무 관리 대시보드 — Supabase 프로젝트의 SQL Editor에서 실행하세요.

-- ── profiles: 로그인 사용자 프로필 (auth.users와 1:1) ──
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  department text not null default '',
  role text not null default 'Staff' check (role in ('Faculty', 'Assistant', 'Staff')),
  is_admin boolean not null default false,   -- 관리자: 누구의 업무든 삭제 가능
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- 전체 로그인 사용자가 서로의 이름/부서를 볼 수 있어야 대시보드에 표시 가능
drop policy if exists "profiles_select_all" on profiles;
create policy "profiles_select_all" on profiles
  for select using (auth.role() = 'authenticated');

-- 본인 프로필만 생성/수정 가능
drop policy if exists "profiles_insert_own" on profiles;
create policy "profiles_insert_own" on profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on profiles;
create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);


-- ── tasks: 업무 항목 ──
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,

  title text not null,
  description text,

  requesting_org text,       -- 요청 부처명
  requesting_org_id text,    -- 업무등록번호 (예: "교원인사과-2442")

  submission_method text,    -- 제출방법
  contact_info text,         -- 문의사항 연락처
  required_documents text,   -- 제출서류

  status text not null default 'Received' check (status in ('Received', 'In Progress', 'Completed', 'On Hold')),
  priority text not null default 'Medium' check (priority in ('Low', 'Medium', 'High')),
  task_date date,        -- 업무 일자 (사용자가 등록 시 입력)
  due_date timestamptz,   -- 마감 일시

  -- 소프트 삭제: 실제 DELETE는 RLS로 막고, 이 두 컬럼만 채워서 "삭제 처리"한다.
  deleted_at timestamptz,
  deleted_by uuid references profiles(id),

  created_at timestamptz not null default now(),   -- 등록 일시 ("Enter Date")
  updated_at timestamptz not null default now()
);

create index if not exists tasks_due_date_idx on tasks (due_date);
create index if not exists tasks_requesting_org_idx on tasks (requesting_org);
create index if not exists tasks_owner_id_idx on tasks (owner_id);

alter table tasks enable row level security;

-- 대시보드는 전체 업무(삭제된 것 포함)를 모두 볼 수 있어야 함 — 조회는 전체 개방
drop policy if exists "tasks_select_all" on tasks;
create policy "tasks_select_all" on tasks
  for select using (auth.role() = 'authenticated');

-- 등록은 본인 명의로만
drop policy if exists "tasks_insert_own" on tasks;
create policy "tasks_insert_own" on tasks
  for insert with check (auth.uid() = owner_id);

-- 수정(소프트 삭제 포함)은 본인 업무만
drop policy if exists "tasks_update_own" on tasks;
create policy "tasks_update_own" on tasks
  for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- 관리자(is_admin)는 누구의 업무든 수정/소프트 삭제 가능 (본인 정책과 OR로 합쳐짐)
drop policy if exists "tasks_update_admin" on tasks;
create policy "tasks_update_admin" on tasks
  for update
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin));

-- DELETE 정책을 아예 만들지 않음 = RLS 기본값(전체 거부)으로 실제 삭제 완전 차단


-- ── updated_at 자동 갱신 ──
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists tasks_set_updated_at on tasks;
create trigger tasks_set_updated_at
  before update on tasks
  for each row execute function set_updated_at();
