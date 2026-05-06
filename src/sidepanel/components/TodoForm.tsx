import { useState } from 'react'
import type { Todo } from '../../types'

interface Props {
  onAdd: (todo: Todo) => void
  onCancel: () => void
}

export default function TodoForm({ onAdd, onCancel }: Props) {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<Todo['priority']>('medium')
  const [dueDate, setDueDate] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onAdd({
      id: crypto.randomUUID(),
      title: title.trim(),
      status: 'pending',
      priority,
      dueDate: dueDate || null,
      createdAt: new Date().toISOString(),
    })
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '8px 0' }}>
      <input
        placeholder="Todo title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        style={{ padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db' }}
      />
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value as Todo['priority'])}
        style={{ padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db' }}
      >
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        style={{ padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db' }}
      />
      <div style={{ display: 'flex', gap: '8px' }}>
        <button type="submit" style={{ padding: '6px 12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Save Todo
        </button>
        <button type="button" onClick={onCancel} style={{ padding: '6px 12px', background: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Cancel
        </button>
      </div>
    </form>
  )
}
