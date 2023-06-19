export default function Documents() {
  return (
    <div className='w-full h-fit max-w-md py-4 flex flex-col'>
      <div className='mb-2'>
        <span className='text-xl font-bold'>Documents</span>
      </div>

      <div className='flex-1 min-h-[16rem] mb-2 p-4 bg-neutral-950 border border-neutral-800 rounded'>
        Document List
      </div>

      <div className='flex-1 min-h-[8rem] mb-2 p-4 bg-neutral-900 border border-neutral-700 rounded'>
        Document Upload
      </div>
    </div>
  )
}