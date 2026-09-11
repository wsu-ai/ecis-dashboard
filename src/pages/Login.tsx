import { useState } from 'react'
import { signIn, signUp } from '../lib/auth'
import ForgotPassword from './ForgotPassword'
import BrandMark from '../components/BrandMark'

export default function Login() {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [notice, setNotice] = useState('')

  async function submit() {
    setErr(''); setNotice('')
    if (!email.trim() || !password.trim()) return
    if (!/@(.*\.)?(wsu\.ac\.kr|woosong\.org)$/i.test(email.trim())) {
      setErr('Email address must be a valid Woosong email address.')
      return
    }
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
      const msg: string = e?.message || ''
      if (/failed to fetch|load failed|networkerror/i.test(msg)) {
        setErr('Cannot reach the server. Please try again in a moment, or contact the administrator if this continues.')
      } else {
        setErr(msg || 'Something went wrong.')
      }
    } finally {
      setBusy(false)
    }
  }

  if (mode === 'forgot') {
    return <ForgotPassword onBack={() => { setMode('signin'); setErr(''); setNotice('') }} />
  }

  return (
    <div className="auth-screen">
      <BrandMark />
      <div className="auth-card">
        <h1>Endicott International Office Dashboard</h1>
        <p className="auth-sub">{mode === 'signin' ? 'Sign In' : 'Sign Up'}</p>

        <label className="field">
          <span>Email <span className="label-note">(Your Woosong email address)</span></span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </label>
        <label className="field">
          <span>Password <span className="label-note">(must be at least 6 characters)</span></span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            onKeyDown={(e) => { if (e.key === 'Enter') submit() }} />
        </label>

        {err && <p className="auth-err">{err}</p>}
        {notice && <p className="auth-notice">{notice}</p>}

        <button className="primary" disabled={busy} onClick={submit}>
          {busy ? 'Working…' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
        </button>

        {mode === 'signin' && (
          <p className="auth-forgot">
            Forgot password? Click{' '}
            <button type="button" className="linklike-inline"
              onClick={() => { setMode('forgot'); setErr(''); setNotice('') }}>here</button>{' '}
            to reset a password.
          </p>
        )}

        <button className="linklike" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setErr(''); setNotice('') }}>
          {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  )
}
