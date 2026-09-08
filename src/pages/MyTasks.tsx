import { useEffect, useState } from 'react'
import { fetchMyTasks, softDeleteTask } from '../lib/tasks'
import type { Task } from '../lib/types'
import { formatDueDate } from '../lib/format'
import TaskFormModal from '../components/TaskFormModal'

const statusSlug = (status: string) => status.toLowerCase().replace(/\s+/g, '-')

export default function MyTasks({ userId }: { userId: string }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)

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
    setEditing(null); setModalOpen(true)
  }
  function openEdit(t: Task) {
    setEditing(t); setModalOpen(true)
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
                Due: {t.due_date ? formatDueDate(t.due_date) : 'TBD'} · Priority: {t.priority}
              </p>
              <p className="task-card-meta">
                Task date: {t.task_date || '-'} · Enter date: {formatDueDate(t.created_at)}
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
        <TaskFormModal
          userId={userId}
          task={editing}
          onClose={() => setModalOpen(false)}
          onSaved={load}
        />
      )}
    </div>
  )
}
