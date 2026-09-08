const pad = (n: number) => String(n).padStart(2, '0')

// ISO 타임스탬프 → "YYYY-MM-DD HH:MM AM" (뷰어의 로컬 시간대 기준)
export function formatDueDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const ampm = d.getHours() < 12 ? 'AM' : 'PM'
  let h = d.getHours() % 12
  if (h === 0) h = 12
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(h)}:${pad(d.getMinutes())} ${ampm}`
}

// ISO 타임스탬프 → <input type="datetime-local"> 이 요구하는 "YYYY-MM-DDTHH:MM" (로컬 시간)
export function toDateTimeLocalValue(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
