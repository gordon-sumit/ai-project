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

  function saveTaskEdits() {
    updateTask({ name, description, dueDate: dueDate || null })
    setEditingTask(false)
  }

  const visible = applyFilterSort(task.todos, filter, sort)

  return (
    <div>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', marginBottom: '8px', padding: 0 }}>
        ← Back
      </button>

      {editingTask ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
          <input value={name} onChange={(e) => setName(e.target.value)} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db', fontWeight: 600 }} />
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" style={{ padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db' }} />
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db' }} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={saveTaskEdits} style={{ padding: '4px 10px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
            <button onClick={() => setEditingTask(false)} style={{ padding: '4px 10px', background: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: '12px', cursor: 'pointer' }} onClick={() => setEditingTask(true)}>
          <h2 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>{task.name}</h2>
          {task.description && <p style={{ margin: '0 0 4px 0', color: '#4b5563', fontSize: '13px' }}>{task.description}</p>}
          {task.dueDate && <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Due: {task.dueDate}</p>}
        </div>
      )}

      <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
        {(['all', 'pending', 'complete'] as Filter[]).map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '4px 10px', border: '1px solid #d1d5db', borderRadius: '9999px', background: filter === f ? '#3b82f6' : '#fff', color: filter === f ? '#fff' : '#374151', cursor: 'pointer', textTransform: 'capitalize' }}>
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} style={{ marginLeft: 'auto', padding: '4px 8px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '12px' }}>
          <option value="dueDate">Sort: Due Date</option>
          <option value="priority">Sort: Priority</option>
        </select>
      </div>

      {!showForm && (
        <button onClick={() => setShowForm(true)} style={{ padding: '6px 12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '8px' }}>
          Add Todo
        </button>
      )}

      {showForm && <TodoForm onAdd={addTodo} onCancel={() => setShowForm(false)} />}

      {visible.length === 0 && !showForm && (
        <p style={{ color: '#6b7280', textAlign: 'center', marginTop: '24px' }}>No todos yet — add one!</p>
      )}

      {visible.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onToggle={toggleTodo} onDelete={deleteTodo} />
      ))}
    </div>
  )
}
