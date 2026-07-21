import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

export interface LogEntry {
  id: string
  timestamp: Date
  type: 'ingest' | 'query'
  endpoint: string
  requestBody: unknown
  responseBody?: unknown
  status: 'pending' | 'success' | 'error'
  durationMs?: number
  errorMessage?: string
}

interface LoggerContextValue {
  logs: LogEntry[]
  addLog: (entry: Omit<LogEntry, 'id'>) => string
  updateLog: (id: string, update: Partial<LogEntry>) => void
  clearLogs: () => void
}

const LoggerContext = createContext<LoggerContextValue | null>(null)

export function LoggerProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<LogEntry[]>([])

  const addLog = (entry: Omit<LogEntry, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    setLogs((prev) => [{ ...entry, id }, ...prev])
    return id
  }

  const updateLog = (id: string, update: Partial<LogEntry>) => {
    setLogs((prev) => prev.map((l) => (l.id === id ? { ...l, ...update } : l)))
  }

  const clearLogs = () => setLogs([])

  return (
    <LoggerContext.Provider value={{ logs, addLog, updateLog, clearLogs }}>
      {children}
    </LoggerContext.Provider>
  )
}

export function useLogger() {
  const ctx = useContext(LoggerContext)
  if (!ctx) throw new Error('useLogger must be used within LoggerProvider')
  return ctx
}
