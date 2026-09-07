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
        if (error) throw error
      } else {
        const { error } = await signUp(email.trim(), password)
        if (error) throw error
        setNotice('가입 확인 이메일을 보냈습니다. 메일함을 확인해주세요.')
      }
    } catch (e: any) {
      setErr(e?.message || '오류가 발생했습니다.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h1>대학 업무 관리 대시보드</h1>
        <p className="auth-sub">{mode === 'signin' ? '로그인' : '회원가입'}</p>

        <label className="field">
          <span>이메일</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </label>
        <label className="field">
          <span>비밀번호</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            onKeyDown={(e) => { if (e.key === 'Enter') submit() }} />
        </label>

        {err && <p className="auth-err">{err}</p>}
        {notice && <p className="auth-notice">{notice}</p>}

        <button className="primary" disabled={busy} onClick={submit}>
          {busy ? '처리 중…' : mode === 'signin' ? '로그인' : '가입하기'}
        </button>

        <button className="linklike" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setErr(''); setNotice('') }}>
          {mode === 'signin' ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
        </button>
      </div>
    </div>
  )
}
