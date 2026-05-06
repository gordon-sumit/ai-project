# Chrome Extension Task & TODO Manager — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Chrome MV3 side-panel extension where users manage tasks (name, description, due date) and nested todos (title, status, priority, due date) with filter and sort, persisted to `chrome.storage.local`.

**Architecture:** React + TypeScript rendered in a Chrome side panel. All state lives in React; mutations are persisted immediately via `chrome.storage.local`. Two views (Task List, Task Detail) are toggled by a single `activeTaskId` state flag in `App.tsx` — no router.

**Tech Stack:** Vite 5, React 18, TypeScript 5, Vitest, React Testing Library, chrome.storage.local (mocked in tests via global setup)

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `manifest.json`
- Create: `src/sidepanel/index.html`
- Create: `src/sidepanel/main.tsx`
- Create: `public/icons/icon16.png` (placeholder)
- Create: `public/icons/icon48.png` (placeholder)
- Create: `public/icons/icon128.png` (placeholder)

**Step 1: Initialise the npm project**

```bash
cd /Users/gordonsumit/Documents/projects/ai-project
npm init -y
```

**Step 2: Install dependencies**

```bash
npm install react react-dom
npm install -D vite @vitejs/plugin-react typescript \
  @types/react @types/react-dom @types/chrome \
  vitest @vitest/coverage-v8 jsdom \
  @testing-library/react @testing-library/jest-dom \
  @testing-library/user-event
```

**Step 3: Write `vite.config.ts`**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        sidepanel: resolve(__dirname, 'src/sidepanel/index.html'),
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    globals: true,
  },
})
```

**Step 4: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

**Step 5: Write `manifest.json`**

```json
{
  "manifest_version": 3,
  "name": "Task & TODO Manager",
  "version": "1.0.0",
  "description": "Manage tasks and todos in a side panel",
  "permissions": ["storage", "sidePanel"],
  "side_panel": {
    "default_path": "src/sidepanel/index.html"
  },
  "action": {
    "default_title": "Open Task Manager"
  },
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

**Step 6: Write `src/sidepanel/index.html`**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Task Manager</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/sidepanel/main.tsx"></script>
  </body>
</html>
```

**Step 7: Write `src/sidepanel/main.tsx`**

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

**Step 8: Write `src/test-setup.ts`** (chrome global mock for all tests)

```typescript
import '@testing-library/jest-dom'

const store: Record<string, unknown> = {}

global.chrome = {
  storage: {
    local: {
      get: (keys: string[], cb: (result: Record<string, unknown>) => void) => {
        const result: Record<string, unknown> = {}
        keys.forEach((k) => { if (k in store) result[k] = store[k] })
        cb(result)
      },
      set: (items: Record<string, unknown>, cb?: () => void) => {
        Object.assign(store, items)
        cb?.()
      },
    },
  },
} as unknown as typeof chrome
```

**Step 9: Add scripts to `package.json`**

Add these to the `scripts` field:
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "test": "vitest run",
  "test:watch": "vitest",
  "coverage": "vitest run --coverage"
}
```

**Step 10: Verify Vite starts**

```bash
npm run dev
```

Expected: Vite dev server starts on `http://localhost:5173` with no errors.

**Step 11: Commit**

```bash
git add .
git commit -m "feat: scaffold Vite + React + TypeScript Chrome extension"
```

---

## Task 2: Types & Storage Layer

**Files:**
- Create: `src/types.ts`
- Create: `src/storage.ts`
- Create: `src/storage.test.ts`

**Step 1: Write `src/types.ts`**

```typescript
export interface Todo {
  id: string
  title: string
  status: 'pending' | 'complete'
  priority: 'high' | 'medium' | 'low'
  dueDate: string | null
  createdAt: string
}

export interface Task {
  id: string
  name: string
  description: string
  dueDate: string | null
  createdAt: string
  todos: Todo[]
}
```

**Step 2: Write failing tests in `src/storage.test.ts`**

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { getTasks, saveTasks } from './storage'
import type { Task } from './types'

const sampleTask: Task = {
  id: '1',
  name: 'Test Task',
  description: 'desc',
  dueDate: '2026-06-01',
  createdAt: '2026-05-06T00:00:00.000Z',
  todos: [],
}

beforeEach(() => {
  // reset store between tests by saving empty array
})

describe('getTasks', () => {
  it('returns empty array when nothing stored', async () => {
    const tasks = await getTasks()
    expect(tasks).toEqual([])
  })
})

describe('saveTasks + getTasks', () => {
  it('persists and retrieves tasks', async () => {
    await saveTasks([sampleTask])
    const tasks = await getTasks()
    expect(tasks).toEqual([sampleTask])
  })
})
```

**Step 3: Run test to confirm it fails**

```bash
npm test
```

Expected: FAIL — `getTasks` and `saveTasks` not defined.

**Step 4: Write `src/storage.ts`**

```typescript
import type { Task } from './types'

const STORAGE_KEY = 'tasks'

export function getTasks(): Promise<Task[]> {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      resolve((result[STORAGE_KEY] as Task[]) ?? [])
    })
  })
}

export function saveTasks(tasks: Task[]): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEY]: tasks }, resolve)
  })
}
```

**Step 5: Run tests to confirm they pass**

```bash
npm test
```

Expected: PASS — 2 tests pass.

**Step 6: Commit**

```bash
git add src/types.ts src/storage.ts src/storage.test.ts
git commit -m "feat: add types and chrome.storage.local helpers"
```

---

## Task 3: App Shell & Data Loading

**Files:**
- Create: `src/sidepanel/App.tsx`
- Create: `src/sidepanel/App.test.tsx`

**Step 1: Write failing test in `src/sidepanel/App.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from './App'
import * as storage from '../storage'

describe('App', () => {
  it('renders task list view by default', async () => {
    vi.spyOn(storage, 'getTasks').mockResolvedValue([])
    render(<App />)
    expect(await screen.findByText('My Tasks')).toBeInTheDocument()
  })
})
```

**Step 2: Run test to confirm it fails**

```bash
npm test
```

Expected: FAIL — `App` not defined.

**Step 3: Write `src/sidepanel/App.tsx`**

```tsx
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
```

**Step 4: Create stub components so App compiles (fill in Task 4 & 5)**

Create `src/sidepanel/components/TaskList.tsx`:
```tsx
import type { Task } from '../../types'
export default function TaskList(_: { tasks: Task[]; onSelect: (id: string) => void; onUpdate: (t: Task[]) => void }) {
  return <div>My Tasks</div>
}
```

Create `src/sidepanel/components/TodoList.tsx`:
```tsx
import type { Task } from '../../types'
export default function TodoList(_: { task: Task; tasks: Task[]; onBack: () => void; onUpdate: (t: Task[]) => void }) {
  return <div>Todos</div>
}
```

**Step 5: Run tests to confirm they pass**

```bash
npm test
```

Expected: PASS.

**Step 6: Commit**

```bash
git add src/sidepanel/App.tsx src/sidepanel/App.test.tsx src/sidepanel/components/TaskList.tsx src/sidepanel/components/TodoList.tsx
git commit -m "feat: add App shell with data loading and view switching"
```

---

## Task 4: TaskList & TaskForm Components

**Files:**
- Modify: `src/sidepanel/components/TaskList.tsx`
- Create: `src/sidepanel/components/TaskForm.tsx`
- Create: `src/sidepanel/components/TaskList.test.tsx`

**Step 1: Write failing tests in `src/sidepanel/components/TaskList.test.tsx`**

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import TaskList from './TaskList'
import type { Task } from '../../types'

const task: Task = {
  id: '1', name: 'My Task', description: 'desc', dueDate: '2026-06-01',
  createdAt: '2026-05-06T00:00:00.000Z', todos: [
    { id: 't1', title: 'todo', status: 'complete', priority: 'high', dueDate: null, createdAt: '' },
    { id: 't2', title: 'todo2', status: 'pending', priority: 'low', dueDate: null, createdAt: '' },
  ]
}

describe('TaskList', () => {
  it('shows empty state when no tasks', () => {
    render(<TaskList tasks={[]} onSelect={vi.fn()} onUpdate={vi.fn()} />)
    expect(screen.getByText('No tasks yet — create one!')).toBeInTheDocument()
  })

  it('renders task name and progress', () => {
    render(<TaskList tasks={[task]} onSelect={vi.fn()} onUpdate={vi.fn()} />)
    expect(screen.getByText('My Task')).toBeInTheDocument()
    expect(screen.getByText('1/2 complete')).toBeInTheDocument()
  })

  it('calls onSelect when task card is clicked', () => {
    const onSelect = vi.fn()
    render(<TaskList tasks={[task]} onSelect={onSelect} onUpdate={vi.fn()} />)
    fireEvent.click(screen.getByText('My Task'))
    expect(onSelect).toHaveBeenCalledWith('1')
  })

  it('adds a new task via the form', async () => {
    const onUpdate = vi.fn()
    render(<TaskList tasks={[]} onSelect={vi.fn()} onUpdate={onUpdate} />)
    fireEvent.click(screen.getByText('New Task'))
    fireEvent.change(screen.getByPlaceholderText('Task name'), { target: { value: 'Buy groceries' } })
    fireEvent.click(screen.getByText('Add Task'))
    expect(onUpdate).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ name: 'Buy groceries' })])
    )
  })

  it('deletes a task', () => {
    const onUpdate = vi.fn()
    render(<TaskList tasks={[task]} onSelect={vi.fn()} onUpdate={onUpdate} />)
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))
    expect(onUpdate).toHaveBeenCalledWith([])
  })
})
```

**Step 2: Run to confirm failures**

```bash
npm test
```

Expected: Multiple FAIL — components not yet implemented.

**Step 3: Write `src/sidepanel/components/TaskForm.tsx`**

```tsx
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
```

**Step 4: Write full `src/sidepanel/components/TaskList.tsx`**

```tsx
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
```

**Step 5: Run tests to confirm they pass**

```bash
npm test
```

Expected: PASS — all 5 TaskList tests pass.

**Step 6: Commit**

```bash
git add src/sidepanel/components/TaskList.tsx src/sidepanel/components/TaskForm.tsx src/sidepanel/components/TaskList.test.tsx
git commit -m "feat: implement TaskList and TaskForm components"
```

---

## Task 5: TodoItem Component

**Files:**
- Create: `src/sidepanel/components/TodoItem.tsx`
- Create: `src/sidepanel/components/TodoItem.test.tsx`

**Step 1: Write failing tests in `src/sidepanel/components/TodoItem.test.tsx`**

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import TodoItem from './TodoItem'
import type { Todo } from '../../types'

const pending: Todo = { id: '1', title: 'Write tests', status: 'pending', priority: 'high', dueDate: '2026-06-01', createdAt: '' }
const complete: Todo = { ...pending, id: '2', status: 'complete' }

describe('TodoItem', () => {
  it('renders title and priority badge', () => {
    render(<TodoItem todo={pending} onToggle={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Write tests')).toBeInTheDocument()
    expect(screen.getByText('high')).toBeInTheDocument()
  })

  it('strikes through title when complete', () => {
    render(<TodoItem todo={complete} onToggle={vi.fn()} onDelete={vi.fn()} />)
    const title = screen.getByText('Write tests')
    expect(title).toHaveStyle('text-decoration: line-through')
  })

  it('calls onToggle when checkbox clicked', () => {
    const onToggle = vi.fn()
    render(<TodoItem todo={pending} onToggle={onToggle} onDelete={vi.fn()} />)
    fireEvent.click(screen.getByRole('checkbox'))
    expect(onToggle).toHaveBeenCalledWith('1')
  })

  it('calls onDelete when delete button clicked', () => {
    const onDelete = vi.fn()
    render(<TodoItem todo={pending} onToggle={vi.fn()} onDelete={onDelete} />)
    fireEvent.click(screen.getByRole('button', { name: /delete todo/i }))
    expect(onDelete).toHaveBeenCalledWith('1')
  })

  it('shows due date when set', () => {
    render(<TodoItem todo={pending} onToggle={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Due: 2026-06-01')).toBeInTheDocument()
  })
})
```

**Step 2: Run to confirm failures**

```bash
npm test
```

Expected: FAIL — `TodoItem` not defined.

**Step 3: Write `src/sidepanel/components/TodoItem.tsx`**

```tsx
import type { Todo } from '../../types'

const PRIORITY_STYLE: Record<Todo['priority'], React.CSSProperties> = {
  high: { background: '#fee2e2', color: '#991b1b' },
  medium: { background: '#fef9c3', color: '#92400e' },
  low: { background: '#f3f4f6', color: '#374151' },
}

interface Props {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export default function TodoItem({ todo, onToggle, onDelete }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
      <input
        type="checkbox"
        checked={todo.status === 'complete'}
        onChange={() => onToggle(todo.id)}
      />
      <span style={{
        flex: 1,
        textDecoration: todo.status === 'complete' ? 'line-through' : 'none',
        color: todo.status === 'complete' ? '#9ca3af' : '#111827',
      }}>
        {todo.title}
      </span>
      <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '9999px', ...PRIORITY_STYLE[todo.priority] }}>
        {todo.priority}
      </span>
      {todo.dueDate && (
        <span style={{ fontSize: '11px', color: '#6b7280' }}>Due: {todo.dueDate}</span>
      )}
      <button
        aria-label="delete todo"
        onClick={() => onDelete(todo.id)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
      >
        ✕
      </button>
    </div>
  )
}
```

**Step 4: Run tests to confirm they pass**

```bash
npm test
```

Expected: PASS — all 5 TodoItem tests pass.

**Step 5: Commit**

```bash
git add src/sidepanel/components/TodoItem.tsx src/sidepanel/components/TodoItem.test.tsx
git commit -m "feat: implement TodoItem with priority badge and toggle"
```

---

## Task 6: TodoList, TodoForm & Filter/Sort

**Files:**
- Modify: `src/sidepanel/components/TodoList.tsx`
- Create: `src/sidepanel/components/TodoForm.tsx`
- Create: `src/sidepanel/components/TodoList.test.tsx`

**Step 1: Write failing tests in `src/sidepanel/components/TodoList.test.tsx`**

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import TodoList from './TodoList'
import type { Task, Todo } from '../../types'

const todo1: Todo = { id: 't1', title: 'Alpha', status: 'pending', priority: 'high', dueDate: '2026-06-01', createdAt: '' }
const todo2: Todo = { id: 't2', title: 'Beta', status: 'complete', priority: 'low', dueDate: '2026-05-01', createdAt: '' }
const task: Task = { id: '1', name: 'My Task', description: 'desc', dueDate: null, createdAt: '', todos: [todo1, todo2] }
const allTasks = [task]

describe('TodoList', () => {
  it('shows back button and task name', () => {
    render(<TodoList task={task} tasks={allTasks} onBack={vi.fn()} onUpdate={vi.fn()} />)
    expect(screen.getByText('← Back')).toBeInTheDocument()
    expect(screen.getByText('My Task')).toBeInTheDocument()
  })

  it('calls onBack when back button clicked', () => {
    const onBack = vi.fn()
    render(<TodoList task={task} tasks={allTasks} onBack={onBack} onUpdate={vi.fn()} />)
    fireEvent.click(screen.getByText('← Back'))
    expect(onBack).toHaveBeenCalled()
  })

  it('shows empty state when no todos', () => {
    const emptyTask = { ...task, todos: [] }
    render(<TodoList task={emptyTask} tasks={[emptyTask]} onBack={vi.fn()} onUpdate={vi.fn()} />)
    expect(screen.getByText('No todos yet — add one!')).toBeInTheDocument()
  })

  it('filters todos by pending status', () => {
    render(<TodoList task={task} tasks={allTasks} onBack={vi.fn()} onUpdate={vi.fn()} />)
    fireEvent.click(screen.getByText('Pending'))
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.queryByText('Beta')).not.toBeInTheDocument()
  })

  it('filters todos by complete status', () => {
    render(<TodoList task={task} tasks={allTasks} onBack={vi.fn()} onUpdate={vi.fn()} />)
    fireEvent.click(screen.getByText('Complete'))
    expect(screen.getByText('Beta')).toBeInTheDocument()
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument()
  })

  it('adds a new todo via form', () => {
    const onUpdate = vi.fn()
    render(<TodoList task={task} tasks={allTasks} onBack={vi.fn()} onUpdate={onUpdate} />)
    fireEvent.click(screen.getByText('Add Todo'))
    fireEvent.change(screen.getByPlaceholderText('Todo title'), { target: { value: 'New todo' } })
    fireEvent.click(screen.getByText('Save Todo'))
    expect(onUpdate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          todos: expect.arrayContaining([expect.objectContaining({ title: 'New todo' })])
        })
      ])
    )
  })
})
```

**Step 2: Run to confirm failures**

```bash
npm test
```

Expected: FAIL.

**Step 3: Write `src/sidepanel/components/TodoForm.tsx`**

```tsx
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
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '8px 0' }}>
      <input
        placeholder="Todo title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        style={{ padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db' }}
      />
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value as Todo['priority'])}
        style={{ padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db' }}
      >
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        style={{ padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db' }}
      />
      <div style={{ display: 'flex', gap: '8px' }}>
        <button type="submit" style={{ padding: '6px 12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Save Todo
        </button>
        <button type="button" onClick={onCancel} style={{ padding: '6px 12px', background: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Cancel
        </button>
      </div>
    </form>
  )
}
```

**Step 4: Write full `src/sidepanel/components/TodoList.tsx`**

```tsx
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
  const [editingName, setEditingName] = useState(false)
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
    setEditingName(false)
  }

  const visible = applyFilterSort(task.todos, filter, sort)

  return (
    <div>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', marginBottom: '8px', padding: 0 }}>
        ← Back
      </button>

      {editingName ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
          <input value={name} onChange={(e) => setName(e.target.value)} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db', fontWeight: 600 }} />
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" style={{ padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db' }} />
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db' }} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={saveTaskEdits} style={{ padding: '4px 10px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
            <button onClick={() => setEditingName(false)} style={{ padding: '4px 10px', background: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: '12px', cursor: 'pointer' }} onClick={() => setEditingName(true)}>
          <h2 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>{task.name}</h2>
          {task.description && <p style={{ margin: '0 0 4px 0', color: '#4b5563', fontSize: '13px' }}>{task.description}</p>}
          {task.dueDate && <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Due: {task.dueDate}</p>}
        </div>
      )}

      <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
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
```

**Step 5: Run tests to confirm they all pass**

```bash
npm test
```

Expected: PASS — all tests across all files.

**Step 6: Commit**

```bash
git add src/sidepanel/components/TodoList.tsx src/sidepanel/components/TodoForm.tsx src/sidepanel/components/TodoList.test.tsx
git commit -m "feat: implement TodoList with filter, sort, add, toggle, delete"
```

---

## Task 7: Build & Verify Extension Loads

**Step 1: Build the extension**

```bash
npm run build
```

Expected: `dist/` folder created with `src/sidepanel/index.html` and bundled JS.

**Step 2: Fix manifest `side_panel.default_path` to point to built file**

After building, update `manifest.json` so the `default_path` points to the built output:

```json
"side_panel": {
  "default_path": "src/sidepanel/index.html"
}
```

Vite preserves the input structure in `dist/`, so the path `dist/src/sidepanel/index.html` will be produced. The manifest's relative path should stay as `src/sidepanel/index.html` since Chrome resolves it relative to the `dist/` root.

**Step 3: Load extension in Chrome**

1. Open `chrome://extensions`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `dist/` folder

**Step 4: Open the side panel**

1. Click the extension icon in the toolbar
2. Or right-click → "Open side panel"
3. Verify the Task Manager UI appears

**Step 5: Manual smoke test**

- Create a task (name, description, due date) → appears in list with `0/0 complete`
- Click the task → Task Detail view opens
- Add 2 todos (one high priority, one low) → appear in list
- Toggle one todo to complete → checkbox ticked, title struck through, count updates to `1/2 complete`
- Filter by "Pending" → only pending todo shows
- Filter by "Complete" → only complete todo shows
- Sort by Priority → high-priority todo first
- Delete a todo → removed from list
- Back → Task List view
- Delete the task → removed from list

**Step 6: Commit**

```bash
git add dist/ manifest.json
git commit -m "feat: production build of Chrome extension"
```

---

## Task 8: Create Extension Icons

**Step 1: Create simple placeholder PNG icons**

You can use any 16x16, 48x48, and 128x128 PNG images. The simplest approach is to use an online favicon generator or create them with a tool like `sharp` or `imagemagick`:

```bash
# If imagemagick is installed:
magick -size 16x16 xc:#3b82f6 public/icons/icon16.png
magick -size 48x48 xc:#3b82f6 public/icons/icon48.png
magick -size 128x128 xc:#3b82f6 public/icons/icon128.png
```

Or place any PNG files manually at those paths.

**Step 2: Rebuild**

```bash
npm run build
```

**Step 3: Reload the extension in `chrome://extensions`** (click the refresh icon on the extension card)

**Step 4: Commit**

```bash
git add public/icons/ dist/
git commit -m "feat: add extension icons"
```

---

## Done

All tests pass (`npm test`) and the extension loads and functions correctly as an unpacked Chrome extension.

To re-load changes during development:
1. Run `npm run build`
2. Go to `chrome://extensions` and click the reload icon on the extension card
