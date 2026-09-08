import { supabase } from './supabase'
import type { Task, TaskWithOwner } from './types'

// 대시보드: 전체 업무 + 등록자/삭제자 이름을 조인해서 가져온다(RLS상 전체 조회 허용됨).
export async function fetchAllTasks(): Promise<TaskWithOwner[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*, owner:profiles!tasks_owner_id_fkey(name,department), deleter:profiles!tasks_deleted_by_fkey(name)')
  if (error) throw error
  return (data ?? []).map((row: any) => ({
    ...row,
    owner_name: row.owner?.name ?? '',
    owner_department: row.owner?.department ?? '',
    deleter_name: row.deleter?.name ?? null,
  }))
}

export type TaskInput = {
  title: string
  description: string
  requesting_org: string
  requesting_org_id: string
  submission_method: string
  contact_info: string
  required_documents: string
  status: Task['status']
  priority: Task['priority']
  task_date: string // "YYYY-MM-DD", '' 허용(미정)
  due_date: string // "YYYY-MM-DD HH:MM AM" (로컬 시간), '' 허용(미정)
}

// "YYYY-MM-DD HH:MM AM" (로컬 시간) → timestamptz용 ISO 문자열.
// 형식이 맞지 않으면 null (미입력과 동일 취급 — 호출부에서 미리 검증한다).
export function parseDueInput(v: string): string | null {
  const s = v.trim()
  if (!s) return null
  const m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})\s+(\d{1,2}):(\d{2})\s*([AaPp][Mm])$/)
  if (!m) return null
  const [, y, mo, d, h, mi, ap] = m
  let hour = parseInt(h, 10) % 12
  if (ap.toLowerCase() === 'pm') hour += 12
  const dt = new Date(Number(y), Number(mo) - 1, Number(d), hour, Number(mi))
  return Number.isNaN(dt.getTime()) ? null : dt.toISOString()
}

// 입력값이 비었거나 형식이 유효하면 true
export function isDueInputValid(v: string): boolean {
  return !v.trim() || parseDueInput(v) !== null
}

export async function createTask(ownerId: string, input: TaskInput) {
  const { error } = await supabase.from('tasks').insert({
    owner_id: ownerId,
    ...input,
    task_date: input.task_date || null,
    due_date: parseDueInput(input.due_date),
  })
  if (error) throw error
}

export async function updateTask(id: string, input: TaskInput) {
  const { error } = await supabase
    .from('tasks')
    .update({ ...input, task_date: input.task_date || null, due_date: parseDueInput(input.due_date) })
    .eq('id', id)
  if (error) throw error
}

// 소프트 삭제 — 실제 DELETE는 RLS로 막혀있어 여기선 UPDATE만 사용한다.
export async function softDeleteTask(id: string, userId: string) {
  const { error } = await supabase
    .from('tasks')
    .update({ deleted_at: new Date().toISOString(), deleted_by: userId })
    .eq('id', id)
  if (error) throw error
}
