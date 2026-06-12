export function getItem<T>(key: string): T | null {
  try {
    const data = localStorage.getItem(key)
    return data ? (JSON.parse(data) as T) : null
  } catch {
    return null
  }
}

export function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('Storage error:', e)
  }
}

export function removeItem(key: string): void {
  localStorage.removeItem(key)
}

export function exportData(): Record<string, unknown> {
  const data: Record<string, unknown> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key) {
      try {
        data[key] = JSON.parse(localStorage.getItem(key) || '')
      } catch {
        data[key] = localStorage.getItem(key)
      }
    }
  }
  return data
}

export function importData(data: Record<string, unknown>): void {
  Object.entries(data).forEach(([key, value]) => {
    localStorage.setItem(key, JSON.stringify(value))
  })
}

export function clearAllData(): void {
  const keys: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    keys.push(localStorage.key(i) || '')
  }
  keys.forEach((k) => {
    if (k !== 'riskflow_auth' && k !== 'riskflow_preferences') {
      localStorage.removeItem(k)
    }
  })
}
