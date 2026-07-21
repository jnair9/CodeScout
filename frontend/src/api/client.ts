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

export async function queryRepo(query: string, repoUrl: string): Promise<QueryResponse> {
  const { data } = await api.post('/query/', { query, repo_url: repoUrl })
  return data
}
