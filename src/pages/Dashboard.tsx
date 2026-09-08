import { useEffect, useMemo, useState } from 'react'
import { fetchAllTasks, softDeleteTask } from '../lib/tasks'
import type { Priority, Profile, TaskWithOwner } from '../lib/types'
import { formatDueDate } from '../lib/format'
import TaskFormModal from '../components/TaskFormModal'

type SortKey = 'requesting_org' | 'due_date'
type SortDir = 'asc' | 'desc'

const WEEK_MS = 7 * 86_400_000

function isOverdue(t: TaskWithOwner): boolean {
  return !!t.due_date && new Date(t.due_date).getTime() < Date.now()
    && t.status !== 'Completed' && !t.deleted_at
}

// 마감이 일주일 이내(초과 포함)면 자동으로 High로 격상해서 표시한다. DB 값은 바꾸지 않는다.
function effectivePriority(t: TaskWithOwner): Priority {
  if (!t.deleted_at && t.status !== 'Completed' && t.due_date
    && new Date(t.due_date).getTime() - Date.now() <= WEEK_MS) {
    return 'High'
  }
  return t.priority
}

const prioClass = (p: Priority) => `prio-${p.toLowerCase()}`

export default function Dashboard({ profile }: { profile: Profile }) {
  const [tasks, setTasks] = useState<TaskWithOwner[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('due_date')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [showDeleted, setShowDeleted] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  async function load() {
    setLoading(true); setErr('')
    try {
      setTasks(await fetchAllTasks())
    } catch (e: any) {
      setErr(e?.message || 'Failed to load the task list.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const visible = useMemo(() => {
    const filtered = tasks.filter((t) => showDeleted ? !!t.deleted_at : !t.deleted_at)
    const sorted = [...filtered].sort((a, b) => {
      const av = (a[sortKey] ?? '') as string
      const bv = (b[sortKey] ?? '') as string
      // 값이 없는(미정) 항목은 항상 맨 뒤로
      if (!av && !bv) return 0
      if (!av) return 1
      if (!bv) return -1
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortDir === 'asc' ? cmp : -cmp
    })
    return sorted
  }, [tasks, sortKey, sortDir, showDeleted])

  const sortArrow = (key: SortKey) => sortKey === key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''

  // 본인이 등록한 업무이거나 관리자면 삭제 가능
  const canDelete = (t: TaskWithOwner) => t.owner_id === profile.id || profile.is_admin

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
          <button className="primary" onClick={() => setModalOpen(true)}>New Task+</button>
          <button className="ghost" onClick={load}>Refresh</button>
        </div>
      </div>

      {loading && <p className="hint">Loading…</p>}
      {err && <p className="hint err">{err}</p>}

      {!loading && !err && (
        <div className="table-wrap">
          <table className="task-table">
            <thead>
              <tr>
                <th className="col-prio">Priority</th>
                <th>Title</th>
                <th className="sortable" onClick={() => toggleSort('requesting_org')}>Requesting Dept.{sortArrow('requesting_org')}</th>
                <th>Entered By</th>
                <th>Status</th>
                <th className="sortable" onClick={() => toggleSort('due_date')}>Due Date{sortArrow('due_date')}</th>
                <th>Task Date</th>
                <th>Enter Date</th>
                {showDeleted && <th>Deleted By / At</th>}
                {!showDeleted && <th className="col-trash" aria-label="Delete" />}
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 && (
                <tr><td colSpan={9} className="empty">No tasks to show.</td></tr>
              )}
              {visible.map((t) => {
                const ep = effectivePriority(t)
                return (
                <tr key={t.id} className={[prioClass(ep), isOverdue(t) ? 'overdue' : ''].filter(Boolean).join(' ')}>
                  <td className="col-prio"><span className={`prio-dot ${prioClass(ep)}`} title={ep} aria-label={ep} /></td>
                  <td>{t.title}</td>
                  <td>{t.requesting_org || '-'}</td>
                  <td>{t.owner_name}{t.owner_department ? ` (${t.owner_department})` : ''}</td>
                  <td>{t.status}</td>
                  <td>{t.due_date ? formatDueDate(t.due_date) : 'TBD'}</td>
                  <td>{t.task_date || '-'}</td>
                  <td>{formatDueDate(t.created_at)}</td>
                  {showDeleted && <td>{t.deleter_name || '-'} / {t.deleted_at ? new Date(t.deleted_at).toLocaleString() : '-'}</td>}
                  {!showDeleted && (
                    <td className="col-trash">
                      {canDelete(t) && (
                        <button className="icon-btn" title="Delete task" aria-label="Delete task" onClick={() => remove(t)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 5v6m4-6v6" />
                          </svg>
                        </button>
                      )}
                    </td>
                  )}
                </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <TaskFormModal
          userId={profile.id}
          task={null}
          onClose={() => setModalOpen(false)}
          onSaved={load}
        />
      )}
    </div>
  )
}
