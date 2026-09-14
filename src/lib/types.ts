export type Role = 'Faculty' | 'Assistant' | 'Staff'
export type Status = 'Received' | 'In Progress' | 'Completed' | 'On Hold' | 'Expired'
export type Priority = 'Low' | 'Medium' | 'High'
export type TaskType = 'Task' | 'Meeting'

export type Profile = {
  id: string
  name: string
  department: string
  role: Role
  is_admin: boolean
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
  task_type: TaskType
  task_date: string | null // YYYY-MM-DD (date)
  due_date: string | null // ISO timestamp (timestamptz) — 미팅의 경우 "Meeting Date & Time"으로도 쓰인다
  meeting_location: string | null
  meeting_duration: string | null
  attachment_path: string | null // Storage 객체 경로 (task-attachments 버킷)
  attachment_name: string | null // 업로드 당시 원본 파일명
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
