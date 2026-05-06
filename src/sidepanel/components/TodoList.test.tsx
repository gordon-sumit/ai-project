import { render, screen, fireEvent, within } from '@testing-library/react'
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

  it('edits a todo via the inline edit form', () => {
    const onUpdate = vi.fn()
    render(<TodoList task={task} tasks={allTasks} onBack={vi.fn()} onUpdate={onUpdate} />)
    const alphaRow = screen.getByText('Alpha').closest('div') as HTMLElement
    fireEvent.click(within(alphaRow).getByRole('button', { name: /edit todo/i }))
    fireEvent.change(screen.getByLabelText('edit todo title'), { target: { value: 'Edited Alpha' } })
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))
    expect(onUpdate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          todos: expect.arrayContaining([expect.objectContaining({ id: 't1', title: 'Edited Alpha' })])
        })
      ])
    )
  })
})
