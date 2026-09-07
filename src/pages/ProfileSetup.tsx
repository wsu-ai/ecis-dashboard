import { useState } from 'react'
import { createMyProfile } from '../lib/auth'
import type { Profile, Role } from '../lib/types'

export default function ProfileSetup({ userId, onDone }: { userId: string; onDone: (p: Profile) => void }) {
  const [name, setName] = useState('')
  const [department, setDepartment] = useState('')
  const [role, setRole] = useState<Role>('스태프')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function submit() {
    setErr('')
    if (!name.trim() || !department.trim()) return
    setBusy(true)
    try {
      await createMyProfile(userId, name.trim(), department.trim(), role)
      onDone({ id: userId, name: name.trim(), department: department.trim(), role, created_at: new Date().toISOString() })
    } catch (e: any) {
      setErr(e?.message || '오류가 발생했습니다.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h1>처음 오셨네요 👋</h1>
        <p className="auth-sub">대시보드에 표시될 기본 정보를 입력해주세요.</p>

        <label className="field">
          <span>이름</span>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="field">
          <span>소속 부서</span>
          <input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="예: 교원인사과" />
        </label>
        <label className="field">
          <span>구분</span>
          <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
            <option value="교원">교원</option>
            <option value="조교">조교</option>
            <option value="스태프">스태프</option>
          </select>
        </label>

        {err && <p className="auth-err">{err}</p>}

        <button className="primary" disabled={busy || !name.trim() || !department.trim()} onClick={submit}>
          {busy ? '저장 중…' : '시작하기'}
        </button>
      </div>
    </div>
  )
}
