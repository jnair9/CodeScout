import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { QueryResponse } from '../api/client'
import CodeChunkCard from './CodeChunkCard'

interface Props {
  query: string
  data: QueryResponse
}

export default function ChatMessage({ query, data }: Props) {
  const [showSources, setShowSources] = useState(false)
  const { answer, citations } = data.response
  const chunks = data.results

  const citationMap = new Map(citations.map((c) => [c.citation_number, c]))

  const citedChunks = citations
    .map((c) => chunks.find((ch) => ch.symbol_name === c.symbol_name && ch.file_path === c.file_path))
    .filter(Boolean)

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
    <div className="flex flex-col gap-3 anim-fade-in">
      <div className="flex justify-end">
        <div
          className="max-w-md px-4 py-2.5 rounded-2xl text-[14px] text-white/90"
          style={{
            background: 'rgba(99,102,241,0.18)',
            border: '1px solid rgba(99,102,241,0.22)',
            letterSpacing: '-0.01em',
          }}
        >
          {query}
        </div>
      </div>

      <div className="flex flex-col gap-3 pl-2">
        <p
          className="text-[15px] text-white/75 leading-7"
          style={{ letterSpacing: '-0.01em' }}
        >
          {renderAnswer(answer)}
        </p>

        {(citedChunks.length > 0 || uncitedChunks.length > 0) && (
          <button
            onClick={() => setShowSources((o) => !o)}
            className="self-start flex items-center gap-1.5 text-[12px] text-white/25 hover:text-white/50 transition-colors"
            style={{ letterSpacing: '-0.01em' }}
          >
            <span>{citations.length} source{citations.length !== 1 ? 's' : ''}</span>
            <ChevronDown
              size={11}
              style={{ transform: showSources ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
            />
          </button>
        )}

        {showSources && (
          <div className="flex flex-col gap-2 anim-fade-in">
            {citedChunks.map((chunk, i) => (
              <CodeChunkCard
                key={i}
                chunk={chunk!}
                citationNumber={citations.find((c) => c.symbol_name === chunk!.symbol_name)?.citation_number}
              />
            ))}
            {uncitedChunks.length > 0 && (
              <>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/15 px-1 mt-2">
                  Also retrieved
                </p>
                {uncitedChunks.map((chunk, i) => (
                  <CodeChunkCard key={i} chunk={chunk} />
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
