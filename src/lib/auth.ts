import { supabase } from './supabase'
import type { Profile } from './types'

export async function signUp(email: string, password: string) {
  return supabase.auth.signUp({ email, password })
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signOut() {
  return supabase.auth.signOut()
}

// 비밀번호 재설정 메일 발송 — 메일의 링크는 앱으로 돌아오며 PASSWORD_RECOVERY 세션을 만든다.
// redirectTo 는 Supabase Auth 의 "Redirect URLs" 허용목록에 있어야 적용된다.
export async function sendPasswordReset(email: string) {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin,
  })
}

// 복구 세션 상태에서 새 비밀번호 저장
export async function updatePassword(password: string) {
  return supabase.auth.updateUser({ password })
}

export async function getMyProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  if (error) throw error
  return data
}

export async function createMyProfile(userId: string, name: string, department: string, role: Profile['role']) {
  const { error } = await supabase.from('profiles').insert({ id: userId, name, department, role })
  if (error) throw error
}
