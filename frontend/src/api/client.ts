import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
})

export interface Citation {
  citation_number: number
  symbol_name: string
  file_path: string
  start_line: number
  end_line: number
}

export interface CodeChunk {
  id: string
  repo_url: string
  file_path: string
  symbol_name: string
  symbol_type: string
  parent_class: string | null
  content: string
  start_line: number
  end_line: number
  language: string
  distance?: number
}

export interface IngestResponse {
  message: string
  url: string
  'num chunks ingested': number
}

export interface QueryResponse {
  'query:': string
  message: string
  results: CodeChunk[]
  response: {
    answer: string
    citations: Citation[]
  }
}

export async function ingestRepo(repoUrl: string): Promise<IngestResponse> {
  const { data } = await api.post('/ingest/', { repo_url: repoUrl })
  return data
}

export interface HistoryMessage {
  role: 'user' | 'model'
  content: string
}

export async function queryRepo(query: string, repoUrl: string, history: HistoryMessage[] = []): Promise<QueryResponse> {
  const { data } = await api.post('/query/', { query, repo_url: repoUrl, history })
  return data
}

export interface SkillFileResponse {
  markdown: string
  skill_file_tokens: number
  estimated_codebase_tokens: number
  reduction_pct: number
  chunks_processed: number
}

export async function generateSkillFile(repoUrl: string): Promise<SkillFileResponse> {
  const { data } = await api.post('/skillfile/', { repo_url: repoUrl })
  return data
}

export interface BenchmarkRun {
  input_tokens: number
  output_tokens: number
  answer_preview: string
}

export interface BenchmarkResponse {
  task: string
  no_context: BenchmarkRun
  raw_codebase: BenchmarkRun
  skill_file: BenchmarkRun
  skill_vs_raw_input_reduction_pct: number
}

export async function runBenchmark(
  repoUrl: string,
  task: string,
  skillFileMarkdown: string,
): Promise<BenchmarkResponse> {
  const { data } = await api.post('/benchmark/', {
    repo_url: repoUrl,
    task,
    skill_file_markdown: skillFileMarkdown,
  })
  return data
}
