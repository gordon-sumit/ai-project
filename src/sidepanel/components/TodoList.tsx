import type { Task } from '../../types'
export default function TodoList(_: { task: Task; tasks: Task[]; onBack: () => void; onUpdate: (t: Task[]) => void }) {
  return <div>Todos</div>
}
