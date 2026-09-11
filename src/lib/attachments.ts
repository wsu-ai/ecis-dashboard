import { supabase } from './supabase'

const BUCKET = 'task-attachments'

// 파일 선택창(accept)에서 허용할 형식: 이미지, 워드, PDF, 한글(HWP)
export const ATTACHMENT_ACCEPT =
  'image/*,.pdf,application/pdf,.doc,.docx,application/msword,' +
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document,.hwp,.hwpx'

// 파일명에 아스키(ASCII)가 아닌 문자(한글, 이모지 등)가 있으면 false
export function isAsciiFileName(name: string): boolean {
  // eslint-disable-next-line no-control-regex
  return /^[\x00-\x7F]*$/.test(name)
}

// Storage 오브젝트 키에 남아도 되는 안전한 문자만 남기고 나머지(공백 등)는 밑줄로 치환
function sanitizeFileName(name: string): string {
  return name.replace(/[^A-Za-z0-9._-]/g, '_') || 'file'
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
