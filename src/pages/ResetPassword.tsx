import { useState } from 'react'
import { updatePassword } from '../lib/auth'
import BrandMark from '../components/BrandMark'

export default function ResetPassword({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [done, setDone] = useState(false)

  async function submit() {
    setErr('')
    if (password.length < 6) {
      setErr('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setErr('The two passwords do not match.')
      return
    }
    setBusy(true)
    try {
      const { error } = await updatePassword(password)
      if (error) throw error
      setDone(true)
    } catch (e: any) {
      setErr(e?.message || 'Could not update the password. The reset link may have expired — request a new one.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-screen">
      <BrandMark />
      <div className="auth-card">
        <h1>Set a New Password</h1>

        {done ? (
          <>
            <p className="auth-notice">Your password has been updated. You are now signed in.</p>
            <button className="primary" onClick={onDone}>Continue</button>
          </>
        ) : (
          <>
            <p className="auth-sub">Choose a new password for your account.</p>

            <label className="field">
              <span>New Password <span className="label-note">(must be at least 6 characters)</span></span>
              <input type="password" value={password} autoComplete="new-password"
                onChange={(e) => setPassword(e.target.value)} />
            </label>
            <label className="field">
              <span>Confirm New Password</span>
              <input type="password" value={confirm} autoComplete="new-password"
                onChange={(e) => setConfirm(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') submit() }} />
            </label>

            {err && <p className="auth-err">{err}</p>}

            <button className="primary" disabled={busy} onClick={submit}>
              {busy ? 'Updating…' : 'Update password'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
