import { useState } from 'react'
import type { Todo } from '../../types'

const PRIORITY_CLASS: Record<Todo['priority'], string> = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-amber-800',
  low: 'bg-gray-100 text-gray-700',
}

interface Props {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (id: string, patch: Pick<Todo, 'title' | 'priority' | 'dueDate'>) => void
}

export default function TodoItem({ todo, onToggle, onDelete, onEdit }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(todo.title)
  const [priority, setPriority] = useState(todo.priority)
  const [dueDate, setDueDate] = useState(todo.dueDate ?? '')

  function handleSave() {
    if (!title.trim()) return
    onEdit(todo.id, { title: title.trim(), priority, dueDate: dueDate || null })
    setIsEditing(false)
  }

  function handleCancel() {
    setTitle(todo.title)
    setPriority(todo.priority)
    setDueDate(todo.dueDate ?? '')
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="flex flex-col gap-1.5 py-2 border-b border-gray-100">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="edit todo title"
          className="p-1.5 rounded border border-gray-300"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Todo['priority'])}
          aria-label="edit todo priority"
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
          aria-label="edit todo due date"
          className="p-1.5 rounded border border-gray-300"
        />
        <div className="flex gap-2">
          <button onClick={handleSave} className="px-2.5 py-1 bg-blue-500 text-white border-none rounded cursor-pointer">
            Save
          </button>
          <button onClick={handleCancel} className="px-2.5 py-1 bg-gray-200 border-none rounded cursor-pointer">
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 py-2 border-b border-gray-100">
      <input
        type="checkbox"
        checked={todo.status === 'complete'}
        onChange={() => onToggle(todo.id)}
      />
      <span className={`flex-1 ${todo.status === 'complete' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
        {todo.title}
      </span>
      <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${PRIORITY_CLASS[todo.priority]}`}>
        {todo.priority}
      </span>
      {todo.dueDate && (
        <span className="text-[11px] text-gray-500">Due: {todo.dueDate}</span>
      )}
      <button
        aria-label="edit todo"
        onClick={() => setIsEditing(true)}
        className="bg-transparent border-none cursor-pointer text-blue-500"
      >
        ✎
      </button>
      <button
        aria-label="delete todo"
        onClick={() => onDelete(todo.id)}
        className="bg-transparent border-none cursor-pointer text-red-500"
      >
        ✕
      </button>
    </div>
  )
}
