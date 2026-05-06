import type { Task } from './types'

const STORAGE_KEY = 'tasks'

export function getTasks(): Promise<Task[]> {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      const raw = (result[STORAGE_KEY] as Task[]) ?? []
      resolve(raw.map((t) => ({ status: 'pending' as const, ...t })))
    })
  })
}

export function saveTasks(tasks: Task[]): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEY]: tasks }, resolve)
  })
}
