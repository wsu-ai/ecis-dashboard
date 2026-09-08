import { useEffect, useMemo, useState } from 'react'
import { fetchAllTasks, softDeleteTask } from '../lib/tasks'
import type { Profile, TaskWithOwner } from '../lib/types'
import { formatRefreshed } from '../lib/format'
import TaskFormModal from '../components/TaskFormModal'
import TaskTable from '../components/TaskTable'

export default function Dashboard({ profile }: { profile: Profile }) {
  const [tasks, setTasks] = useState<TaskWithOwner[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [showDeleted, setShowDeleted] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<TaskWithOwner | null>(null)
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null)

  async function load() {
    setLoading(true); setErr('')
    try {
      setTasks(await fetchAllTasks())
      setRefreshedAt(new Date())
    } catch (e: any) {
      setErr(e?.message || 'Failed to load the task list.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const visible = useMemo(
    () => tasks.filter((t) => showDeleted ? !!t.deleted_at : !t.deleted_at),
    [tasks, showDeleted],
  )

  // 본인이 등록한 업무이거나 관리자면 수정/삭제 가능
  const canModify = (t: TaskWithOwner) => t.owner_id === profile.id || profile.is_admin

  function openCreate() { setEditing(null); setModalOpen(true) }
  function openEdit(t: TaskWithOwner) { setEditing(t); setModalOpen(true) }

  async function remove(t: TaskWithOwner) {
    if (!confirm(`Delete "${t.title}"? (It is kept as a record and stays visible under "Deleted Tasks".)`)) return
    try {
      await softDeleteTask(t.id, profile.id)
      await load()
    } catch (e: any) {
      alert(e?.message || 'Failed to delete.')
    }
  }

  return (
    <div className="dash">
      <div className="dash-toolbar">
        <div className="dash-tabs">
          <button className={!showDeleted ? 'on' : ''} onClick={() => setShowDeleted(false)}>All Tasks</button>
          <button className={showDeleted ? 'on' : ''} onClick={() => setShowDeleted(true)}>Deleted Tasks</button>
        </div>
        <div className="dash-toolbar-actions">
          <button className="primary" onClick={openCreate}>New Task+</button>
          <button className="ghost" onClick={load}>Refresh</button>
        </div>
      </div>

      {refreshedAt && (
        <p className="dash-refreshed">Last Refreshed at {formatRefreshed(refreshedAt)}</p>
      )}

      {loading && <p className="hint">Loading…</p>}
      {err && <p className="hint err">{err}</p>}

      {!loading && !err && (
        <TaskTable
          rows={visible}
          showDeleted={showDeleted}
          canModify={canModify}
          onEdit={openEdit}
          onDelete={remove}
        />
      )}

      {modalOpen && (
        <TaskFormModal
          userId={profile.id}
          task={editing}
          onClose={() => { setModalOpen(false); setEditing(null) }}
          onSaved={load}
        />
      )}
    </div>
  )
}
