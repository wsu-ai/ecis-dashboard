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

export async function getMyProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  if (error) throw error
  return data
}

export async function createMyProfile(userId: string, name: string, department: string, role: Profile['role']) {
  const { error } = await supabase.from('profiles').insert({ id: userId, name, department, role })
  if (error) throw error
}
