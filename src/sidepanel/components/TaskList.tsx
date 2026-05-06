import type { Task } from '../../types'
export default function TaskList(_: { tasks: Task[]; onSelect: (id: string) => void; onUpdate: (t: Task[]) => void }) {
  return <div>My Tasks</div>
}
