import type { TaskWithOwner } from '../lib/types'
import { formatTimeOnly } from '../lib/format'

const pad = (n: number) => String(n).padStart(2, '0')
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export default function TodayMeetings({
  tasks, onSelect,
}: {
  tasks: TaskWithOwner[]
  onSelect: (t: TaskWithOwner) => void
}) {
  const todayKey = ymd(new Date())

  const meetings = tasks
    .filter((t) => t.task_type === 'Meeting' && !t.deleted_at && t.due_date && ymd(new Date(t.due_date)) === todayKey)
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())

  return (
    <div className="today-meetings">
      <h3 className="today-meetings-title">Today's Meetings</h3>
      {meetings.length === 0 ? (
        <p className="hint">No meetings today.</p>
      ) : (
        <table className="today-meetings-table">
          <thead>
            <tr>
              <th className="today-meetings-name">Meeting</th>
              <th>Time</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {meetings.map((m) => (
              <tr key={m.id} onClick={() => onSelect(m)}>
                <td className="today-meetings-name">{m.title}</td>
                <td>{formatTimeOnly(m.due_date!)}</td>
                <td>{m.meeting_location || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
