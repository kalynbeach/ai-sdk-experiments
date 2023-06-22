import FileList from './FileList'

export default function Files() {
  return (
    <div className='w-full h-fit max-w-md py-4 flex flex-col'>
      <div className='mb-2'>
        <span className='text-xl font-bold'>Files</span>
      </div>

      <div className='basis-64 min-h-[16rem] mb-2 p-4 bg-neutral-950 border border-neutral-800 rounded'>
        <FileList />
      </div>

      <div className='basis-32 min-h-[8rem] mb-2 p-4 bg-neutral-900 border border-neutral-700 rounded'>
        🚧 File Upload 🚧
      </div>
    </div>
  )
}