import type { CodeChunk } from '../api/client'

interface Props {
  chunk: CodeChunk
  citationNumber?: number
}

export default function CodeChunkCard({ chunk, citationNumber }: Props) {
  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-200 hover:border-white/[0.12]"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{
          background: 'rgba(255,255,255,0.02)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {citationNumber !== undefined && (
            <span
              className="shrink-0 font-mono text-[10px] rounded-md px-1.5 py-0.5"
              style={{
                background: 'rgba(99,102,241,0.15)',
                border: '1px solid rgba(99,102,241,0.25)',
                color: '#a5b4fc',
              }}
            >
              [{citationNumber}]
            </span>
          )}
          <span className="text-[11px] font-mono text-white/30 truncate">
            {chunk.file_path}
          </span>
          <span className="text-[10px] text-white/15 shrink-0">
            :{chunk.start_line}–{chunk.end_line}
          </span>
        </div>
        <span
          className="shrink-0 text-[10px] font-mono ml-3 px-2 py-0.5 rounded-md"
          style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.25)' }}
        >
          {chunk.symbol_name}
        </span>
      </div>
      <pre
        className="px-4 py-3.5 text-[12px] font-mono overflow-x-auto leading-[1.75]"
        style={{ color: 'rgba(255,255,255,0.5)' }}
      >
        <code>{chunk.content}</code>
      </pre>
    </div>
  )
}
