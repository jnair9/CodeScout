import type { QueryResponse } from '../api/client'
import CodeChunkCard from './CodeChunkCard'

interface Props {
  data: QueryResponse
}

export default function AnswerPanel({ data }: Props) {
  const { answer, citations } = data.response
  const chunks = data.results

  const citationMap = new Map(citations.map((c) => [c.citation_number, c]))

  const uncitedChunks = chunks.filter(
    (ch) => !citations.some((c) => c.symbol_name === ch.symbol_name && c.file_path === ch.file_path)
  )

  const renderAnswer = (text: string) => {
    const parts = text.split(/(\[\d+\])/g)
    return parts.map((part, i) => {
      const match = part.match(/^\[(\d+)\]$/)
      if (match) {
        const num = parseInt(match[1])
        const citation = citationMap.get(num)
        return (
          <span
            key={i}
            className="inline-flex items-center gap-1 font-mono text-[10px] rounded-md px-1.5 py-0.5 mx-0.5 align-middle"
            style={{
              background: 'rgba(99,102,241,0.12)',
              border: '1px solid rgba(99,102,241,0.22)',
              color: '#a5b4fc',
            }}
          >
            {part}
            {citation && (
              <span style={{ color: 'rgba(255,255,255,0.25)' }}>
                {citation.file_path.split('/').pop()}:{citation.start_line}
              </span>
            )}
          </span>
        )
      }
      return <span key={i}>{part}</span>
    })
  }

  return (
    <div className="anim-fade-in flex flex-col gap-8">
      <div
        className="rounded-2xl p-6"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <p
          className="leading-7 text-white/70"
          style={{ fontSize: '15px', letterSpacing: '-0.01em' }}
        >
          {renderAnswer(answer)}
        </p>
      </div>

      {citations.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/20 px-1">
            Sources
          </p>
          {citations.map((citation, i) => {
            const chunk = chunks.find(
              (ch) => ch.symbol_name === citation.symbol_name && ch.file_path === citation.file_path
            )
            if (!chunk) return null
            return <CodeChunkCard key={i} chunk={chunk} citationNumber={citation.citation_number} />
          })}
        </div>
      )}

      {uncitedChunks.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/20 px-1">
            Also Retrieved
          </p>
          {uncitedChunks.map((chunk, i) => (
            <CodeChunkCard key={i} chunk={chunk} />
          ))}
        </div>
      )}
    </div>
  )
}
