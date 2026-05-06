import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import TodoItem from './TodoItem'
import type { Todo } from '../../types'

const pending: Todo = { id: '1', title: 'Write tests', status: 'pending', priority: 'high', dueDate: '2026-06-01', createdAt: '' }
const complete: Todo = { ...pending, id: '2', status: 'complete' }

describe('TodoItem', () => {
  it('renders title and priority badge', () => {
    render(<TodoItem todo={pending} onToggle={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Write tests')).toBeInTheDocument()
    expect(screen.getByText('high')).toBeInTheDocument()
  })

  it('strikes through title when complete', () => {
    render(<TodoItem todo={complete} onToggle={vi.fn()} onDelete={vi.fn()} />)
    const title = screen.getByText('Write tests')
    expect(title).toHaveStyle('text-decoration: line-through')
  })

  it('calls onToggle when checkbox clicked', () => {
    const onToggle = vi.fn()
    render(<TodoItem todo={pending} onToggle={onToggle} onDelete={vi.fn()} />)
    fireEvent.click(screen.getByRole('checkbox'))
    expect(onToggle).toHaveBeenCalledWith('1')
  })

  it('calls onDelete when delete button clicked', () => {
    const onDelete = vi.fn()
    render(<TodoItem todo={pending} onToggle={vi.fn()} onDelete={onDelete} />)
    fireEvent.click(screen.getByRole('button', { name: /delete todo/i }))
    expect(onDelete).toHaveBeenCalledWith('1')
  })

  it('shows due date when set', () => {
    render(<TodoItem todo={pending} onToggle={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Due: 2026-06-01')).toBeInTheDocument()
  })
})
