import { useState } from 'react'
import { createTask, updateTask, type TaskInput } from '../lib/tasks'
import type { Task } from '../lib/types'
import { toDateTimeLocalValue } from '../lib/format'

const pad2 = (n: number) => String(n).padStart(2, '0')
const todayDate = () => {
  const d = new Date()
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

// 새 업무의 기본 마감 일시: 오늘 23:59:59
const defaultDueDate = () => `${todayDate()}T23:59:59`

function newInput(): TaskInput {
  return {
    title: '', description: '', requesting_org: '', requesting_org_id: '',
    submission_method: '', contact_info: '', required_documents: '',
    status: 'Received', priority: 'Medium',
    task_date: todayDate(), due_date: defaultDueDate(),
  }
}

function inputFromTask(t: Task): TaskInput {
  return {
    title: t.title, description: t.description ?? '',
    requesting_org: t.requesting_org ?? '', requesting_org_id: t.requesting_org_id ?? '',
    submission_method: t.submission_method ?? '', contact_info: t.contact_info ?? '',
    required_documents: t.required_documents ?? '',
    status: t.status, priority: t.priority,
    task_date: t.task_date ?? '',
    due_date: t.due_date ? toDateTimeLocalValue(t.due_date) : '',
  }
}

export default function TaskFormModal({
  userId, task, onClose, onSaved,
}: {
  userId: string
  task: Task | null // null = 새 업무 등록, 값이 있으면 수정
  onClose: () => void
  onSaved: () => void | Promise<void>
}) {
  const [input, setInput] = useState<TaskInput>(task ? inputFromTask(task) : newInput())
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!input.title.trim()) return
    setSaving(true)
    try {
      if (task) await updateTask(task.id, input)
      else await createTask(userId, input)
      onClose()
      await onSaved()
    } catch (e: any) {
      alert(e?.message || 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card wide" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{task ? 'Edit Task' : 'New Task'}</h2>

        <label className="field">
          <span>Title *</span>
          <input value={input.title} onChange={(e) => setInput({ ...input, title: e.target.value })} />
        </label>
        <label className="field">
          <span>Description</span>
          <textarea value={input.description} onChange={(e) => setInput({ ...input, description: e.target.value })} rows={3} />
        </label>

        <div className="field-row">
          <label className="field">
            <span>Requesting Department</span>
            <input value={input.requesting_org} onChange={(e) => setInput({ ...input, requesting_org: e.target.value })} />
          </label>
          <label className="field">
            <span>Reference No.</span>
            <input value={input.requesting_org_id} onChange={(e) => setInput({ ...input, requesting_org_id: e.target.value })} placeholder="e.g. Faculty-Affairs-2442" />
          </label>
        </div>

        <label className="field">
          <span>Submission Method</span>
          <input value={input.submission_method} onChange={(e) => setInput({ ...input, submission_method: e.target.value })} placeholder="e.g. Email, online portal upload, etc." />
        </label>
        <label className="field">
          <span>Contact Info</span>
          <input value={input.contact_info} onChange={(e) => setInput({ ...input, contact_info: e.target.value })} placeholder="e.g. contact name, phone, email" />
        </label>
        <label className="field">
          <span>Required Documents</span>
          <input value={input.required_documents} onChange={(e) => setInput({ ...input, required_documents: e.target.value })} placeholder="e.g. employment certificate, consent form" />
        </label>

        <div className="field-row">
          <label className="field">
            <span>Status</span>
            <select value={input.status} onChange={(e) => setInput({ ...input, status: e.target.value as TaskInput['status'] })}>
              <option value="Received">Received</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
            </select>
          </label>
          <label className="field">
            <span>Priority</span>
            <select value={input.priority} onChange={(e) => setInput({ ...input, priority: e.target.value as TaskInput['priority'] })}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </label>
        </div>

        <div className="field-row">
          <label className="field">
            <span>Task Date</span>
            <input type="date" value={input.task_date} onChange={(e) => setInput({ ...input, task_date: e.target.value })} />
          </label>
          <label className="field">
            <span>Due Date &amp; Time</span>
            <input type="datetime-local" step="1" value={input.due_date} onChange={(e) => setInput({ ...input, due_date: e.target.value })} />
          </label>
        </div>

        <div className="modal-actions">
          <button className="ghost" onClick={onClose}>Cancel</button>
          <button className="primary modal-ok" disabled={saving || !input.title.trim()} onClick={save}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
