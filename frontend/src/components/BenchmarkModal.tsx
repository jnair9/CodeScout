import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { runBenchmark } from '../api/client'
import type { BenchmarkResponse, BenchmarkRun } from '../api/client'
import { X, Zap, Loader2, ArrowLeft } from 'lucide-react'

interface Props {
  repoUrl: string
  skillFileMarkdown: string
  onClose: () => void
  onBack: () => void
}

// ── Token chart ───────────────────────────────────────────────────────────────

const RUNS_META = [
  { key: 'no_context',   label: 'No context',   inputColor: 'rgba(255,255,255,0.18)', outputColor: 'rgba(255,255,255,0.07)' },
  { key: 'raw_codebase', label: 'Raw codebase', inputColor: 'rgba(251,146,60,0.55)',  outputColor: 'rgba(251,146,60,0.22)'  },
  { key: 'skill_file',   label: 'CLAUDE.md',    inputColor: 'rgba(99,102,241,0.75)',  outputColor: 'rgba(99,102,241,0.3)'   },
] as const

function TokenChart({ result }: { result: BenchmarkResponse }) {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 80)
    return () => clearTimeout(t)
  }, [])

  const runs = {
    no_context:   result.no_context,
    raw_codebase: result.raw_codebase,
    skill_file:   result.skill_file,
  }

  const maxTotal = Math.max(
    ...RUNS_META.map(({ key }) => runs[key].input_tokens + runs[key].output_tokens)
  )

  return (
    <div
      className="flex flex-col gap-1 rounded-xl p-5"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-widest text-white/20 mb-3">
        Token usage comparison
      </p>

      <div className="flex flex-col gap-3">
        {RUNS_META.map(({ key, label, inputColor, outputColor }, i) => {
          const run = runs[key]
          const total = run.input_tokens + run.output_tokens
          const inputW  = (run.input_tokens  / maxTotal) * 100
          const outputW = (run.output_tokens / maxTotal) * 100
          const isSkill = key === 'skill_file'
          const delay   = i * 120

          return (
            <div key={key} className="flex items-center gap-3">
              <span
                className="text-[11px] font-medium shrink-0 text-right"
                style={{ width: 88, color: isSkill ? '#a5b4fc' : 'rgba(255,255,255,0.3)', letterSpacing: '-0.01em' }}
              >
                {label}
              </span>

              <div className="flex-1 flex h-5 rounded-md overflow-hidden gap-px" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div
                  style={{
                    width: animated ? `${inputW}%` : '0%',
                    background: inputColor,
                    borderRadius: '4px 0 0 4px',
                    transition: `width 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
                    boxShadow: isSkill && animated ? '0 0 12px rgba(99,102,241,0.5)' : 'none',
                  }}
                />
                <div
                  style={{
                    width: animated ? `${outputW}%` : '0%',
                    background: outputColor,
                    borderRadius: '0 4px 4px 0',
                    transition: `width 0.75s cubic-bezier(0.16,1,0.3,1) ${delay + 80}ms`,
                  }}
                />
              </div>

              <span
                className="text-[11px] font-mono shrink-0"
                style={{ width: 52, color: isSkill ? '#a5b4fc' : 'rgba(255,255,255,0.3)', letterSpacing: '-0.01em' }}
              >
                {total.toLocaleString()}
              </span>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ background: 'rgba(255,255,255,0.4)' }} />
          <span className="text-[10px] text-white/25">Input tokens</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ background: 'rgba(255,255,255,0.15)' }} />
          <span className="text-[10px] text-white/25">Output tokens</span>
        </div>
      </div>
    </div>
  )
}

// ── Run card ──────────────────────────────────────────────────────────────────

function RunCard({ label, sublabel, run, highlight }: {
  label: string
  sublabel: string
  run: BenchmarkRun
  highlight?: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const total = run.input_tokens + run.output_tokens

  return (
    <div
      className="flex flex-col gap-3 rounded-xl p-4"
      style={{
        background: highlight ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.03)',
        border: highlight ? '1px solid rgba(99,102,241,0.25)' : '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-[12px] font-semibold" style={{ color: highlight ? '#a5b4fc' : 'rgba(255,255,255,0.6)', letterSpacing: '-0.01em' }}>
            {label}
          </span>
          <span className="text-[11px] text-white/25" style={{ letterSpacing: '-0.01em' }}>{sublabel}</span>
        </div>
        <div className="flex gap-4 shrink-0">
          {[['Input', run.input_tokens], ['Output', run.output_tokens], ['Total', total]].map(([k, v]) => (
            <div key={k as string} className="flex flex-col gap-0.5 items-end">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-white/20">{k}</span>
              <span className="text-[12px] font-mono" style={{ color: k === 'Total' && highlight ? '#a5b4fc' : 'rgba(255,255,255,0.6)' }}>
                {(v as number).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <p
          className="text-[11px] text-white/30 leading-5 whitespace-pre-wrap"
          style={{
            letterSpacing: '-0.005em',
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: expanded ? 'unset' : 3,
            overflow: expanded ? 'visible' : 'hidden',
          }}
        >
          {run.answer_preview}
        </p>
        <button
          onClick={() => setExpanded(o => !o)}
          className="self-start text-[10px] font-medium transition-colors"
          style={{ color: highlight ? 'rgba(165,180,252,0.5)' : 'rgba(255,255,255,0.2)', letterSpacing: '-0.01em' }}
        >
          {expanded ? 'Show less' : 'Show full response'}
        </button>
      </div>
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────

export default function BenchmarkModal({ repoUrl, skillFileMarkdown, onClose, onBack }: Props) {
  const [task, setTask] = useState('')
  const [result, setResult] = useState<BenchmarkResponse | null>(null)

  const benchmark = useMutation({
    mutationFn: () => runBenchmark(repoUrl, task, skillFileMarkdown),
    onSuccess: (data) => setResult(data),
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-2xl flex flex-col rounded-2xl overflow-hidden"
        style={{ background: 'rgba(10,10,10,0.95)', border: '1px solid rgba(255,255,255,0.08)', maxHeight: '90vh' }}
      >
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-white/25 hover:text-white/60 transition-colors">
              <ArrowLeft size={14} />
            </button>
            <div className="flex flex-col gap-0.5">
              <span className="text-[14px] font-semibold text-white" style={{ letterSpacing: '-0.02em' }}>Efficiency Benchmark</span>
              <span className="text-[12px] text-white/30" style={{ letterSpacing: '-0.01em' }}>Same task, three context strategies — real token counts from Gemini</span>
            </div>
          </div>
          <button onClick={onClose} className="text-white/25 hover:text-white/60 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 flex flex-col gap-5 p-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && task.trim() && !benchmark.isPending) benchmark.mutate() }}
              placeholder="Enter a task or question about this repo…"
              className="flex-1 bg-transparent text-[14px] text-white placeholder:text-white/20 focus:outline-none px-4 py-3 rounded-xl"
              style={{ border: '1px solid rgba(255,255,255,0.1)', letterSpacing: '-0.01em' }}
            />
            <button
              onClick={() => benchmark.mutate()}
              disabled={!task.trim() || benchmark.isPending}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed text-white shrink-0"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                boxShadow: task.trim() ? '0 0 20px rgba(99,102,241,0.35)' : 'none',
                letterSpacing: '-0.01em',
              }}
            >
              {benchmark.isPending ? <Loader2 size={13} className="animate-spin" /> : <Zap size={13} />}
              {benchmark.isPending ? 'Running…' : 'Run'}
            </button>
          </div>

          {benchmark.isPending && (
            <p className="text-[13px] text-white/25 text-center py-6" style={{ letterSpacing: '-0.01em' }}>
              Running 3 Gemini calls in sequence — this takes ~15–30 seconds
            </p>
          )}

          {result && !benchmark.isPending && (
            <div className="flex flex-col gap-4 anim-fade-in">
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}
              >
                <Zap size={13} style={{ color: '#a5b4fc' }} className="shrink-0" />
                <span className="text-[13px]" style={{ color: 'rgba(165,180,252,0.9)', letterSpacing: '-0.01em' }}>
                  Skill file used <span className="font-semibold">{result.skill_vs_raw_input_reduction_pct}% fewer input tokens</span> than a raw codebase dump — with the same answer quality.
                </span>
              </div>

              <TokenChart result={result} />

              <RunCard label="No context"        sublabel="Bare question, no codebase info"     run={result.no_context}   />
              <RunCard label="Raw codebase dump" sublabel="All indexed chunks concatenated"      run={result.raw_codebase} />
              <RunCard label="CLAUDE.md skill file" sublabel="CodeScout-generated context"       run={result.skill_file}   highlight />
            </div>
          )}

          {benchmark.isError && (
            <p className="text-[13px] text-red-400/70 text-center py-4">Benchmark failed. Try again.</p>
          )}
        </div>
      </div>
    </div>
  )
}
