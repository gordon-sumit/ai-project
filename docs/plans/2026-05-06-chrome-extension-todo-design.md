# Chrome Extension — Task & TODO Manager

## Overview

A Chrome extension (Manifest V3) with a side panel UI for managing tasks and todos. Data is stored locally in `chrome.storage.local` — no account or backend required.

---

## Architecture

**Tech stack:** React (Vite), TypeScript, `chrome.storage.local`

```
ai-project/
├── manifest.json
├── src/
│   └── sidepanel/
│       ├── index.html
│       ├── main.tsx
│       ├── App.tsx
│       ├── components/
│       │   ├── TaskList.tsx
│       │   ├── TaskForm.tsx
│       │   ├── TodoList.tsx
│       │   ├── TodoForm.tsx
│       │   └── TodoItem.tsx
│       └── storage.ts
├── public/
│   └── icons/
└── vite.config.ts
```

No background service worker needed — the side panel reads and writes `chrome.storage.local` directly.

---

## Data Model

```typescript
// chrome.storage.local shape: { tasks: Task[] }

interface Task {
  id: string           // crypto.randomUUID()
  name: string
  description: string
  dueDate: string | null   // "YYYY-MM-DD"
  createdAt: string
  todos: Todo[]
}

interface Todo {
  id: string
  title: string
  status: "pending" | "complete"
  priority: "high" | "medium" | "low"
  dueDate: string | null
  createdAt: string
}
```

**Storage helpers (`storage.ts`):**
- `getTasks(): Promise<Task[]>`
- `saveTasks(tasks: Task[]): Promise<void>`

All CRUD operations load the full array, mutate, and save back.

---

## UI Flow

Two views, toggled by `activeTaskId` state in `App.tsx` — no routing library.

### View 1 — Task List
- Header with "New Task" button → inline form (name, description, due date)
- Each task card: name, due date, todo progress (`2/5 complete`), delete button
- Click card → navigate to View 2

### View 2 — Task Detail
- Back button → return to task list
- Task name + description + due date at top (inline editable)
- Filter bar: `All | Pending | Complete`
- Sort dropdown: `Due Date ↑↓ | Priority ↑↓`
- "Add Todo" button → inline form (title, priority, due date)
- Each todo row: checkbox, title (strikethrough when complete), priority badge, due date, delete button

**Priority badge colors:**
- High → red
- Medium → yellow
- Low → gray

---

## State Flow

```typescript
// App.tsx
const [tasks, setTasks] = useState<Task[]>([])
const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
const [filter, setFilter] = useState<"all" | "pending" | "complete">("all")
const [sort, setSort] = useState<"dueDate" | "priority">("dueDate")
```

1. On mount → `getTasks()` → `setTasks`
2. Any mutation → update state → `saveTasks(updatedTasks)` persists immediately
3. Filter applied first, then sort

**Sort rules:**
- Priority: `high → medium → low`
- Due date: nulls last, earliest first

---

## Error Handling & Edge Cases

- Storage errors → toast banner ("Something went wrong, try again")
- Empty task list → "No tasks yet — create one!"
- Empty todo list → "No todos yet — add one!"

---

## Build & Load

```bash
npm run build      # outputs to dist/
```

Load `dist/` as an unpacked extension at `chrome://extensions`.
