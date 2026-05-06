import { useState } from 'react'
import type { Task } from '../../types'
import TaskForm from './TaskForm'

interface Props {
  tasks: Task[]
  onSelect: (id: string) => void
  onUpdate: (tasks: Task[]) => void
}

export default function TaskList({ tasks, onSelect, onUpdate }: Props) {
  const [showForm, setShowForm] = useState(false)

  function addTask(task: Task) {
    onUpdate([...tasks, task])
    setShowForm(false)
  }

  function deleteTask(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    onUpdate(tasks.filter((t) => t.id !== id))
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h2 style={{ margin: 0, fontSize: '18px' }}>My Tasks</h2>
        {!showForm && (
          <button onClick={() => setShowForm(true)} style={{ padding: '6px 12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            New Task
          </button>
        )}
      </div>

      {showForm && <TaskForm onAdd={addTask} onCancel={() => setShowForm(false)} />}

      {tasks.length === 0 && !showForm && (
        <p style={{ color: '#6b7280', textAlign: 'center', marginTop: '32px' }}>No tasks yet — create one!</p>
      )}

      {tasks.map((task) => {
        const completed = task.todos.filter((t) => t.status === 'complete').length
        return (
          <div
            key={task.id}
            onClick={() => onSelect(task.id)}
            style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '12px', marginBottom: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
          >
            <div>
              <div style={{ fontWeight: 600 }}>{task.name}</div>
              {task.dueDate && <div style={{ fontSize: '12px', color: '#6b7280' }}>Due: {task.dueDate}</div>}
              <div style={{ fontSize: '12px', color: '#6b7280' }}>{completed}/{task.todos.length} complete</div>
            </div>
            <button
              aria-label="delete"
              onClick={(e) => deleteTask(task.id, e)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '16px' }}
            >
              ✕
            </button>
          </div>
        )
      })}
    </div>
  )
}
