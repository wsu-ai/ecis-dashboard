import { useEffect, useState } from 'react'
import { createTask, fetchMyTasks, softDeleteTask, updateTask, type TaskInput } from '../lib/tasks'
import type { Task } from '../lib/types'

const emptyInput: TaskInput = {
  title: '', description: '', requesting_org: '', requesting_org_id: '',
  submission_method: '', contact_info: '', required_documents: '',
  status: '접수', priority: '보통', due_date: '',
}

export default function MyTasks({ userId }: { userId: string }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [input, setInput] = useState<TaskInput>(emptyInput)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true); setErr('')
    try {
      setTasks(await fetchMyTasks(userId))
    } catch (e: any) {
      setErr(e?.message || '업무 목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [userId])

  function openCreate() {
    setEditingId(null); setInput(emptyInput); setModalOpen(true)
  }
  function openEdit(t: Task) {
    setEditingId(t.id)
    setInput({
      title: t.title, description: t.description ?? '',
      requesting_org: t.requesting_org ?? '', requesting_org_id: t.requesting_org_id ?? '',
      submission_method: t.submission_method ?? '', contact_info: t.contact_info ?? '',
      required_documents: t.required_documents ?? '',
      status: t.status, priority: t.priority, due_date: t.due_date ?? '',
    })
    setModalOpen(true)
  }

  async function save() {
    if (!input.title.trim()) return
    setSaving(true)
    try {
      if (editingId) await updateTask(editingId, input)
      else await createTask(userId, input)
      setModalOpen(false)
      await load()
    } catch (e: any) {
      alert(e?.message || '저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  async function remove(t: Task) {
    if (!confirm(`"${t.title}" 업무를 삭제하시겠습니까? (기록은 남고 대시보드에서 조회 가능합니다)`)) return
    try {
      await softDeleteTask(t.id, userId)
      await load()
    } catch (e: any) {
      alert(e?.message || '삭제에 실패했습니다.')
    }
  }

  return (
    <div className="mytasks">
      <div className="dash-toolbar">
        <h2>내 업무</h2>
        <button className="primary" onClick={openCreate}>+ 새 업무 등록</button>
      </div>

      {loading && <p className="hint">불러오는 중…</p>}
      {err && <p className="hint err">{err}</p>}

      {!loading && !err && (
        <div className="card-list">
          {tasks.length === 0 && <p className="hint">등록된 업무가 없습니다.</p>}
          {tasks.map((t) => (
            <div className="task-card" key={t.id}>
              <div className="task-card-head">
                <b>{t.title}</b>
                <span className={`badge status-${t.status}`}>{t.status}</span>
              </div>
              <p className="task-card-meta">
                {t.requesting_org && <>요청부서: {t.requesting_org} · </>}
                마감일: {t.due_date || '미정'} · 우선순위: {t.priority}
              </p>
              {t.description && <p className="task-card-desc">{t.description}</p>}
              <div className="task-card-actions">
                <button className="ghost" onClick={() => openEdit(t)}>수정</button>
                <button className="ghost danger" onClick={() => remove(t)}>삭제</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal-card wide" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">{editingId ? '업무 수정' : '새 업무 등록'}</h2>

            <label className="field">
              <span>제목 *</span>
              <input value={input.title} onChange={(e) => setInput({ ...input, title: e.target.value })} />
            </label>
            <label className="field">
              <span>설명</span>
              <textarea value={input.description} onChange={(e) => setInput({ ...input, description: e.target.value })} rows={3} />
            </label>

            <div className="field-row">
              <label className="field">
                <span>요청 부서</span>
                <input value={input.requesting_org} onChange={(e) => setInput({ ...input, requesting_org: e.target.value })} />
              </label>
              <label className="field">
                <span>업무등록번호</span>
                <input value={input.requesting_org_id} onChange={(e) => setInput({ ...input, requesting_org_id: e.target.value })} placeholder="예: 교원인사과-2442" />
              </label>
            </div>

            <label className="field">
              <span>제출방법</span>
              <input value={input.submission_method} onChange={(e) => setInput({ ...input, submission_method: e.target.value })} placeholder="예: 이메일 제출, 온라인 시스템 업로드 등" />
            </label>
            <label className="field">
              <span>문의사항 연락처</span>
              <input value={input.contact_info} onChange={(e) => setInput({ ...input, contact_info: e.target.value })} placeholder="예: 담당자명, 전화번호, 이메일" />
            </label>
            <label className="field">
              <span>제출서류</span>
              <input value={input.required_documents} onChange={(e) => setInput({ ...input, required_documents: e.target.value })} placeholder="예: 재직증명서, 동의서" />
            </label>

            <div className="field-row">
              <label className="field">
                <span>상태</span>
                <select value={input.status} onChange={(e) => setInput({ ...input, status: e.target.value as TaskInput['status'] })}>
                  <option value="접수">접수</option>
                  <option value="진행중">진행중</option>
                  <option value="완료">완료</option>
                  <option value="보류">보류</option>
                </select>
              </label>
              <label className="field">
                <span>우선순위</span>
                <select value={input.priority} onChange={(e) => setInput({ ...input, priority: e.target.value as TaskInput['priority'] })}>
                  <option value="낮음">낮음</option>
                  <option value="보통">보통</option>
                  <option value="높음">높음</option>
                </select>
              </label>
              <label className="field">
                <span>마감일</span>
                <input type="date" value={input.due_date} onChange={(e) => setInput({ ...input, due_date: e.target.value })} />
              </label>
            </div>

            <div className="modal-actions">
              <button className="ghost" onClick={() => setModalOpen(false)}>취소</button>
              <button className="primary modal-ok" disabled={saving || !input.title.trim()} onClick={save}>
                {saving ? '저장 중…' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
