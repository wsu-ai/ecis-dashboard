import { useEffect, useMemo, useState } from 'react'
import { fetchAllTasks, softDeleteTask } from '../lib/tasks'
import type { Profile, TaskWithOwner } from '../lib/types'
import { formatRefreshed } from '../lib/format'
import TaskFormModal from '../components/TaskFormModal'
import TaskTable, { isExpired } from '../components/TaskTable'
import TaskCalendar from '../components/TaskCalendar'

type View = 'all' | 'expired' | 'deleted'

export default function Dashboard({ profile }: { profile: Profile }) {
  const [tasks, setTasks] = useState<TaskWithOwner[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [view, setView] = useState<View>('all')
  const [deptFilter, setDeptFilter] = useState('All')
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

  // 데이터에 실제로 등장하는 요청 부처 목록(중복 제거, 정렬)
  const departments = useMemo(() => {
    const set = new Set<string>()
    for (const t of tasks) {
      const d = t.requesting_org?.trim()
      if (d) set.add(d)
    }
    return [...set].sort((a, b) => a.localeCompare(b))
  }, [tasks])

  const visible = useMemo(
    () => tasks.filter((t) => {
      if (view === 'deleted') { if (!t.deleted_at) return false }
      else if (t.deleted_at) return false
      if (view === 'all' && isExpired(t)) return false
      if (view === 'expired' && !isExpired(t)) return false
      if (deptFilter !== 'All' && t.requesting_org?.trim() !== deptFilter) return false
      return true
    }),
    [tasks, view, deptFilter],
  )

  // 달력에는 삭제되지 않은 모든 업무를 표시한다
  const activeTasks = useMemo(() => tasks.filter((t) => !t.deleted_at), [tasks])

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
    <div className="dash dash-layout">
      <aside className="dash-cal">
        <TaskCalendar tasks={activeTasks} onSelectTask={openEdit} />
      </aside>

      <div className="dash-main">
        <div className="dash-toolbar">
          <div className="dash-toolbar-left">
            <div className="dash-tabs">
              <button className={view === 'all' ? 'on' : ''} onClick={() => setView('all')}>Active Tasks</button>
              <button className={view === 'expired' ? 'on' : ''} onClick={() => setView('expired')}>Expired Tasks</button>
              <button className={view === 'deleted' ? 'on' : ''} onClick={() => setView('deleted')}>Deleted Tasks</button>
            </div>
            <label className="dept-filter">
              <span>Show Tasks From:&nbsp;</span>
              <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
                <option value="All">All</option>
                {departments.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </label>
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
            showDeleted={view === 'deleted'}
            hideStatus={view === 'all'}
            hideEnterDate={view === 'all'}
            canModify={canModify}
            onEdit={openEdit}
            onDelete={remove}
            onRefresh={load}
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
    </div>
  )
}
