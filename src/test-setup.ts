import '@testing-library/jest-dom'

const store: Record<string, unknown> = {}

global.chrome = {
  storage: {
    local: {
      get: (keys: string[], cb: (result: Record<string, unknown>) => void) => {
        const result: Record<string, unknown> = {}
        keys.forEach((k) => { if (k in store) result[k] = store[k] })
        cb(result)
      },
      set: (items: Record<string, unknown>, cb?: () => void) => {
        Object.assign(store, items)
        cb?.()
      },
    },
  },
} as unknown as typeof chrome
