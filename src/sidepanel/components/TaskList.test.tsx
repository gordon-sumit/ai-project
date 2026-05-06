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
const completedTask: Task = { ...task, id: '2', name: 'Done Task', status: 'complete', todos: [] }

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
})
