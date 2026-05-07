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
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 my-2">
      <input
        placeholder="Todo title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="p-1.5 rounded border border-gray-300"
      />
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value as Todo['priority'])}
        className="p-1.5 rounded border border-gray-300"
      >
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className="p-1.5 rounded border border-gray-300"
      />
      <div className="flex gap-2">
        <button type="submit" className="px-3 py-1.5 bg-blue-500 text-white border-none rounded cursor-pointer">
          Save Todo
        </button>
        <button type="button" onClick={onCancel} className="px-3 py-1.5 bg-gray-200 border-none rounded cursor-pointer">
          Cancel
        </button>
      </div>
    </form>
  )
}
