import 'server-only'
import path from 'path'
import fs from 'fs/promises'
import { ChromaClient } from 'chromadb'
import { Chroma } from 'langchain/vectorstores/chroma'
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import type { Document } from 'langchain/document'

const TEST_COLLECTION_NAME = 'test-collection-0'
const PDF_URLS = [
  'https://cdn.www.elektron.se/media/downloads/digitakt/Digitakt_User_Manual_ENG_OS1.50_230303.pdf'
]

class VectorStoreManager {

  docs: Document<Record<string, any>>[] = []
  vectorStore: Chroma | null = null

  constructor() {
    console.log(`[VectorStoreManager] VectorStore constructed!`)
  }

  async init() {
    // TODO: Check if vectorStore exists
    // - If it does, load it
    // - If it doesn't, create it
    // const vectorStore = await this.create()
    const vectorStore = await this.load()
    
    return vectorStore
  }

  async create() {
    await this.loadFiles()
    console.log(`[VectorStoreManager.create] docs: `, this.docs.length)
    const vectorStore = await Chroma.fromDocuments(
      this.docs,
      new OpenAIEmbeddings(),
      {
        collectionName: TEST_COLLECTION_NAME
      }
    )
    this.vectorStore = vectorStore
    console.log(`[VectorStoreManager.create] vectorStore created!`)
    return vectorStore
  }

  async load() {
    const vectorStore = await Chroma.fromExistingCollection(new OpenAIEmbeddings(), {
      collectionName: TEST_COLLECTION_NAME
    })
    this.vectorStore = vectorStore
    console.log(`[VectorStoreManager.load] vectorStore loaded!`)
    return vectorStore
  }

  async addDocuments() {}

  async loadFiles(urls: string[] = PDF_URLS) {
    for (let url of urls) {
      const pdfDocs = await this.loadRemotePDF(url)
      this.docs.push(...pdfDocs)
    }
  }

  async loadRemotePDF(url: string) {
    console.log(`[VectorStoreManager.loadRemotePDF] Fetching PDF at ${url}...`)
    const pdfBlob = await this.fetchPDFBlob(url)
    if (!pdfBlob) {
      throw new Error(`[VectorStoreManager.loadRemotePDF] Failed`)
    }
    const loader = new PDFLoader(pdfBlob)
    const docs = await loader.load()
    console.log(`[VectorStoreManager.loadRemotePDF] ${docs.length} docs from Blob`)
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    })
    const splitDocs = await textSplitter.splitDocuments(docs)
    console.log(`[VectorStoreManager.loadRemotePDF] ${splitDocs.length} splitDocs from Blob`)

    return splitDocs
  }

  async fetchPDFBlob(url: string) {
    try {
      const res = await fetch(url)
      if (!res.ok) {
        throw new Error(`[VectorStoreManager.fetchPDFBlob] ${res.status} ${res.statusText}`)
      }
      return await res.blob()
    } catch (error) {
      console.error(error)
    }
  }
}

export const vectorStoreManager = new VectorStoreManager()

export default vectorStoreManager