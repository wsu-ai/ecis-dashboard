import { useState } from 'react'
import { sendPasswordReset } from '../lib/auth'
import BrandMark from '../components/BrandMark'

export default function ForgotPassword({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [sent, setSent] = useState(false)

  async function submit() {
    setErr('')
    const e = email.trim()
    if (!e) return
    if (!/@(.*\.)?wsu\.ac\.kr$/i.test(e)) {
      setErr('Email address must be a valid Woosong email address.')
      return
    }
    setBusy(true)
    try {
      const { error } = await sendPasswordReset(e)
      if (error) throw error
      setSent(true)
    } catch (e2: any) {
      const msg: string = e2?.message || ''
      if (/failed to fetch|load failed|networkerror/i.test(msg)) {
        setErr('Cannot reach the server. Please try again in a moment.')
      } else {
        setErr(msg || 'Something went wrong.')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-screen">
      <BrandMark />
      <div className="auth-card">
        <h1>Reset Password</h1>

        {sent ? (
          <>
            <p className="auth-notice">
              If an account exists for {email.trim()}, a password reset link has been sent.
              Open that email and follow the link to set a new password.
            </p>
            <button className="linklike" onClick={onBack}>Back to sign in</button>
          </>
        ) : (
          <>
            <p className="auth-sub">Enter your login email and we'll send you a link to set a new password.</p>

            <label className="field">
              <span>Email <span className="label-note">(Your Woosong email address)</span></span>
              <input type="email" value={email} autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') submit() }} />
            </label>

            {err && <p className="auth-err">{err}</p>}

            <button className="primary" disabled={busy} onClick={submit}>
              {busy ? 'Sending…' : 'Send reset link'}
            </button>
            <button className="linklike" onClick={onBack}>Back to sign in</button>
          </>
        )}
      </div>
    </div>
  )
}
