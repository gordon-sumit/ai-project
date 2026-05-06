import { useState } from 'react'
import type { Task } from '../../types'

interface Props {
  onAdd: (task: Task) => void
  onCancel: () => void
}

export default function TaskForm({ onAdd, onCancel }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onAdd({
      id: crypto.randomUUID(),
      name: name.trim(),
      description: description.trim(),
      dueDate: dueDate || null,
      createdAt: new Date().toISOString(),
      todos: [],
    })
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
      <input
        placeholder="Task name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        style={{ padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db' }}
      />
      <input
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{ padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db' }}
      />
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        style={{ padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db' }}
      />
      <div style={{ display: 'flex', gap: '8px' }}>
        <button type="submit" style={{ padding: '6px 12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Add Task
        </button>
        <button type="button" onClick={onCancel} style={{ padding: '6px 12px', background: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Cancel
        </button>
      </div>
    </form>
  )
}
