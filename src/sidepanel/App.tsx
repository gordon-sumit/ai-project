import { useState, useEffect } from 'react'
import { getTasks, saveTasks } from '../storage'
import type { Task } from '../types'
import TaskList from './components/TaskList'
import TodoList from './components/TodoList'

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getTasks()
      .then(setTasks)
      .catch(() => setError('Failed to load tasks'))
  }, [])

  async function persistTasks(updated: Task[]) {
    setTasks(updated)
    try {
      await saveTasks(updated)
    } catch {
      setError('Something went wrong, try again')
    }
  }

  const activeTask = tasks.find((t) => t.id === activeTaskId) ?? null

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '12px', width: '100%' }}>
      {error && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '8px', borderRadius: '4px', marginBottom: '8px' }}>
          {error}
          <button onClick={() => setError(null)} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>
      )}
      {activeTask ? (
        <TodoList
          task={activeTask}
          tasks={tasks}
          onBack={() => setActiveTaskId(null)}
          onUpdate={persistTasks}
        />
      ) : (
        <TaskList
          tasks={tasks}
          onSelect={setActiveTaskId}
          onUpdate={persistTasks}
        />
      )}
    </div>
  )
}
