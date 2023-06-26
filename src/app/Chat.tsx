'use client'

import { useChat } from 'ai/react'

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat()

  return (
    <div className='w-full h-full py-4 flex flex-col'>
      <div className='mb-2'>
        <span className='text-xl font-bold'>Chat</span>
      </div>

      <div className='flex-1 min-h-[32rem] mb-2 p-4 bg-neutral-950 border border-neutral-800 rounded'>
        {messages.map(m => (
          <div key={m.id}>
            {m.role === 'user' ? 'User: ' : 'AI: '}
            {m.content}
          </div>
        ))}
      </div>
 
      <form onSubmit={handleSubmit} className='flex flex-row justify-between gap-2'>
        <input
          className='flex-1 max-w-md p-2 bg-neutral-900 border border-neutral-800 rounded shadow-xl'
          value={input}
          placeholder='Enter a message...'
          onChange={handleInputChange}
        />
        <button type='submit' className='p-2 bg-neutral-900 border border-neutral-800 rounded hover:bg-neutral-800 hover:border-neutral-700'>Send</button>
      </form>
    </div>
  )
}