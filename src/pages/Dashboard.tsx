import { useEffect, useMemo, useState } from 'react'
import { fetchAllTasks } from '../lib/tasks'
import type { Priority, TaskWithOwner } from '../lib/types'
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

export default function Dashboard({ userId }: { userId: string }) {
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
                {showDeleted && <th>Deleted By / At</th>}
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 && (
                <tr><td colSpan={showDeleted ? 7 : 6} className="empty">No tasks to show.</td></tr>
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
                  {showDeleted && <td>{t.deleter_name || '-'} / {t.deleted_at ? new Date(t.deleted_at).toLocaleString() : '-'}</td>}
                </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <TaskFormModal
          userId={userId}
          task={null}
          onClose={() => setModalOpen(false)}
          onSaved={load}
        />
      )}
    </div>
  )
}
