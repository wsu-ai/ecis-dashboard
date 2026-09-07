export type Role = '교원' | '조교' | '스태프'
export type Status = '접수' | '진행중' | '완료' | '보류'
export type Priority = '낮음' | '보통' | '높음'

export type Profile = {
  id: string
  name: string
  department: string
  role: Role
  created_at: string
}

export type Task = {
  id: string
  owner_id: string
  title: string
  description: string | null
  requesting_org: string | null
  requesting_org_id: string | null
  submission_method: string | null
  contact_info: string | null
  required_documents: string | null
  status: Status
  priority: Priority
  due_date: string | null // YYYY-MM-DD
  deleted_at: string | null
  deleted_by: string | null
  created_at: string
  updated_at: string
}

// 대시보드에서 등록자 이름/부서까지 같이 보여주기 위한 조인 결과 타입
export type TaskWithOwner = Task & {
  owner_name: string
  owner_department: string
  deleter_name: string | null
}
