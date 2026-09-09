import { useMemo } from 'react'
import type { Priority, TaskWithOwner } from '../lib/types'
import { formatDateMDY, formatDueMDY } from '../lib/format'

const WEEK_MS = 7 * 86_400_000
const PRIO_RANK: Record<Priority, number> = { High: 0, Medium: 1, Low: 2 }

function isOverdue(t: TaskWithOwner): boolean {
  return !!t.due_date && new Date(t.due_date).getTime() < Date.now()
    && t.status !== 'Completed' && !t.deleted_at
}

// 마감이 일주일 이내(초과 포함)면 자동으로 High로 격상해서 표시한다. DB 값은 바꾸지 않는다.
export function effectivePriority(t: TaskWithOwner): Priority {
  if (!t.deleted_at && t.status !== 'Completed' && t.due_date
    && new Date(t.due_date).getTime() - Date.now() <= WEEK_MS) {
    return 'High'
  }
  return t.priority
}

const prioClass = (p: Priority) => `prio-${p.toLowerCase()}`

// 마감일까지 남은 일수 (달력 기준). 마감일 없으면 null.
function daysUntilDue(iso: string | null): number | null {
  if (!iso) return null
  const due = new Date(iso); due.setHours(0, 0, 0, 0)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return Math.round((due.getTime() - today.getTime()) / 86_400_000)
}

// 남은 일수 표시: 마감일 없으면 '-', 오늘이면 'Today'
function daysUntilDueLabel(iso: string | null): string {
  const n = daysUntilDue(iso)
  if (n === null) return '-'
  return n === 0 ? 'Today' : String(n)
}

// 정렬: 1) 우선순위 High→Medium→Low, 2) 마감일이 오늘과 가까운 순(마감일 없으면 맨 뒤)
export function sortTasks(rows: TaskWithOwner[]): TaskWithOwner[] {
  return [...rows].sort((a, b) => {
    const pr = PRIO_RANK[effectivePriority(a)] - PRIO_RANK[effectivePriority(b)]
    if (pr !== 0) return pr
    const da = daysUntilDue(a.due_date)
    const db = daysUntilDue(b.due_date)
    if (da === null && db === null) return 0
    if (da === null) return 1
    if (db === null) return -1
    return Math.abs(da) - Math.abs(db)
  })
}

export default function TaskTable({
  rows, showDeleted, canModify, onEdit, onDelete, hideOwner = false,
}: {
  rows: TaskWithOwner[]
  showDeleted: boolean
  canModify: (t: TaskWithOwner) => boolean
  onEdit: (t: TaskWithOwner) => void
  onDelete: (t: TaskWithOwner) => void
  hideOwner?: boolean
}) {
  const sorted = useMemo(() => sortTasks(rows), [rows])
  const colCount = hideOwner ? 9 : 10

  return (
    <div className="table-wrap">
      <table className="task-table">
        <thead>
          <tr>
            <th className="col-prio">Priority</th>
            <th className="col-days" title="Days remaining until the due date">⏳</th>
            <th className="col-title">Task Title</th>
            <th>Requesting Dept.</th>
            {!hideOwner && <th className="col-center">Entered By</th>}
            <th className="col-center">Status</th>
            <th>Due Date</th>
            <th className="col-center">Task Registered Date</th>
            <th>Enter Date</th>
            {showDeleted && <th>Deleted By / At</th>}
            {!showDeleted && <th className="col-actions" aria-label="Actions" />}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 && (
            <tr><td colSpan={colCount} className="empty">No tasks to show.</td></tr>
          )}
          {sorted.map((t) => {
            const ep = effectivePriority(t)
            return (
              <tr key={t.id}
                className={[prioClass(ep), isOverdue(t) ? 'overdue' : ''].filter(Boolean).join(' ')}
                title={t.description || undefined}>
                <td className="col-prio"><span className={`prio-dot ${prioClass(ep)}`} title={ep} aria-label={ep} /></td>
                <td className="col-days">{daysUntilDueLabel(t.due_date)}</td>
                <td className="col-title">{t.title}</td>
                <td>{t.requesting_org || '-'}</td>
                {!hideOwner && (
                  <td className="col-center">{t.owner_name}{t.owner_department ? ` (${t.owner_department})` : ''}</td>
                )}
                <td className="col-center">{t.status}</td>
                <td>{t.due_date ? formatDueMDY(t.due_date) : 'TBD'}</td>
                <td className="col-center">{t.task_date ? formatDateMDY(t.task_date) : '-'}</td>
                <td>{formatDueMDY(t.created_at)}</td>
                {showDeleted && <td>{t.deleter_name || '-'} / {t.deleted_at ? new Date(t.deleted_at).toLocaleString() : '-'}</td>}
                {!showDeleted && (
                  <td className="col-actions">
                    {canModify(t) && (
                      <div className="row-actions">
                        <button className="icon-btn" title="Edit task" aria-label="Edit task" onClick={() => onEdit(t)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                          </svg>
                        </button>
                        <button className="icon-btn" title="Delete task" aria-label="Delete task" onClick={() => onDelete(t)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 5v6m4-6v6" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
