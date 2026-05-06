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
      status: 'pending',
      createdAt: new Date().toISOString(),
      todos: [],
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-3">
      <input
        placeholder="Task name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="p-1.5 rounded border border-gray-300"
      />
      <input
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="p-1.5 rounded border border-gray-300"
      />
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className="p-1.5 rounded border border-gray-300"
      />
      <div className="flex gap-2">
        <button type="submit" className="px-3 py-1.5 bg-blue-500 text-white border-none rounded cursor-pointer">
          Add Task
        </button>
        <button type="button" onClick={onCancel} className="px-3 py-1.5 bg-gray-200 border-none rounded cursor-pointer">
          Cancel
        </button>
      </div>
    </form>
  )
}
