'use client'

import { useCompletion } from 'ai/react'

export default function Completion() {
  const { completion, input, handleInputChange, handleSubmit } = useCompletion()

  return (
    <div className='w-full h-fit max-w-md py-4 flex flex-col'>
      <div>
        <span className='text-xl font-bold'>Completion</span>
      </div>

      <div className='flex-1 min-h-[32rem] mb-2 p-4 bg-neutral-950 border border-neutral-700 rounded whitespace-pre-wrap'>
        {completion}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          className='w-full max-w-md p-2 bg-neutral-900 border border-neutral-700 rounded shadow-xl'
          value={input}
          placeholder='Enter a prompt...'
          onChange={handleInputChange}
        />
      </form>
    </div>
  )
}