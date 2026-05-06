import { describe, it, expect, beforeEach } from 'vitest'
import { getTasks, saveTasks } from './storage'
import type { Task } from './types'

const sampleTask: Task = {
  id: '1',
  name: 'Test Task',
  description: 'desc',
  dueDate: '2026-06-01',
  status: 'pending',
  createdAt: '2026-05-06T00:00:00.000Z',
  todos: [],
}

beforeEach(async () => {
  await saveTasks([])
})

describe('getTasks', () => {
  it('returns empty array when nothing stored', async () => {
    const tasks = await getTasks()
    expect(tasks).toEqual([])
  })
})

describe('saveTasks + getTasks', () => {
  it('persists and retrieves tasks', async () => {
    await saveTasks([sampleTask])
    const tasks = await getTasks()
    expect(tasks).toEqual([sampleTask])
  })
})
