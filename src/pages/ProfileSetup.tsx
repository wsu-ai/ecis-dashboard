import { useState } from 'react'
import { createMyProfile } from '../lib/auth'
import type { Profile, Role } from '../lib/types'

export default function ProfileSetup({ userId, onDone }: { userId: string; onDone: (p: Profile) => void }) {
  const [name, setName] = useState('')
  const [department, setDepartment] = useState('')
  const [role, setRole] = useState<Role>('Staff')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function submit() {
    setErr('')
    if (!name.trim() || !department.trim()) return
    setBusy(true)
    try {
      await createMyProfile(userId, name.trim(), department.trim(), role)
      onDone({ id: userId, name: name.trim(), department: department.trim(), role, is_admin: false, created_at: new Date().toISOString() })
    } catch (e: any) {
      setErr(e?.message || 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h1>Welcome 👋</h1>
        <p className="auth-sub">Tell us a bit about yourself for the dashboard.</p>

        <label className="field">
          <span>Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="field">
          <span>Department</span>
          <input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Faculty Affairs" />
        </label>
        <label className="field">
          <span>Role</span>
          <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
            <option value="Faculty">Faculty</option>
            <option value="Assistant">Assistant</option>
            <option value="Staff">Staff</option>
          </select>
        </label>

        {err && <p className="auth-err">{err}</p>}

        <button className="primary" disabled={busy || !name.trim() || !department.trim()} onClick={submit}>
          {busy ? 'Saving…' : 'Get Started'}
        </button>
      </div>
    </div>
  )
}
