import { useState } from 'react'
import type { Task } from '../../types'
import TaskForm from './TaskForm'

interface Props {
  tasks: Task[]
  onSelect: (id: string) => void
  onUpdate: (tasks: Task[]) => void
}

interface EditState {
  id: string
  name: string
  description: string
  dueDate: string
}

export default function TaskList({ tasks, onSelect, onUpdate }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editState, setEditState] = useState<EditState | null>(null)

  const pendingCount = tasks.filter((t) => t.status === 'pending').length
  const completeCount = tasks.filter((t) => t.status === 'complete').length

  function addTask(task: Task) {
    onUpdate([...tasks, task])
    setShowForm(false)
  }

  function deleteTask(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    onUpdate(tasks.filter((t) => t.id !== id))
  }

  function toggleStatus(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    onUpdate(tasks.map((t) =>
      t.id === id ? { ...t, status: t.status === 'pending' ? 'complete' : 'pending' } : t
    ))
  }

  function startEdit(task: Task, e: React.MouseEvent) {
    e.stopPropagation()
    setEditState({ id: task.id, name: task.name, description: task.description, dueDate: task.dueDate ?? '' })
  }

  function saveEdit(e: React.MouseEvent) {
    e.stopPropagation()
    if (!editState || !editState.name.trim()) return
    onUpdate(tasks.map((t) =>
      t.id === editState.id
        ? { ...t, name: editState.name.trim(), description: editState.description.trim(), dueDate: editState.dueDate || null }
        : t
    ))
    setEditState(null)
  }

  function cancelEdit(e: React.MouseEvent) {
    e.stopPropagation()
    setEditState(null)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <h2 className="m-0 text-lg">My Tasks</h2>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="px-3 py-1.5 bg-blue-500 text-white border-none rounded cursor-pointer">
            New Task
          </button>
        )}
      </div>

      {tasks.length > 0 && (
        <p className="m-0 mb-3 text-xs text-gray-500">{pendingCount} pending · {completeCount} complete</p>
      )}

      {showForm && <TaskForm onAdd={addTask} onCancel={() => setShowForm(false)} />}

      {tasks.length === 0 && !showForm && (
        <p className="text-gray-500 text-center mt-8">No tasks yet — create one!</p>
      )}

      {tasks.map((task) => {
        const completed = task.todos.filter((t) => t.status === 'complete').length
        const isEditing = editState?.id === task.id

        if (isEditing) {
          return (
            <div key={task.id} className="border border-gray-200 rounded-md p-3 mb-2 flex flex-col gap-1.5">
              <input
                value={editState!.name}
                onChange={(e) => setEditState({ ...editState!, name: e.target.value })}
                aria-label="edit task name"
                className="p-1.5 rounded border border-gray-300 font-semibold"
              />
              <input
                value={editState!.description}
                onChange={(e) => setEditState({ ...editState!, description: e.target.value })}
                placeholder="Description (optional)"
                aria-label="edit task description"
                className="p-1.5 rounded border border-gray-300"
              />
              <input
                type="date"
                value={editState!.dueDate}
                onChange={(e) => setEditState({ ...editState!, dueDate: e.target.value })}
                aria-label="edit task due date"
                className="p-1.5 rounded border border-gray-300"
              />
              <div className="flex gap-2">
                <button onClick={saveEdit} className="px-2.5 py-1 bg-blue-500 text-white border-none rounded cursor-pointer">Save</button>
                <button onClick={cancelEdit} className="px-2.5 py-1 bg-gray-200 border-none rounded cursor-pointer">Cancel</button>
              </div>
            </div>
          )
        }

        return (
          <div
            key={task.id}
            onClick={() => onSelect(task.id)}
            className={`border border-gray-200 rounded-md p-3 mb-2 cursor-pointer flex justify-between items-start ${task.status === 'complete' ? 'opacity-50' : ''}`}
          >
            <div className='flex gap-2'>
              <button
                aria-label="toggle status"
                onClick={(e) => toggleStatus(task.id, e)}
                className={`mt-0.5 shrink-0 w-4 h-4 rounded border flex items-center justify-center text-[10px] cursor-pointer ${
                  task.status === 'complete' ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-400'
                }`}
              >
                {task.status === 'complete' ? '✓' : ''}
              </button>
              <div>
                <div><span className={`font-semibold ${task.status === 'complete' ? 'line-through' : ''}`}>{task.name}</span></div>
                {task.dueDate && <div className="text-xs text-gray-500">Due: {task.dueDate}</div>}
                <div className="text-xs text-gray-500">{completed}/{task.todos.length} complete</div>
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              <button
                aria-label="edit task"
                onClick={(e) => startEdit(task, e)}
                className="bg-transparent border-none cursor-pointer text-blue-500"
              >
                ✎
              </button>
              <button
                aria-label="delete"
                onClick={(e) => deleteTask(task.id, e)}
                className="bg-transparent border-none cursor-pointer text-red-500 text-base"
              >
                ✕
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
