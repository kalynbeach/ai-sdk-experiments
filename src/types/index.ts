import type { Chroma } from 'langchain/vectorstores/chroma'
import type { Document } from 'langchain/document'

export interface VectorStoreManager {
  docs: Document<Record<string, any>>[]
  store: Chroma | null
  init: (name: string) => Promise<Chroma>
  create: (name: string) => Promise<Chroma>
  load: (name: string) => Promise<Chroma>
  addDocuments: (docs: Document<Record<string, any>>[]) => Promise<void>
  loadFiles: (urls: string[]) => Promise<void>
  loadRemotePDF: (url: string) => Promise<Document<Record<string, any>>[]>
  fetchPDFBlob: (url: string) => Promise<Blob>
}

export type VectorStoreFile = {
  name: string
  url: string
  tags: string[]
}