import { supabase } from './supabase'

const BUCKET = 'task-attachments'

// 파일 선택창(accept)에서 허용할 형식: 이미지, 워드, PDF, 한글(HWP)
export const ATTACHMENT_ACCEPT =
  'image/*,.pdf,application/pdf,.doc,.docx,application/msword,' +
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document,.hwp,.hwpx'

// Storage 오브젝트 경로에 안전하지 않은 문자를 정리
function sanitizeFileName(name: string): string {
  return name.replace(/[^\w.\-가-힣 ]/g, '_')
}

export async function uploadTaskAttachment(taskId: string, file: File): Promise<{ path: string; name: string }> {
  const path = `${taskId}/${Date.now()}-${sanitizeFileName(file.name)}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false })
  if (error) throw error
  return { path, name: file.name }
}

// 다운로드/열람용 서명된 URL 발급 (짧은 시간만 유효)
export async function getAttachmentUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60)
  if (error) throw error
  return data.signedUrl
}

export async function deleteAttachmentFile(path: string) {
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) throw error
}
