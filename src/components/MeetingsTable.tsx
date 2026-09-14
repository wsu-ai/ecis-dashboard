import { formatDueMDY } from '../lib/format'
import type { TaskWithOwner } from '../lib/types'

// Meetings 탭 전용 표: 제목 / 시간 / 장소만 보여준다 (다른 탭의 전체 컬럼과 다름)
export default function MeetingsTable({
  rows, canModify, onEdit, onDelete,
}: {
  rows: TaskWithOwner[]
  canModify: (t: TaskWithOwner) => boolean
  onEdit: (t: TaskWithOwner) => void
  onDelete: (t: TaskWithOwner) => void
}) {
  const sorted = [...rows].sort((a, b) => {
    const ta = a.due_date ? new Date(a.due_date).getTime() : Infinity
    const tb = b.due_date ? new Date(b.due_date).getTime() : Infinity
    return ta - tb
  })

  return (
    <div className="table-wrap">
      <table className="task-table meetings-table">
        <thead>
          <tr>
            <th className="col-mtitle">Meeting Title</th>
            <th className="col-mtime">Time</th>
            <th>Location</th>
            <th className="col-actions" aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 && (
            <tr><td colSpan={4} className="empty">No meetings to show.</td></tr>
          )}
          {sorted.map((m) => (
            <tr key={m.id} className="meetings-row" onClick={() => onEdit(m)}>
              <td className="col-mtitle">{m.title}</td>
              <td className="col-mtime col-center">{m.due_date ? formatDueMDY(m.due_date) : 'TBD'}</td>
              <td className="col-center">{m.meeting_location || '-'}</td>
              <td className="col-actions">
                <div className="row-actions">
                  <button className="icon-btn" title="Edit meeting" aria-label="Edit meeting"
                    onClick={(e) => { e.stopPropagation(); onEdit(m) }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                    </svg>
                  </button>
                  {canModify(m) && (
                    <button className="icon-btn" title="Delete meeting" aria-label="Delete meeting"
                      onClick={(e) => { e.stopPropagation(); onDelete(m) }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 5v6m4-6v6" />
                      </svg>
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
