# Task Status, Edit & Counts Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add `status: 'pending' | 'complete'` to tasks, allow toggling and inline editing of task cards in `TaskList`, and show a live pending/complete count summary at the top.

**Architecture:** `Task` gets a `status` field; `getTasks` defaults it to `'pending'` so existing stored tasks don't break. All UI changes live in `TaskList` — the count summary is derived from the task array, the status toggle and inline edit are handled with local `editState` and handlers that call `onUpdate`. No new components are needed.

**Tech Stack:** React, TypeScript, Tailwind CSS, Vitest + @testing-library/react, Chrome Storage API

---

### Task 1: Add `status` to `Task` type, storage, and form

**Files:**
- Modify: `src/types.ts`
- Modify: `src/storage.ts`
- Modify: `src/sidepanel/components/TaskForm.tsx`
- Modify: `src/storage.test.ts` (fixture)
- Modify: `src/sidepanel/components/TaskList.test.tsx` (fixture)

---

**Step 1: Add `status` to the `Task` interface**

In `src/types.ts`, add `status: 'pending' | 'complete'` after `dueDate`:

```ts
export interface Task {
  id: string
  name: string
  description: string
  dueDate: string | null
  status: 'pending' | 'complete'
  createdAt: string
  todos: Todo[]
}
```

**Step 2: Run tests to confirm TypeScript errors surface**

```bash
npx vitest run src/
```

Expected: failures in `storage.test.ts` and `TaskList.test.tsx` because their `Task` fixtures are missing `status`.

**Step 3: Update storage to default missing `status` to `'pending'`**

The spread order `{ status: 'pending', ...t }` means any stored `status` value wins over the default — existing tasks without the field get `'pending'`, new tasks keep whatever was saved.

Replace `getTasks` in `src/storage.ts`:

```ts
export function getTasks(): Promise<Task[]> {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      const raw = (result[STORAGE_KEY] as Task[]) ?? []
      resolve(raw.map((t) => ({ status: 'pending' as const, ...t })))
    })
  })
}
```

**Step 4: Set `status: 'pending'` on new task creation in `TaskForm.tsx`**

In the `handleSubmit` function, add `status: 'pending'` to the object passed to `onAdd`:

```ts
onAdd({
  id: crypto.randomUUID(),
  name: name.trim(),
  description: description.trim(),
  dueDate: dueDate || null,
  status: 'pending',
  createdAt: new Date().toISOString(),
  todos: [],
})
```

**Step 5: Fix test fixtures**

Add `status: 'pending'` to the `sampleTask` fixture in `src/storage.test.ts`:

```ts
const sampleTask: Task = {
  id: '1',
  name: 'Test Task',
  description: 'desc',
  dueDate: '2026-06-01',
  status: 'pending',
  createdAt: '2026-05-06T00:00:00.000Z',
  todos: [],
}
```

Add `status: 'pending'` to the `task` fixture in `src/sidepanel/components/TaskList.test.tsx`:

```ts
const task: Task = {
  id: '1', name: 'My Task', description: 'desc', dueDate: '2026-06-01',
  status: 'pending', createdAt: '2026-05-06T00:00:00.000Z', todos: [
    { id: 't1', title: 'todo', status: 'complete', priority: 'high', dueDate: null, createdAt: '' },
    { id: 't2', title: 'todo2', status: 'pending', priority: 'low', dueDate: null, createdAt: '' },
  ]
}
```

**Step 6: Run tests — all should pass**

```bash
npx vitest run src/
```

Expected: all tests PASS.

**Step 7: Commit**

```bash
git add src/types.ts src/storage.ts src/sidepanel/components/TaskForm.tsx \
        src/storage.test.ts src/sidepanel/components/TaskList.test.tsx
git commit -m "feat: add status field to Task type"
```

---

### Task 2: TaskList — counts header, status toggle, dimming, inline edit (TDD)

**Files:**
- Modify: `src/sidepanel/components/TaskList.test.tsx`
- Modify: `src/sidepanel/components/TaskList.tsx`

---

**Step 1: Add `completedTask` fixture and new failing tests**

At the top of `src/sidepanel/components/TaskList.test.tsx`, add a second fixture after the existing `task` const:

```ts
const completedTask: Task = { ...task, id: '2', name: 'Done Task', status: 'complete', todos: [] }
```

Append these 8 tests inside `describe('TaskList', ...)`:

```tsx
it('shows pending and complete counts', () => {
  render(<TaskList tasks={[task, completedTask]} onSelect={vi.fn()} onUpdate={vi.fn()} />)
  expect(screen.getByText('1 pending · 1 complete')).toBeInTheDocument()
})

it('dims completed task cards', () => {
  render(<TaskList tasks={[completedTask]} onSelect={vi.fn()} onUpdate={vi.fn()} />)
  const card = screen.getByText('Done Task').closest('div[class]') as HTMLElement
  expect(card).toHaveClass('opacity-50')
})

it('toggles task status to complete', () => {
  const onUpdate = vi.fn()
  render(<TaskList tasks={[task]} onSelect={vi.fn()} onUpdate={onUpdate} />)
  fireEvent.click(screen.getByRole('button', { name: /toggle status/i }))
  expect(onUpdate).toHaveBeenCalledWith(
    expect.arrayContaining([expect.objectContaining({ id: '1', status: 'complete' })])
  )
})

it('toggles task status back to pending', () => {
  const onUpdate = vi.fn()
  render(<TaskList tasks={[completedTask]} onSelect={vi.fn()} onUpdate={onUpdate} />)
  fireEvent.click(screen.getByRole('button', { name: /toggle status/i }))
  expect(onUpdate).toHaveBeenCalledWith(
    expect.arrayContaining([expect.objectContaining({ id: '2', status: 'pending' })])
  )
})

it('shows edit button on each card', () => {
  render(<TaskList tasks={[task]} onSelect={vi.fn()} onUpdate={vi.fn()} />)
  expect(screen.getByRole('button', { name: /edit task/i })).toBeInTheDocument()
})

it('enters inline edit mode when edit button clicked', () => {
  render(<TaskList tasks={[task]} onSelect={vi.fn()} onUpdate={vi.fn()} />)
  fireEvent.click(screen.getByRole('button', { name: /edit task/i }))
  expect(screen.getByDisplayValue('My Task')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /^save$/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /^cancel$/i })).toBeInTheDocument()
})

it('saves edited task name', () => {
  const onUpdate = vi.fn()
  render(<TaskList tasks={[task]} onSelect={vi.fn()} onUpdate={onUpdate} />)
  fireEvent.click(screen.getByRole('button', { name: /edit task/i }))
  fireEvent.change(screen.getByDisplayValue('My Task'), { target: { value: 'Renamed Task' } })
  fireEvent.click(screen.getByRole('button', { name: /^save$/i }))
  expect(onUpdate).toHaveBeenCalledWith(
    expect.arrayContaining([expect.objectContaining({ id: '1', name: 'Renamed Task' })])
  )
})

it('cancels edit without calling onUpdate', () => {
  const onUpdate = vi.fn()
  render(<TaskList tasks={[task]} onSelect={vi.fn()} onUpdate={onUpdate} />)
  fireEvent.click(screen.getByRole('button', { name: /edit task/i }))
  fireEvent.change(screen.getByDisplayValue('My Task'), { target: { value: 'Changed' } })
  fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }))
  expect(onUpdate).not.toHaveBeenCalled()
  expect(screen.getByText('My Task')).toBeInTheDocument()
})
```

**Step 2: Run to verify new tests fail**

```bash
npx vitest run src/sidepanel/components/TaskList.test.tsx
```

Expected: 5 existing tests PASS, 8 new tests FAIL.

**Step 3: Implement the new TaskList**

Replace `src/sidepanel/components/TaskList.tsx` entirely:

```tsx
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
            <div>
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
                <div>
                  <span className={`font-semibold ${task.status === 'complete' ? 'line-through' : ''}`}>{task.name}</span>
                </div>
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
```

> **Note on the `dims completed task cards` test:** The test uses `closest('div[class]')` to find the card wrapper. Any intermediate `<div>` with Tailwind classes between the task name text and the outer card div will intercept the traversal. Keep the inner content wrappers as plain `<div>` elements (no class attribute) so the first `div[class]` ancestor is always the card with `opacity-50`.

**Step 4: Run all tests — all 34 should pass**

```bash
npx vitest run src/
```

Expected: 34 tests PASS across all test files.

**Step 5: Commit**

```bash
git add src/sidepanel/components/TaskList.tsx src/sidepanel/components/TaskList.test.tsx
git commit -m "feat: task status toggle, counts header, and inline edit in TaskList"
```

---

### Task 3: Build verification

**Step 1: Build the extension**

```bash
npm run build
```

Expected: build succeeds with no TypeScript errors, output in `dist/`.

**Step 2: Smoke-test in Chrome**

1. Open `chrome://extensions`, reload the extension from `dist/`
2. Open the side panel — the "N pending · N complete" summary should appear below the header
3. Click the small square toggle on a task — it turns green with ✓ and the card dims to `opacity-50`
4. Click it again — it returns to pending
5. Click ✎ on a task card — inline inputs appear pre-filled; edit name and Save — card updates
6. Click ✎ again, edit, then Cancel — card reverts to original values
7. Verify clicking the card body (not ✎ or toggle) still navigates into the todo list
