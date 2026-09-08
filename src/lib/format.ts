const pad = (n: number) => String(n).padStart(2, '0')

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

// Date → "September 8, 2026 02:30 PM"
export function formatRefreshed(d: Date): string {
  if (Number.isNaN(d.getTime())) return ''
  const ampm = d.getHours() < 12 ? 'AM' : 'PM'
  let h = d.getHours() % 12
  if (h === 0) h = 12
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} ${pad(h)}:${pad(d.getMinutes())} ${ampm}`
}

// "YYYY-MM-DD" → "MM/DD/YYYY" (문자열 그대로 재배열 — 시간대 영향 없음)
export function formatDateMDY(ymd: string): string {
  const m = ymd.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return ymd
  const [, y, mo, d] = m
  return `${mo}/${d}/${y}`
}

// ISO 타임스탬프 → "YYYY-MM-DD HH:MM AM" (뷰어의 로컬 시간대 기준)
export function formatDueDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const ampm = d.getHours() < 12 ? 'AM' : 'PM'
  let h = d.getHours() % 12
  if (h === 0) h = 12
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(h)}:${pad(d.getMinutes())} ${ampm}`
}
