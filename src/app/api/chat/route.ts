import { StreamingTextResponse, LangChainStream, Message } from 'ai'
import { CallbackManager } from 'langchain/callbacks'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { ConversationalRetrievalQAChain } from 'langchain/chains'
import { BufferMemory } from 'langchain/memory'
import vectorStoreManager from '@/lib/vectorStoreManager'
// import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
// import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
// import { AIChatMessage, HumanChatMessage } from 'langchain/schema'
// import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
// import type { Document } from 'langchain/document'


// export const runtime = 'edge'

export async function POST(req: Request) {
  const { messages } = await req.json()
  const { stream, handlers } = LangChainStream()

  const llm = new ChatOpenAI({
    streaming: true,
    callbackManager: CallbackManager.fromHandlers(handlers)
  })

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
  // const vectorStore = await initVectorStore()
  const vectorStore = await vectorStoreManager.init()

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