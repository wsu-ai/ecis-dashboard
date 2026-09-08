import { useState } from 'react'
import { signIn, signUp } from '../lib/auth'

export default function Login() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [notice, setNotice] = useState('')

  async function submit() {
    setErr(''); setNotice('')
    if (!email.trim() || !password.trim()) return
    setBusy(true)
    try {
      if (mode === 'signin') {
        const { error } = await signIn(email.trim(), password)
        if (error) {
          if (error.status === 400 || /invalid login credentials/i.test(error.message)) {
            throw new Error('Login information not recognized. Please check your email address and the password.')
          }
          throw error
        }
      } else {
        const { error } = await signUp(email.trim(), password)
        if (error) throw error
        setNotice('A confirmation email has been sent. Please check your inbox.')
      }
    } catch (e: any) {
      setErr(e?.message || 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h1>ECIS IAO Task Dashboard</h1>
        <p className="auth-sub">{mode === 'signin' ? 'Sign In' : 'Sign Up'}</p>

        <label className="field">
          <span>Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </label>
        <label className="field">
          <span>Password</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            onKeyDown={(e) => { if (e.key === 'Enter') submit() }} />
        </label>

        {err && <p className="auth-err">{err}</p>}
        {notice && <p className="auth-notice">{notice}</p>}

        <button className="primary" disabled={busy} onClick={submit}>
          {busy ? 'Working…' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
        </button>

        <button className="linklike" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setErr(''); setNotice('') }}>
          {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  )
}
