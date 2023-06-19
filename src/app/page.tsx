import Image from 'next/image'
import Chat from './Chat'
import Completion from './Completion'
import Documents from './Documents'

export default function Home() {
  return (
    <main className='min-h-screen p-4 md:p-12 flex flex-col justify-between'>
      <div className='flex flex-col md:flex-row justify-between items-center gap-4'>  
        <Chat />
        <Completion />
      </div>
      <Documents />
    </main>
  )
}
