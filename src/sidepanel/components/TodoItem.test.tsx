import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import TodoItem from './TodoItem'
import type { Todo } from '../../types'

const pending: Todo = { id: '1', title: 'Write tests', status: 'pending', priority: 'high', dueDate: '2026-06-01', createdAt: '' }
const complete: Todo = { ...pending, id: '2', status: 'complete' }

describe('TodoItem', () => {
  it('renders title and priority badge', () => {
    render(<TodoItem todo={pending} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />)
    expect(screen.getByText('Write tests')).toBeInTheDocument()
    expect(screen.getByText('high')).toBeInTheDocument()
  })

  it('strikes through title when complete', () => {
    render(<TodoItem todo={complete} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />)
    const title = screen.getByText('Write tests')
    expect(title).toHaveClass('line-through')
  })

  it('calls onToggle when checkbox clicked', () => {
    const onToggle = vi.fn()
    render(<TodoItem todo={pending} onToggle={onToggle} onDelete={vi.fn()} onEdit={vi.fn()} />)
    fireEvent.click(screen.getByRole('checkbox'))
    expect(onToggle).toHaveBeenCalledWith('1')
  })

  it('calls onDelete when delete button clicked', () => {
    const onDelete = vi.fn()
    render(<TodoItem todo={pending} onToggle={vi.fn()} onDelete={onDelete} onEdit={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /delete todo/i }))
    expect(onDelete).toHaveBeenCalledWith('1')
  })

  it('shows due date when set', () => {
    render(<TodoItem todo={pending} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />)
    expect(screen.getByText('Due: 2026-06-01')).toBeInTheDocument()
  })

  it('shows edit button', () => {
    render(<TodoItem todo={pending} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />)
    expect(screen.getByRole('button', { name: /edit todo/i })).toBeInTheDocument()
  })

  it('enters edit mode when edit button clicked', () => {
    render(<TodoItem todo={pending} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /edit todo/i }))
    expect(screen.getByRole('button', { name: /^save$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^cancel$/i })).toBeInTheDocument()
  })

  it('pre-fills inputs with current values in edit mode', () => {
    render(<TodoItem todo={pending} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /edit todo/i }))
    expect(screen.getByLabelText('edit todo title')).toHaveValue('Write tests')
    expect(screen.getByLabelText('edit todo priority')).toHaveValue('high')
    expect(screen.getByLabelText('edit todo due date')).toHaveValue('2026-06-01')
  })

  it('calls onEdit with updated values when saved', () => {
    const onEdit = vi.fn()
    render(<TodoItem todo={pending} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={onEdit} />)
    fireEvent.click(screen.getByRole('button', { name: /edit todo/i }))
    fireEvent.change(screen.getByLabelText('edit todo title'), { target: { value: 'Updated title' } })
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))
    expect(onEdit).toHaveBeenCalledWith('1', expect.objectContaining({ title: 'Updated title', priority: 'high' }))
  })

  it('exits edit mode and does not call onEdit when cancelled', () => {
    const onEdit = vi.fn()
    render(<TodoItem todo={pending} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={onEdit} />)
    fireEvent.click(screen.getByRole('button', { name: /edit todo/i }))
    fireEvent.change(screen.getByLabelText('edit todo title'), { target: { value: 'Changed' } })
    fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }))
    expect(onEdit).not.toHaveBeenCalled()
    expect(screen.getByText('Write tests')).toBeInTheDocument()
  })

  it('does not call onEdit when title is blank', () => {
    const onEdit = vi.fn()
    render(<TodoItem todo={pending} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={onEdit} />)
    fireEvent.click(screen.getByRole('button', { name: /edit todo/i }))
    fireEvent.change(screen.getByLabelText('edit todo title'), { target: { value: '   ' } })
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))
    expect(onEdit).not.toHaveBeenCalled()
  })
})
