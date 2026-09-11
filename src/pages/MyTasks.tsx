import { useEffect, useMemo, useState } from 'react'
import { fetchAllTasks, softDeleteTask } from '../lib/tasks'
import type { Profile, TaskWithOwner } from '../lib/types'
import { formatRefreshed } from '../lib/format'
import TaskFormModal from '../components/TaskFormModal'
import TaskTable from '../components/TaskTable'

export default function MyTasks({ profile }: { profile: Profile }) {
  const userId = profile.id
  const [tasks, setTasks] = useState<TaskWithOwner[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
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

  useEffect(() => { load() }, [userId])

  // 내가 등록한, 삭제되지 않은 업무만
  const mine = useMemo(
    () => tasks.filter((t) => t.owner_id === userId && !t.deleted_at),
    [tasks, userId],
  )

  function openCreate() { setEditing(null); setModalOpen(true) }
  function openEdit(t: TaskWithOwner) { setEditing(t); setModalOpen(true) }

  async function remove(t: TaskWithOwner) {
    if (!confirm(`Delete "${t.title}"? (It is kept as a record and stays visible on the dashboard.)`)) return
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
        <h2>My Tasks {profile.name && <span className="mytasks-who">({profile.name})</span>}</h2>
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
          rows={mine}
          showDeleted={false}
          hideOwner
          canModify={() => true}
          onEdit={openEdit}
          onDelete={remove}
          onRefresh={load}
        />
      )}

      {modalOpen && (
        <TaskFormModal
          userId={userId}
          task={editing}
          onClose={() => { setModalOpen(false); setEditing(null) }}
          onSaved={load}
        />
      )}
    </div>
  )
}
