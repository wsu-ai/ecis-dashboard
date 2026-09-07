import { useEffect, useMemo, useState } from 'react'
import { fetchAllTasks } from '../lib/tasks'
import type { TaskWithOwner } from '../lib/types'

type SortKey = 'requesting_org' | 'due_date'
type SortDir = 'asc' | 'desc'

const todayStr = () => new Date().toISOString().slice(0, 10)

function isOverdue(t: TaskWithOwner): boolean {
  return !!t.due_date && t.due_date < todayStr() && t.status !== '완료' && !t.deleted_at
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<TaskWithOwner[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('due_date')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [showDeleted, setShowDeleted] = useState(false)

  async function load() {
    setLoading(true); setErr('')
    try {
      setTasks(await fetchAllTasks())
    } catch (e: any) {
      setErr(e?.message || '업무 목록을 불러오지 못했습니다.')
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
          <button className={!showDeleted ? 'on' : ''} onClick={() => setShowDeleted(false)}>전체 업무</button>
          <button className={showDeleted ? 'on' : ''} onClick={() => setShowDeleted(true)}>삭제된 업무</button>
        </div>
        <button className="ghost" onClick={load}>새로고침</button>
      </div>

      {loading && <p className="hint">불러오는 중…</p>}
      {err && <p className="hint err">{err}</p>}

      {!loading && !err && (
        <div className="table-wrap">
          <table className="task-table">
            <thead>
              <tr>
                <th>제목</th>
                <th className="sortable" onClick={() => toggleSort('requesting_org')}>요청 부서{sortArrow('requesting_org')}</th>
                <th>담당자</th>
                <th>상태</th>
                <th className="sortable" onClick={() => toggleSort('due_date')}>마감일{sortArrow('due_date')}</th>
                {showDeleted && <th>삭제자 / 삭제일시</th>}
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 && (
                <tr><td colSpan={showDeleted ? 6 : 5} className="empty">표시할 업무가 없습니다.</td></tr>
              )}
              {visible.map((t) => (
                <tr key={t.id} className={isOverdue(t) ? 'overdue' : ''}>
                  <td>{t.title}</td>
                  <td>{t.requesting_org || '-'}</td>
                  <td>{t.owner_name}{t.owner_department ? ` (${t.owner_department})` : ''}</td>
                  <td>{t.status}</td>
                  <td>{t.due_date || '미정'}</td>
                  {showDeleted && <td>{t.deleter_name || '-'} / {t.deleted_at ? new Date(t.deleted_at).toLocaleString() : '-'}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
