import { useMemo, useState } from 'react'
import type { TaskWithOwner } from '../lib/types'
import { effectivePriority, isExpired } from './TaskTable'
import { koreanHolidayName } from '../lib/holidays'

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const pad = (n: number) => String(n).padStart(2, '0')
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export default function TaskCalendar({
  tasks, onSelectTask,
}: {
  tasks: TaskWithOwner[]
  onSelectTask: (t: TaskWithOwner) => void
}) {
  const today = new Date()
  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() })

  // 마감일(due_date) 기준으로 날짜별 그룹핑
  const byDay = useMemo(() => {
    const map = new Map<string, TaskWithOwner[]>()
    for (const t of tasks) {
      if (!t.due_date) continue
      const key = ymd(new Date(t.due_date))
      const arr = map.get(key)
      if (arr) arr.push(t)
      else map.set(key, [t])
    }
    return map
  }, [tasks])

  // 달력 그리드: 그 달 1일이 속한 주의 일요일부터 6주(42칸)
  const cells = useMemo(() => {
    const first = new Date(view.y, view.m, 1)
    const start = new Date(view.y, view.m, 1 - first.getDay())
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return d
    })
  }, [view])

  const prev = () => setView((v) => (v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 }))
  const next = () => setView((v) => (v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 }))
  const goToday = () => setView({ y: today.getFullYear(), m: today.getMonth() })

  const todayKey = ymd(today)

  return (
    <div className="cal">
      <div className="cal-head">
        <button className="cal-nav" onClick={prev} aria-label="Previous month">‹</button>
        <span className="cal-title">{MONTHS[view.m]} {view.y}</span>
        <button className="cal-nav" onClick={next} aria-label="Next month">›</button>
      </div>
      <button className="cal-today" onClick={goToday}>Jump to today</button>

      <div className="cal-grid cal-dow">
        {WEEKDAYS.map((d) => <div key={d} className="cal-dow-cell">{d}</div>)}
      </div>

      <div className="cal-grid">
        {cells.map((d, i) => {
          const key = ymd(d)
          const inMonth = d.getMonth() === view.m
          const dayTasks = byDay.get(key) ?? []
          const holidayName = koreanHolidayName(key)
          const isWeekend = d.getDay() === 0 || d.getDay() === 6
          const cls = ['cal-cell']
          if (!inMonth) cls.push('cal-out')
          if (isWeekend || holidayName) cls.push('cal-redday')
          if (key === todayKey) cls.push('cal-today-cell')
          return (
            <div key={i} className={cls.join(' ')} title={holidayName ?? undefined}>
              <span className="cal-daynum">{d.getDate()}</span>
              {dayTasks.length > 0 && (
                <div className="cal-dots" title={dayTasks.map((t) => `• ${t.title}`).join('\n')}>
                  {dayTasks.slice(0, 4).map((t) => (
                    <button
                      key={t.id}
                      className={`cal-dot ${isExpired(t) ? 'cal-dot-expired' : `prio-${effectivePriority(t).toLowerCase()}`}`}
                      onClick={() => onSelectTask(t)}
                      aria-label={t.title}
                    />
                  ))}
                  {dayTasks.length > 4 && <span className="cal-more">+{dayTasks.length - 4}</span>}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <p className="cal-note">Tasks are shown on their due date.</p>
    </div>
  )
}
