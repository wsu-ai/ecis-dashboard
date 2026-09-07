import { useEffect, useState } from 'react'
import { createTask, fetchMyTasks, softDeleteTask, updateTask, type TaskInput } from '../lib/tasks'
import type { Task } from '../lib/types'

const emptyInput: TaskInput = {
  title: '', description: '', requesting_org: '', requesting_org_id: '',
  submission_method: '', contact_info: '', required_documents: '',
  status: 'Received', priority: 'Medium', due_date: '',
}

const statusSlug = (status: string) => status.toLowerCase().replace(/\s+/g, '-')

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
      setErr(e?.message || 'Failed to load the task list.')
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
      alert(e?.message || 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  async function remove(t: Task) {
    if (!confirm(`Delete "${t.title}"? (This is kept as a record and stays visible on the dashboard.)`)) return
    try {
      await softDeleteTask(t.id, userId)
      await load()
    } catch (e: any) {
      alert(e?.message || 'Failed to delete.')
    }
  }

  return (
    <div className="mytasks">
      <div className="dash-toolbar">
        <h2>My Tasks</h2>
        <button className="primary" onClick={openCreate}>+ New Task</button>
      </div>

      {loading && <p className="hint">Loading…</p>}
      {err && <p className="hint err">{err}</p>}

      {!loading && !err && (
        <div className="card-list">
          {tasks.length === 0 && <p className="hint">No tasks registered yet.</p>}
          {tasks.map((t) => (
            <div className="task-card" key={t.id}>
              <div className="task-card-head">
                <b>{t.title}</b>
                <span className={`badge status-${statusSlug(t.status)}`}>{t.status}</span>
              </div>
              <p className="task-card-meta">
                {t.requesting_org && <>Requesting dept.: {t.requesting_org} · </>}
                Due: {t.due_date || 'TBD'} · Priority: {t.priority}
              </p>
              {t.description && <p className="task-card-desc">{t.description}</p>}
              <div className="task-card-actions">
                <button className="ghost" onClick={() => openEdit(t)}>Edit</button>
                <button className="ghost danger" onClick={() => remove(t)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal-card wide" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">{editingId ? 'Edit Task' : 'New Task'}</h2>

            <label className="field">
              <span>Title *</span>
              <input value={input.title} onChange={(e) => setInput({ ...input, title: e.target.value })} />
            </label>
            <label className="field">
              <span>Description</span>
              <textarea value={input.description} onChange={(e) => setInput({ ...input, description: e.target.value })} rows={3} />
            </label>

            <div className="field-row">
              <label className="field">
                <span>Requesting Department</span>
                <input value={input.requesting_org} onChange={(e) => setInput({ ...input, requesting_org: e.target.value })} />
              </label>
              <label className="field">
                <span>Reference No.</span>
                <input value={input.requesting_org_id} onChange={(e) => setInput({ ...input, requesting_org_id: e.target.value })} placeholder="e.g. Faculty-Affairs-2442" />
              </label>
            </div>

            <label className="field">
              <span>Submission Method</span>
              <input value={input.submission_method} onChange={(e) => setInput({ ...input, submission_method: e.target.value })} placeholder="e.g. Email, online portal upload, etc." />
            </label>
            <label className="field">
              <span>Contact Info</span>
              <input value={input.contact_info} onChange={(e) => setInput({ ...input, contact_info: e.target.value })} placeholder="e.g. contact name, phone, email" />
            </label>
            <label className="field">
              <span>Required Documents</span>
              <input value={input.required_documents} onChange={(e) => setInput({ ...input, required_documents: e.target.value })} placeholder="e.g. employment certificate, consent form" />
            </label>

            <div className="field-row">
              <label className="field">
                <span>Status</span>
                <select value={input.status} onChange={(e) => setInput({ ...input, status: e.target.value as TaskInput['status'] })}>
                  <option value="Received">Received</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </label>
              <label className="field">
                <span>Priority</span>
                <select value={input.priority} onChange={(e) => setInput({ ...input, priority: e.target.value as TaskInput['priority'] })}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </label>
              <label className="field">
                <span>Due Date</span>
                <input type="date" value={input.due_date} onChange={(e) => setInput({ ...input, due_date: e.target.value })} />
              </label>
            </div>

            <div className="modal-actions">
              <button className="ghost" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="primary modal-ok" disabled={saving || !input.title.trim()} onClick={save}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
