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
  const [tab, setTab] = useState<Tab>('dashboard') // land on the dashboard (all tasks) first

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
          <h1>Setup Required</h1>
          <p className="hint">Server (Supabase) is not configured yet. Add VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY to .env.local.</p>
        </div>
      </div>
    )
  }

  if (!session) return <Login />
  if (loadingProfile) return <div className="auth-screen"><p className="hint">Loading…</p></div>
  if (!profile) return <ProfileSetup userId={session.user.id} onDone={setProfile} />

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>ECIS IAO Task Dashboard</h1>
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
        {tab === 'dashboard' ? <Dashboard /> : <MyTasks userId={session.user.id} />}
      </main>
    </div>
  )
}
