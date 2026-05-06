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
