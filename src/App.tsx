import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { hasSupabase, supabase } from './lib/supabase'
import { getMyProfile, signOut } from './lib/auth'
import type { Profile } from './lib/types'
import Login from './pages/Login'
import ProfileSetup from './pages/ProfileSetup'
import Dashboard from './pages/Dashboard'
import MyTasks from './pages/MyTasks'

type Tab = 'dashboard' | 'mytasks'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [tab, setTab] = useState<Tab>('dashboard') // 첫 진입 = 대시보드(전체 업무)

  useEffect(() => {
    if (!hasSupabase()) { setLoadingProfile(false); return }
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) { setProfile(null); setLoadingProfile(false); return }
    setLoadingProfile(true)
    getMyProfile(session.user.id)
      .then(setProfile)
      .finally(() => setLoadingProfile(false))
  }, [session])

  if (!hasSupabase()) {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <h1>설정 필요</h1>
          <p className="hint">서버 설정(Supabase)이 아직 없습니다. .env.local에 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY를 넣어주세요.</p>
        </div>
      </div>
    )
  }

  if (!session) return <Login />
  if (loadingProfile) return <div className="auth-screen"><p className="hint">불러오는 중…</p></div>
  if (!profile) return <ProfileSetup userId={session.user.id} onDone={setProfile} />

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>대학 업무 관리 대시보드</h1>
        <div className="app-header-right">
          <span className="who">{profile.name} ({profile.department})</span>
          <button className="ghost" onClick={() => signOut()}>로그아웃</button>
        </div>
      </header>

      <nav className="app-tabs">
        <button className={tab === 'dashboard' ? 'on' : ''} onClick={() => setTab('dashboard')}>대시보드</button>
        <button className={tab === 'mytasks' ? 'on' : ''} onClick={() => setTab('mytasks')}>내 업무</button>
      </nav>

      <main className="app-main">
        {tab === 'dashboard' ? <Dashboard /> : <MyTasks userId={session.user.id} />}
      </main>
    </div>
  )
}
