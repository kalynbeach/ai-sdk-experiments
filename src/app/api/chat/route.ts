import path from 'path'
import fs from 'fs/promises'
import { StreamingTextResponse, LangChainStream, Message } from 'ai'
import { CallbackManager } from 'langchain/callbacks'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { ConversationalRetrievalQAChain } from 'langchain/chains'
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { AIChatMessage, HumanChatMessage } from 'langchain/schema'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { BufferMemory } from 'langchain/memory'
import { HNSWLib } from 'langchain/vectorstores/hnswlib'
import type { Document } from 'langchain/document'
// import VectorStore from '@/lib/vectorstore'

const VECTOR_STORE_DIRECTORY = path.resolve('src/data/index')
const VECTOR_STORE_FILE = path.resolve('src/data/index/hnswlib.index')
const PDF_DIRECTORY = path.resolve('src/data/pdf')
const PDF_URLS = [
  'https://cdn.www.elektron.se/media/downloads/digitakt/Digitakt_User_Manual_ENG_OS1.50_230303.pdf'
]

async function vectorStoreExists() {
  try {
    await fs.access(VECTOR_STORE_FILE, fs.constants.F_OK)
    console.log(`[vectorStoreExists] Existing index found.`)
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

async function initVectorStore() {
  const exists = await vectorStoreExists()
  let vectorStore: HNSWLib
  if (exists) {
    vectorStore = await loadVectorStore()
    console.log(`[initVectorStore] VectorStore loaded.`)
  } else {
    vectorStore = await createVectorStore()
    console.log(`[initVectorStore] VectorStore created.`)
  }
  console.log(`[initVectorStore] VectorStore initialized!`)
  return vectorStore
}

async function createVectorStore() {
  let docs: Document<Record<string, any>>[] = []
  for (let url of PDF_URLS) {
    const pdfDocs = await loadRemotePDF(url)
    docs.push(...pdfDocs)
  }
  console.log(`[createVectorStore] Loaded documents (docs): `, docs.length)
  const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings())
  console.log(`[createVectorStore] VectorStore created.`)
  await saveVectorStore(vectorStore)
  return vectorStore
}

async function saveVectorStore(vectorStore: HNSWLib, directory: string = VECTOR_STORE_DIRECTORY) {
  await vectorStore.save(directory)
  console.log(`[saveVectorStore] VectorStore saved to ${directory}`)
}

async function loadVectorStore(directory: string = VECTOR_STORE_DIRECTORY) {
  const loadedVectorStore = await HNSWLib.load(directory, new OpenAIEmbeddings())
  console.log(`[loadVectorStore] VectorStore loaded.`)
  return loadedVectorStore
}

async function loadRemotePDF(url: string) {
  console.log(`[loadRemotePDF] Fetching PDF at ${url}...`)
  const pdfBlob = await fetchPDFBlob(url)
  if (!pdfBlob) {
    throw new Error(`[loadRemotePDF] Failed`)
  }
  const loader = new PDFLoader(pdfBlob)
  const docs = await loader.load()
  console.log(`[loadRemotePDF] ${docs.length} docs from Blob`)
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  })
  const splitDocs = await textSplitter.splitDocuments(docs)
  console.log(`[VectorStore.loadRemotePDF] ${splitDocs.length} splitDocs from Blob`)
  return splitDocs
}

async function fetchPDFBlob(url: string) {
  try {
    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`[fetchPDFBlob] ${res.status} ${res.statusText}`)
    }
    return await res.blob()
  } catch (error) {
    console.error(error)
  }
}

export const runtime = 'edge'

export async function POST(req: Request) {
  const { messages } = await req.json()
  const { stream, handlers } = LangChainStream()

  const llm = new ChatOpenAI({
    streaming: true,
    callbackManager: CallbackManager.fromHandlers(handlers)
  })
  // console.log(`[api/chat] llm: `, llm)

  // llm
  //   .call(
  //     (messages as Message[]).map(m =>
  //       m.role == 'user'
  //         ? new HumanChatMessage(m.content)
  //         : new AIChatMessage(m.content)
  //     )
  //   )
  //   .catch(console.error)

  // const vectorStore = new VectorStore()
  // const store = await vectorStore.init()
  const vectorStore = await initVectorStore()

  const chain = ConversationalRetrievalQAChain.fromLLM(
    llm,
    vectorStore.asRetriever(),
    {
      memory: new BufferMemory({
        memoryKey: 'chat_history'
      })
    }
  )

  const question = messages[messages.length - 1].content

  const res = await chain.call({ question })
  console.log(`[api/chat] res: `, res)
  
  return new StreamingTextResponse(stream)
}