import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { hasSupabase, supabase } from './lib/supabase'
import { getMyProfile, signOut } from './lib/auth'
import type { Profile } from './lib/types'
import Login from './pages/Login'
import ProfileSetup from './pages/ProfileSetup'
import Dashboard from './pages/Dashboard'
import MyTasks from './pages/MyTasks'
import ResetPassword from './pages/ResetPassword'
import BrandMark from './components/BrandMark'
import { formatLongDate } from './lib/format'

type Tab = 'dashboard' | 'mytasks'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [recovering, setRecovering] = useState(false) // 비밀번호 재설정 메일 링크로 진입
  const [tab, setTab] = useState<Tab>('dashboard') // land on the dashboard (all tasks) first

  useEffect(() => {
    if (!hasSupabase()) { setLoadingProfile(false); return }
    // 재설정 메일 링크는 URL 해시에 type=recovery 를 달고 돌아온다
    if (/type=recovery/.test(window.location.hash)) setRecovering(true)
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === 'PASSWORD_RECOVERY') setRecovering(true)
      setSession(s)
    })
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
        <BrandMark />
        <div className="auth-card">
          <h1>Setup Required</h1>
          <p className="hint">Server (Supabase) is not configured yet. Add VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY to .env.local.</p>
        </div>
      </div>
    )
  }

  if (recovering) return <ResetPassword onDone={() => setRecovering(false)} />
  if (!session) return <Login />
  if (loadingProfile) return <div className="auth-screen"><BrandMark /><p className="hint">Loading…</p></div>
  if (!profile) return <ProfileSetup userId={session.user.id} onDone={setProfile} />

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-left">
          <BrandMark />
          <h1>International Office Task Dashboard</h1>
          <span className="app-date">{formatLongDate()}</span>
        </div>
        <div className="app-header-right">
          <span className="who">{profile.name} ({profile.department})</span>
          <button className="ghost" onClick={() => signOut()}>Log out</button>
        </div>
      </header>

      <nav className="app-tabs">
        <button className={tab === 'dashboard' ? 'on' : ''} onClick={() => setTab('dashboard')}>Dashboard</button>
        <button className={tab === 'mytasks' ? 'on' : ''} onClick={() => setTab('mytasks')}>My Tasks</button>
      </nav>

      <main className="app-main">
        {tab === 'dashboard' ? <Dashboard profile={profile} /> : <MyTasks profile={profile} />}
      </main>
    </div>
  )
}
