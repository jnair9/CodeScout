import { useState } from 'react'
import { Terminal, X, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { useLogger } from '../context/LoggerContext'
import type { LogEntry } from '../context/LoggerContext'

function LogRow({ entry }: { entry: LogEntry }) {
  const [open, setOpen] = useState(false)

  const statusColor =
    entry.status === 'success'
      ? '#34d399'
      : entry.status === 'error'
      ? '#f87171'
      : '#fbbf24'

  const time = entry.timestamp.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  return (
    <div className="border-b border-white/[0.05] last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.03] transition-colors"
      >
        <span className="shrink-0 w-1.5 h-1.5 rounded-full" style={{ background: statusColor }} />
        <span className="text-[11px] font-mono text-white/30 shrink-0">{time}</span>
        <span className="text-[12px] font-mono text-white/60 shrink-0 uppercase">{entry.type}</span>
        <span className="text-[12px] font-mono text-white/35 truncate flex-1">{entry.endpoint}</span>
        {entry.durationMs !== undefined && (
          <span className="text-[11px] font-mono text-white/25 shrink-0">{entry.durationMs}ms</span>
        )}
        {open ? (
          <ChevronDown size={12} className="text-white/20 shrink-0" />
        ) : (
          <ChevronRight size={12} className="text-white/20 shrink-0" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-3 flex flex-col gap-2">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/20 mb-1">Request</p>
            <pre
              className="text-[11px] font-mono text-white/45 leading-relaxed overflow-x-auto rounded-lg p-3"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              {JSON.stringify(entry.requestBody, null, 2)}
            </pre>
          </div>
          {entry.responseBody !== undefined && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/20 mb-1">Response</p>
              <pre
                className="text-[11px] font-mono text-white/45 leading-relaxed overflow-x-auto rounded-lg p-3 max-h-48"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                {JSON.stringify(entry.responseBody, null, 2)}
              </pre>
            </div>
          )}
          {entry.errorMessage && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-red-400/50 mb-1">Error</p>
              <pre
                className="text-[11px] font-mono text-red-400/70 leading-relaxed rounded-lg p-3"
                style={{ background: 'rgba(239,68,68,0.05)' }}
              >
                {entry.errorMessage}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface Props {
  open: boolean
  onClose: () => void
}

export default function DevLogger({ open, onClose }: Props) {
  const { logs, clearLogs } = useLogger()

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 pointer-events-none"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)', pointerEvents: 'all' }}
          onClick={onClose}
        />
      )}

      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col transition-transform duration-300"
        style={{
          width: '420px',
          background: 'rgba(10,10,14,0.96)',
          borderLeft: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(20px)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center gap-2">
            <Terminal size={14} className="text-indigo-400" />
            <span className="text-[13px] font-medium text-white/70">API Logger</span>
            {logs.length > 0 && (
              <span
                className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }}
              >
                {logs.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {logs.length > 0 && (
              <button
                onClick={clearLogs}
                className="p-1.5 rounded-md hover:bg-white/5 text-white/25 hover:text-white/50 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-white/5 text-white/25 hover:text-white/50 transition-colors"
            >
              <X size={13} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-white/15">
              <Terminal size={24} />
              <p className="text-[13px]">No requests yet</p>
            </div>
          ) : (
            logs.map((entry) => <LogRow key={entry.id} entry={entry} />)
          )}
        </div>
      </div>
    </>
  )
}
