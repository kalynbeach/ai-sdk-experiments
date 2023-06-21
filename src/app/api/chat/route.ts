import { StreamingTextResponse, LangChainStream, Message } from 'ai'
import { CallbackManager } from 'langchain/callbacks'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { AIChatMessage, HumanChatMessage } from 'langchain/schema'
import { ConversationalRetrievalQAChain } from 'langchain/chains'
import { BufferMemory } from 'langchain/memory'
import VectorStore from '@/lib/vectorstore'

// export const runtime = 'edge'

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

  const vectorStore = new VectorStore()
  const store = await vectorStore.init()

  const chain = ConversationalRetrievalQAChain.fromLLM(
    llm,
    store.asRetriever(),
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