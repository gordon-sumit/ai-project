import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from './App'
import * as storage from '../storage'

describe('App', () => {
  it('renders task list view by default', async () => {
    vi.spyOn(storage, 'getTasks').mockResolvedValue([])
    render(<App />)
    expect(await screen.findByText('My Tasks')).toBeInTheDocument()
  })
})
