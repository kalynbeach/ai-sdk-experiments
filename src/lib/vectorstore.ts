import 'server-only'

import path from 'path'
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory'
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { HNSWLib } from 'langchain/vectorstores/hnswlib'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { ConversationalRetrievalQAChain } from 'langchain/chains'
import { BufferMemory } from 'langchain/memory'
import type { Document } from 'langchain/document'

const PDF_DIRECTORY = path.resolve('src/data/pdf')
const VECTOR_STORE_DIRECTORY = path.resolve('src/data/index')

class VectorStore {
  
  store: HNSWLib | null = null

  constructor() {
    console.log(`[VectorStore] VectorStore initialized`)
  }

  async init(): Promise<HNSWLib> {
    // Check if vector store exists
    // If it does, load it
    // If it doesn't, create it
    const vectorStore = await this.create()
    console.log(`[initVectorStore] VectorStore initialized: `, vectorStore)
    this.store = vectorStore
    // Return the vector store
    return vectorStore
  }

  async loadPDFDirectory(directory: string = PDF_DIRECTORY): Promise<Document<Record<string, any>>[]> {
    const directoryLoader = new DirectoryLoader(directory, { '.pdf': (path: string) => new PDFLoader(path) })
    const docs = await directoryLoader.load()
    console.log(`[loadPDFDirectory] ${docs.length} docs from ${directory}`)

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    })

    const splitDocs = await textSplitter.splitDocuments(docs)
    console.log(`[loadPDFDirectory] ${splitDocs.length} splitDocs`)

    return splitDocs
  }

  async create(): Promise<HNSWLib> {
    const docs = await this.loadPDFDirectory('src/data/pdf')
    const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings())
    console.log(`[VectorStore.create] VectorStore created: `, vectorStore)
    await this.save(vectorStore)
    return vectorStore
  }

  async load(directory: string = VECTOR_STORE_DIRECTORY): Promise<HNSWLib> {
    // TODO: Check if index exists in vector store directory
    const loadedVectorStore = await HNSWLib.load(directory, new OpenAIEmbeddings())
    console.log(`[VectorStore.load] VectorStore loaded: `, loadedVectorStore)
    return loadedVectorStore
  }

  async save(vectorStore: HNSWLib, directory: string = VECTOR_STORE_DIRECTORY): Promise<void> {
    await vectorStore.save(directory)
    console.log(`[VectorStore.save] VectorStore saved to ${directory}`)
  }
}

export const vectorStore = new VectorStore()

export default VectorStore