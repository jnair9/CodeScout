import { useState, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ingestRepo, queryRepo } from './api/client'
import type { QueryResponse } from './api/client'
import Landing from './components/Landing'
import AnswerPanel from './components/AnswerPanel'
import DevLogger from './components/DevLogger'
import { useLogger } from './context/LoggerContext'
import { Search, GitBranch, CheckCircle, AlertCircle, Terminal, ArrowLeft } from 'lucide-react'
import './index.css'

function Skeleton() {
  return (
    <div className="flex flex-col gap-4 mt-10 anim-fade-in">
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-5/6" />
      <div className="skeleton h-4 w-2/3" />
      <div className="flex flex-col gap-3 mt-4">
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="skeleton h-8" style={{ borderRadius: 0 }} />
          <div className="flex flex-col gap-2 p-4">
            <div className="skeleton h-3 w-full" />
            <div className="skeleton h-3 w-5/6" />
            <div className="skeleton h-3 w-4/5" />
          </div>
        </div>
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="skeleton h-8" style={{ borderRadius: 0 }} />
          <div className="flex flex-col gap-2 p-4">
            <div className="skeleton h-3 w-full" />
            <div className="skeleton h-3 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  )
}

function MainApp({ onBack }: { onBack: () => void }) {
  const [repoUrl, setRepoUrl] = useState('')
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<QueryResponse | null>(null)
  const [ingestedUrl, setIngestedUrl] = useState<string | null>(null)
  const [loggerOpen, setLoggerOpen] = useState(false)
  const { addLog, updateLog } = useLogger()
  const resultsRef = useRef<HTMLDivElement>(null)

  const ingest = useMutation({
    mutationFn: () => {
      const id = addLog({
        timestamp: new Date(),
        type: 'ingest',
        endpoint: 'POST /ingest/',
        requestBody: { repo_url: repoUrl },
        status: 'pending',
      })
      const start = Date.now()
      return ingestRepo(repoUrl)
        .then((data) => {
          updateLog(id, { status: 'success', responseBody: data, durationMs: Date.now() - start })
          return data
        })
        .catch((err) => {
          updateLog(id, { status: 'error', errorMessage: String(err), durationMs: Date.now() - start })
          throw err
        })
    },
    onSuccess: (data) => {
      setIngestedUrl(data.url)
      setResult(null)
    },
  })

  const search = useMutation({
    mutationFn: () => {
      const url = ingestedUrl ?? repoUrl
      const id = addLog({
        timestamp: new Date(),
        type: 'query',
        endpoint: 'POST /query/',
        requestBody: { query, repo_url: url },
        status: 'pending',
      })
      const start = Date.now()
      return queryRepo(query, url)
        .then((data) => {
          updateLog(id, { status: 'success', responseBody: data, durationMs: Date.now() - start })
          return data
        })
        .catch((err) => {
          updateLog(id, { status: 'error', errorMessage: String(err), durationMs: Date.now() - start })
          throw err
        })
    },
    onSuccess: (data) => {
      setResult(data)
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    },
  })

  const handleIngest = (e: React.FormEvent) => {
    e.preventDefault()
    if (repoUrl.trim()) ingest.mutate()
  }

  const handleQuery = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim() && (ingestedUrl || repoUrl.trim())) search.mutate()
  }

  const isReady = !!(ingestedUrl || repoUrl.trim())

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 90% 55% at 50% -5%, rgba(99,102,241,0.16) 0%, transparent 62%)',
        }}
      />

      <header
        className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-8 h-14"
        style={{
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[13px] font-medium text-white/35 hover:text-white/65 transition-colors"
          style={{ letterSpacing: '-0.01em' }}
        >
          <ArrowLeft size={13} />
          CodeScout
        </button>

        <button
          onClick={() => setLoggerOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-white/30 hover:text-white/60 border border-white/[0.07] hover:border-white/[0.13] hover:bg-white/[0.04] transition-all"
          style={{ letterSpacing: '-0.01em' }}
        >
          <Terminal size={11} />
          Dev
        </button>
      </header>

      <div className="relative flex-1 flex flex-col items-center justify-start px-6 pb-20 pt-20">
        <div
          className="w-full max-w-2xl"
          style={{
            marginTop: result || search.isPending ? 0 : 'clamp(0px, calc(50vh - 400px), 140px)',
            transition: 'margin-top 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >

          <div className="text-center mb-12 anim-fade-up">
            <h2
              className="font-semibold text-white mb-3"
              style={{ fontSize: '38px', letterSpacing: '-0.04em', lineHeight: 1.08 }}
            >
              Ask anything about<br />your codebase.
            </h2>
            <p className="text-[16px] text-white/30" style={{ letterSpacing: '-0.015em' }}>
              Ingest a GitHub repo, then search with natural language.
            </p>
          </div>

          <div className="anim-fade-up-delay flex flex-col gap-4">
            <form onSubmit={handleIngest}>
              <div
                className={`input-field rounded-2xl px-5 py-4 flex items-center gap-4 ${ingest.isPending ? 'input-loading' : ''}`}
              >
                <div
                  className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)' }}
                >
                  <GitBranch size={15} style={{ color: '#a5b4fc' }} />
                </div>
                <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-white/20">
                    Repository
                  </span>
                  <input
                    type="text"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/owner/repo"
                    className="w-full bg-transparent text-[15px] text-white placeholder:text-white/20 focus:outline-none"
                    style={{ letterSpacing: '-0.015em' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={ingest.isPending || !repoUrl.trim()}
                  className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all disabled:opacity-35 disabled:cursor-not-allowed text-white"
                  style={{
                    background: ingest.isPending
                      ? 'rgba(99,102,241,0.4)'
                      : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    letterSpacing: '-0.01em',
                    boxShadow: ingest.isPending ? 'none' : '0 0 28px rgba(99,102,241,0.4)',
                  }}
                >
                  {ingest.isPending ? <span className="spinner" /> : null}
                  {ingest.isPending ? 'Ingesting…' : 'Ingest'}
                </button>
              </div>
            </form>

            {ingest.isSuccess && (
              <div
                className="anim-fade-in flex items-center gap-2.5 px-5 py-3 rounded-xl text-[13px]"
                style={{
                  background: 'rgba(52,211,153,0.07)',
                  border: '1px solid rgba(52,211,153,0.18)',
                  color: '#6ee7b7',
                  letterSpacing: '-0.01em',
                }}
              >
                <CheckCircle size={14} className="shrink-0" />
                <span>
                  <span className="font-semibold">{ingest.data['num chunks ingested']} chunks</span> indexed from{' '}
                  <span className="font-mono text-[12px]" style={{ color: 'rgba(110,231,183,0.6)' }}>
                    {ingest.data.url}
                  </span>
                </span>
              </div>
            )}

            {ingest.isError && (
              <div
                className="anim-fade-in flex items-center gap-2.5 px-5 py-3 rounded-xl text-[13px]"
                style={{
                  background: 'rgba(239,68,68,0.07)',
                  border: '1px solid rgba(239,68,68,0.18)',
                  color: '#fca5a5',
                  letterSpacing: '-0.01em',
                }}
              >
                <AlertCircle size={14} className="shrink-0" />
                Ingestion failed. Check the repo URL and try again.
              </div>
            )}

            <form onSubmit={handleQuery}>
              <div
                className={`input-field rounded-2xl px-5 py-4 flex items-center gap-4 ${search.isPending ? 'input-loading' : ''}`}
                style={{ opacity: isReady ? 1 : 0.45, transition: 'opacity 0.3s' }}
              >
                <div
                  className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <Search size={15} className="text-white/40" />
                </div>
                <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-white/20">
                    Ask
                  </span>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={isReady ? 'How does authentication work?' : 'Ingest a repo first…'}
                    disabled={!isReady}
                    className="w-full bg-transparent text-[15px] text-white placeholder:text-white/20 focus:outline-none disabled:cursor-not-allowed"
                    style={{ letterSpacing: '-0.015em' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={search.isPending || !query.trim() || !isReady}
                  className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed text-white/80"
                  style={{
                    background: 'rgba(255,255,255,0.09)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {search.isPending ? <span className="spinner" /> : null}
                  {search.isPending ? 'Searching…' : 'Search'}
                </button>
              </div>
            </form>

            {search.isError && (
              <div
                className="anim-fade-in flex items-center gap-2.5 px-5 py-3 rounded-xl text-[13px]"
                style={{
                  background: 'rgba(239,68,68,0.07)',
                  border: '1px solid rgba(239,68,68,0.18)',
                  color: '#fca5a5',
                  letterSpacing: '-0.01em',
                }}
              >
                <AlertCircle size={14} className="shrink-0" />
                Query failed. Make sure the repo is ingested.
              </div>
            )}
          </div>

          <div ref={resultsRef}>
            {search.isPending && <Skeleton />}
            {result && !search.isPending && (
              <div className="mt-10 anim-slide-up">
                <AnswerPanel data={result} />
              </div>
            )}
          </div>
        </div>
      </div>

      <DevLogger open={loggerOpen} onClose={() => setLoggerOpen(false)} />
    </div>
  )
}

export default function App() {
  const [showApp, setShowApp] = useState(false)

  return showApp ? <MainApp onBack={() => setShowApp(false)} /> : <Landing onStart={() => setShowApp(true)} />
}
