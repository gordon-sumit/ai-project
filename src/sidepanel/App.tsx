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
    <div className="font-sans p-3 w-full">
      {error && (
        <div className="flex justify-between items-center bg-red-100 text-red-800 p-2 rounded mb-2">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="bg-transparent border-none cursor-pointer">✕</button>
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
