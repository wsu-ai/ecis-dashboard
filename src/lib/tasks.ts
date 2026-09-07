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

// 내 업무: 본인이 등록한 것 + 삭제되지 않은 것
export async function fetchMyTasks(userId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('owner_id', userId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
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
  due_date: string // '' 허용(미정)
}

export async function createTask(ownerId: string, input: TaskInput) {
  const { error } = await supabase.from('tasks').insert({
    owner_id: ownerId,
    ...input,
    due_date: input.due_date || null,
  })
  if (error) throw error
}

export async function updateTask(id: string, input: TaskInput) {
  const { error } = await supabase
    .from('tasks')
    .update({ ...input, due_date: input.due_date || null })
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
