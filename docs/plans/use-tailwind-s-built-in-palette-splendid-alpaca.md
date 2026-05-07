# Tailwind CSS v4 Migration Plan

## Context
All 6 component files in this Chrome extension use inline `style=` props. The goal is to replace every inline style with Tailwind v4 utility classes using the built-in palette — no custom theme configuration needed. This is a pure style refactor; component logic and tests remain untouched except for one `toHaveStyle` assertion that must become `toHaveClass`.

---

## Files to Modify

| File | Change |
|---|---|
| `vite.config.ts` | Add `@tailwindcss/vite` plugin |
| `src/sidepanel/index.css` | **Create** with `@import "tailwindcss"` |
| `src/sidepanel/main.tsx` | Import `./index.css` |
| `src/sidepanel/App.tsx` | Replace 3 inline style blocks |
| `src/sidepanel/components/TaskList.tsx` | Replace 9 inline style blocks |
| `src/sidepanel/components/TaskForm.tsx` | Replace 7 inline style blocks |
| `src/sidepanel/components/TodoList.tsx` | Replace 17 inline style blocks |
| `src/sidepanel/components/TodoForm.tsx` | Replace 7 inline style blocks |
| `src/sidepanel/components/TodoItem.tsx` | Replace `PRIORITY_STYLE` map + 5 inline style blocks |
| `src/sidepanel/components/TodoItem.test.tsx` | Fix 1 `toHaveStyle` → `toHaveClass` assertion |

---

## Installation & Wiring

```
npm install --save-dev tailwindcss @tailwindcss/vite
```

**`vite.config.ts`** — add before the React plugin:
```ts
import tailwindcss from '@tailwindcss/vite'
// ...
plugins: [tailwindcss(), react()],
```

**`src/sidepanel/index.css`** (new file):
```css
@import "tailwindcss";
```

**`src/sidepanel/main.tsx`** — add as first import:
```ts
import './index.css'
```

---

## Color → Tailwind Mapping

| Hex | Tailwind token |
|---|---|
| `#3b82f6` | `blue-500` |
| `#10b981` | `emerald-500` |
| `#ef4444` | `red-500` |
| `#e5e7eb` | `gray-200` |
| `#d1d5db` | `gray-300` |
| `#f3f4f6` | `gray-100` |
| `#6b7280` | `gray-500` |
| `#111827` | `gray-900` |
| `#374151` | `gray-700` |
| `#4b5563` | `gray-600` |
| `#9ca3af` | `gray-400` |
| `#fee2e2` | `red-100` |
| `#991b1b` | `red-800` |
| `#fef9c3` | `yellow-100` |
| `#92400e` | `amber-800` |

---

## Component-by-Component Replacements

### App.tsx
- Root div: `className="font-sans p-3 w-full"`
- Error banner: restructure to flex row (replaces `float: right` on close button)
  ```tsx
  <div className="flex justify-between items-center bg-red-100 text-red-800 p-2 rounded mb-2">
    <span>{error}</span>
    <button onClick={() => setError(null)} className="bg-transparent border-none cursor-pointer">✕</button>
  </div>
  ```

### TaskList.tsx
- Header div: `"flex justify-between items-center mb-3"`
- h2: `"m-0 text-lg"`
- New Task button: `"px-3 py-1.5 bg-blue-500 text-white border-none rounded cursor-pointer"`
- Empty state p: `"text-gray-500 text-center mt-8"`
- Task card div: `"border border-gray-200 rounded-md p-3 mb-2 cursor-pointer flex justify-between items-start"`
- Task name div: `"font-semibold"`
- Due date div: `"text-xs text-gray-500"`
- Progress div: `"text-xs text-gray-500"`
- Delete button: `"bg-transparent border-none cursor-pointer text-red-500 text-base"`

### TaskForm.tsx
- Form: `"flex flex-col gap-2 mb-3"`
- All 3 inputs: `"p-1.5 rounded border border-gray-300"`
- Button group: `"flex gap-2"`
- Add Task button: `"px-3 py-1.5 bg-blue-500 text-white border-none rounded cursor-pointer"`
- Cancel button: `"px-3 py-1.5 bg-gray-200 border-none rounded cursor-pointer"`

### TodoForm.tsx
- Form: `"flex flex-col gap-2 my-2"`
- Title input, priority select, date input: `"p-1.5 rounded border border-gray-300"`
- Button group: `"flex gap-2"`
- Save Todo button: `"px-3 py-1.5 bg-blue-500 text-white border-none rounded cursor-pointer"`
- Cancel button: `"px-3 py-1.5 bg-gray-200 border-none rounded cursor-pointer"`

### TodoList.tsx
- Back button: `"bg-transparent border-none cursor-pointer text-blue-500 mb-2 p-0"`
- Edit form div: `"flex flex-col gap-1.5 mb-3"`
- Name input (edit mode): `"p-1.5 rounded border border-gray-300 font-semibold"`
- Other inputs: `"p-1.5 rounded border border-gray-300"`
- Button group: `"flex gap-2"`
- Save button: `"px-2.5 py-1 bg-blue-500 text-white border-none rounded cursor-pointer"`
- Cancel button: `"px-2.5 py-1 bg-gray-200 border-none rounded cursor-pointer"`
- Task display div: `"mb-3 cursor-pointer"`
- h2: `"m-0 mb-1 text-lg"`
- Description p: `"m-0 mb-1 text-gray-600 text-[13px]"` (13px has no exact step; use arbitrary value)
- Due date p: `"m-0 text-xs text-gray-500"`
- Filter bar div: `"flex gap-1.5 mb-2 flex-wrap"`
- **Filter button (conditional)**:
  ```tsx
  className={`px-2.5 py-1 border border-gray-300 rounded-full cursor-pointer capitalize ${
    filter === f ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'
  }`}
  ```
- Sort select: `"ml-auto px-2 py-1 rounded border border-gray-300 text-xs"`
- Add Todo button: `"px-3 py-1.5 bg-emerald-500 text-white border-none rounded cursor-pointer mb-2"`
- Empty state p: `"text-gray-500 text-center mt-6"`

### TodoItem.tsx — Key Structural Change
Replace `PRIORITY_STYLE` (object map with `React.CSSProperties` values) with a `PRIORITY_CLASS` string map:
```ts
const PRIORITY_CLASS: Record<Todo['priority'], string> = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-amber-800',
  low: 'bg-gray-100 text-gray-700',
}
```
> **Why complete strings matter**: Tailwind v4's scanner finds class tokens by searching source files for complete word-boundary-delimited strings. Values must never be split across concatenations. All three map values here, and both branches of every ternary, are complete literal strings.

- Todo row div: `"flex items-center gap-2 py-2 border-b border-gray-100"`
- Title span (conditional):
  ```tsx
  className={`flex-1 ${todo.status === 'complete' ? 'line-through text-gray-400' : 'text-gray-900'}`}
  ```
- Priority badge span:
  ```tsx
  className={`text-[11px] px-1.5 py-0.5 rounded-full ${PRIORITY_CLASS[todo.priority]}`}
  ```
- Due date span: `"text-[11px] text-gray-500"`
- Delete button: `"bg-transparent border-none cursor-pointer text-red-500"`

---

## Test Fix — TodoItem.test.tsx

`toHaveStyle` checks the `style=` attribute; jsdom does not process external CSS. After moving `line-through` to a class, update the one failing assertion:

```ts
// Before
expect(title).toHaveStyle('text-decoration: line-through')

// After
expect(title).toHaveClass('line-through')
```

No other test changes needed — all other assertions use text content, roles, and callback checks.

---

## Verification

1. `npm test` — all tests pass (only TodoItem.test.tsx has a change)
2. `npm run build` — dist/ builds cleanly with no TypeScript errors
3. Load `dist/` as unpacked extension in Chrome (`chrome://extensions` → Developer mode → Load unpacked)
4. Manual smoke test: create task, add todos, toggle complete → confirm strikethrough renders, priority badges show correct colors, filter buttons highlight active state
