import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import TaskList from './TaskList'
import type { Task } from '../../types'

const task: Task = {
  id: '1', name: 'My Task', description: 'desc', dueDate: '2026-06-01',
  status: 'pending', createdAt: '2026-05-06T00:00:00.000Z', todos: [
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
