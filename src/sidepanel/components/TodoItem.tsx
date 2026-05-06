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
