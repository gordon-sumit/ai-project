import type { Task } from './types'

const STORAGE_KEY = 'tasks'

export function getTasks(): Promise<Task[]> {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      resolve((result[STORAGE_KEY] as Task[]) ?? [])
    })
  })
}

export function saveTasks(tasks: Task[]): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEY]: tasks }, resolve)
  })
}
