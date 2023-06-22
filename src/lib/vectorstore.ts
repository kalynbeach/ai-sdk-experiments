// import 'server-only'
import path from 'path'
import fs from 'fs/promises'
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory'
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { HNSWLib } from 'langchain/vectorstores/hnswlib'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import type { Document } from 'langchain/document'

const VECTOR_STORE_DIRECTORY = path.resolve('src/data/index')
const VECTOR_STORE_FILE = path.resolve('src/data/index/hnswlib.index')
const PDF_DIRECTORY = path.resolve('src/data/pdf')
const PDF_URLS = [
  'https://cdn.www.elektron.se/media/downloads/digitakt/Digitakt_User_Manual_ENG_OS1.50_230303.pdf'
]

class VectorStore {
  
  docs: Document<Record<string, any>>[] = []
  store: HNSWLib | null = null

  constructor() {
    console.log(`[VectorStore] VectorStore constructed!`)
  }

  async init(): Promise<HNSWLib> {
    const vectorStoreExists = await this.indexExists()
    if (vectorStoreExists) {
      this.store = await this.load()
      console.log(`[VectorStore.init] VectorStore loaded.`)
    } else {
      this.store = await this.create()
      console.log(`[VectorStore.init] VectorStore created.`)
    }
    console.log(`[VectorStore.init] VectorStore initialized!`)
    return this.store
  }

  async create(): Promise<HNSWLib> {
    // const docs = await this.loadPDFDirectory('src/data/pdf')
    for (let url of PDF_URLS) {
      const docs = await this.loadRemotePDF(url)
      this.docs.push(...docs)
    }
    console.log(`[VectorStore.create] Loaded documents (this.docs): `, this.docs.length)
    const vectorStore = await HNSWLib.fromDocuments(this.docs, new OpenAIEmbeddings())
    console.log(`[VectorStore.create] VectorStore created.`)
    await this.save(vectorStore)
    return vectorStore
  }

  async load(directory: string = VECTOR_STORE_DIRECTORY): Promise<HNSWLib> {
    const loadedVectorStore = await HNSWLib.load(directory, new OpenAIEmbeddings())
    console.log(`[VectorStore.load] VectorStore loaded.`)
    return loadedVectorStore
  }

  async save(vectorStore: HNSWLib, directory: string = VECTOR_STORE_DIRECTORY): Promise<void> {
    await vectorStore.save(directory)
    console.log(`[VectorStore.save] VectorStore saved to ${directory}`)
  }

  async indexExists(): Promise<boolean> {
    try {
      await fs.access(VECTOR_STORE_FILE, fs.constants.F_OK)
      console.log(`[VectorStore.indexExists] Existing index found.`)
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }

  async loadPDFDirectory(directory: string = PDF_DIRECTORY): Promise<Document<Record<string, any>>[]> {
    const directoryLoader = new DirectoryLoader(directory, { '.pdf': (path: string) => new PDFLoader(path) })
    const docs = await directoryLoader.load()
    console.log(`[VectorStore.loadPDFDirectory] ${docs.length} docs from ${directory}`)

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    })

    const splitDocs = await textSplitter.splitDocuments(docs)
    console.log(`[VectorStore.loadPDFDirectory] ${splitDocs.length} splitDocs`)

    return splitDocs
  }

  async loadRemotePDF(url: string): Promise<Document<Record<string, any>>[]> {
    console.log(`[VectorStore.loadRemotePDF] Fetching PDF at ${url}...`)
    const pdfBlob = await this.fetchPDFBlob(url)
    if (!pdfBlob) {
      throw new Error(`[VectorStore.loadRemotePDF] Failed`)
    }
    const loader = new PDFLoader(pdfBlob)
    const docs = await loader.load()
    console.log(`[VectorStore.loadPDFBlob] ${docs.length} docs from Blob`)
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    })
    const splitDocs = await textSplitter.splitDocuments(docs)
    console.log(`[VectorStore.loadPDFBlob] ${splitDocs.length} splitDocs from Blob`)

    return splitDocs
  }

  async fetchPDFBlob(url: string): Promise<Blob | undefined> {
    try {
      const res = await fetch(url)
      if (!res.ok) {
        throw new Error(`[VectorStore.fetchPDFBlob] ${res.status} ${res.statusText}`)
      }
      return await res.blob()
    } catch (error) {
      console.error(error)
    }
  }
}

export const vectorStore = new VectorStore()

export default VectorStore