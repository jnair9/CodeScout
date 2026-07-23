import { useState } from 'react'
import { X, Copy, Download, CheckCircle, Zap } from 'lucide-react'
import type { SkillFileResponse } from '../api/client'
import BenchmarkModal from './BenchmarkModal'

interface Props {
  data: SkillFileResponse
  repoUrl: string
  onClose: () => void
}

export default function SkillFileModal({ data, repoUrl, onClose }: Props) {
  const [copied, setCopied] = useState(false)
  const [showBenchmark, setShowBenchmark] = useState(false)

  if (showBenchmark) {
    return (
      <BenchmarkModal
        repoUrl={repoUrl}
        skillFileMarkdown={data.markdown}
        onClose={onClose}
        onBack={() => setShowBenchmark(false)}
      />
    )
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(data.markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([data.markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'CLAUDE.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-2xl flex flex-col rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(10,10,10,0.95)',
          border: '1px solid rgba(255,255,255,0.08)',
          maxHeight: '85vh',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-[14px] font-semibold text-white" style={{ letterSpacing: '-0.02em' }}>
              CLAUDE.md
            </span>
            <span className="text-[12px] text-white/30" style={{ letterSpacing: '-0.01em' }}>
              Drop this in your repo root for Claude Code to pick up automatically
            </span>
          </div>
          <button onClick={onClose} className="text-white/25 hover:text-white/60 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Token stats */}
        <div
          className="flex items-center gap-6 px-6 py-3 shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/20">Skill file</span>
            <span className="text-[13px] font-mono text-white/70">{data.skill_file_tokens.toLocaleString()} tokens</span>
          </div>
          <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/20">Raw codebase</span>
            <span className="text-[13px] font-mono text-white/70">~{data.estimated_codebase_tokens.toLocaleString()} tokens</span>
          </div>
          <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/20">Reduction</span>
            <span
              className="text-[13px] font-semibold font-mono"
              style={{ color: '#6ee7b7' }}
            >
              {data.reduction_pct}%
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setShowBenchmark(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all"
              style={{
                background: 'rgba(99,102,241,0.1)',
                border: '1px solid rgba(99,102,241,0.2)',
                color: '#a5b4fc',
                letterSpacing: '-0.01em',
              }}
            >
              <Zap size={11} />
              Benchmark
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all"
              style={{
                background: copied ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.06)',
                border: copied ? '1px solid rgba(52,211,153,0.25)' : '1px solid rgba(255,255,255,0.1)',
                color: copied ? '#6ee7b7' : 'rgba(255,255,255,0.5)',
                letterSpacing: '-0.01em',
              }}
            >
              {copied ? <CheckCircle size={11} /> : <Copy size={11} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-white transition-all"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                letterSpacing: '-0.01em',
                boxShadow: '0 0 16px rgba(99,102,241,0.3)',
              }}
            >
              <Download size={11} />
              Download CLAUDE.md
            </button>
          </div>
        </div>

        {/* Markdown content */}
        <div className="overflow-y-auto flex-1">
          <pre
            className="p-6 text-[12px] leading-6 text-white/60 whitespace-pre-wrap font-mono"
            style={{ letterSpacing: '0em' }}
          >
            {data.markdown}
          </pre>
        </div>
      </div>
    </div>
  )
}
