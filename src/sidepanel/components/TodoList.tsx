import { useState } from 'react'
import type { Task, Todo } from '../../types'
import TodoItem from './TodoItem'
import TodoForm from './TodoForm'

type Filter = 'all' | 'pending' | 'complete'
type SortKey = 'dueDate' | 'priority'

const PRIORITY_ORDER: Record<Todo['priority'], number> = { high: 0, medium: 1, low: 2 }

function applyFilterSort(todos: Todo[], filter: Filter, sort: SortKey): Todo[] {
  const filtered = filter === 'all' ? todos : todos.filter((t) => t.status === filter)
  return [...filtered].sort((a, b) => {
    if (sort === 'priority') return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
    if (!a.dueDate && !b.dueDate) return 0
    if (!a.dueDate) return 1
    if (!b.dueDate) return -1
    return a.dueDate.localeCompare(b.dueDate)
  })
}

interface Props {
  task: Task
  tasks: Task[]
  onBack: () => void
  onUpdate: (tasks: Task[]) => void
}

export default function TodoList({ task, tasks, onBack, onUpdate }: Props) {
  const [filter, setFilter] = useState<Filter>('all')
  const [sort, setSort] = useState<SortKey>('dueDate')
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState(false)
  const [name, setName] = useState(task.name)
  const [description, setDescription] = useState(task.description)
  const [dueDate, setDueDate] = useState(task.dueDate ?? '')

  function updateTask(patch: Partial<Task>) {
    onUpdate(tasks.map((t) => t.id === task.id ? { ...t, ...patch } : t))
  }

  function addTodo(todo: Todo) {
    updateTask({ todos: [...task.todos, todo] })
    setShowForm(false)
  }

  function toggleTodo(id: string) {
    updateTask({
      todos: task.todos.map((t) =>
        t.id === id ? { ...t, status: t.status === 'pending' ? 'complete' : 'pending' } : t
      ),
    })
  }

  function deleteTodo(id: string) {
    updateTask({ todos: task.todos.filter((t) => t.id !== id) })
  }

  function editTodo(id: string, patch: Pick<Todo, 'title' | 'priority' | 'dueDate'>) {
    updateTask({ todos: task.todos.map((t) => t.id === id ? { ...t, ...patch } : t) })
  }

  function saveTaskEdits() {
    updateTask({ name, description, dueDate: dueDate || null })
    setEditingTask(false)
  }

  const visible = applyFilterSort(task.todos, filter, sort)

  return (
    <div>
      <button onClick={onBack} className="bg-transparent border-none cursor-pointer text-blue-500 mb-2 p-0">
        ← Back
      </button>

      {editingTask ? (
        <div className="flex flex-col gap-1.5 mb-3">
          <input value={name} onChange={(e) => setName(e.target.value)} className="p-1.5 rounded border border-gray-300 font-semibold" />
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="p-1.5 rounded border border-gray-300" />
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="p-1.5 rounded border border-gray-300" />
          <div className="flex gap-2">
            <button onClick={saveTaskEdits} className="px-2.5 py-1 bg-blue-500 text-white border-none rounded cursor-pointer">Save</button>
            <button onClick={() => setEditingTask(false)} className="px-2.5 py-1 bg-gray-200 border-none rounded cursor-pointer">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="mb-3 cursor-pointer" onClick={() => setEditingTask(true)}>
          <h2 className="m-0 mb-1 text-lg">{task.name}</h2>
          {task.description && <p className="m-0 mb-1 text-gray-600 text-[13px]">{task.description}</p>}
          {task.dueDate && <p className="m-0 text-xs text-gray-500">Due: {task.dueDate}</p>}
        </div>
      )}

      <div className="flex gap-1.5 mb-2 flex-wrap">
        {(['all', 'pending', 'complete'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-2.5 py-1 border border-gray-300 rounded-full cursor-pointer capitalize ${
              filter === f ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'
            }`}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="ml-auto px-2 py-1 rounded border border-gray-300 text-xs">
          <option value="dueDate">Sort: Due Date</option>
          <option value="priority">Sort: Priority</option>
        </select>
      </div>

      {!showForm && (
        <button onClick={() => setShowForm(true)} className="px-3 py-1.5 bg-emerald-500 text-white border-none rounded cursor-pointer mb-2">
          Add Todo
        </button>
      )}

      {showForm && <TodoForm onAdd={addTodo} onCancel={() => setShowForm(false)} />}

      {visible.length === 0 && !showForm && (
        <p className="text-gray-500 text-center mt-6">No todos yet — add one!</p>
      )}

      {visible.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onToggle={toggleTodo} onDelete={deleteTodo} onEdit={editTodo} />
      ))}
    </div>
  )
}
