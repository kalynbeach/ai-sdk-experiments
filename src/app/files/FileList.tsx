import fs from 'fs/promises'
import path from 'path'

const FILE_DIRECTORY = path.resolve('src/data/pdf')

async function getFileNames() {
  const fileNames = await fs.readdir(FILE_DIRECTORY)
  const filteredFileNames = fileNames.filter(fileName => fileName !== '.DS_Store')
  console.log(`[getFileNames] filteredFileNames: `, filteredFileNames)
  return filteredFileNames
}

export default async function FileList() {
  const fileNames = await getFileNames()

  return (
    <div className='w-full h-full p-4'>
      <ul className='list-disc'>
        {
          fileNames.map((fileName, index) => (
            <li key={index} className=''>
              <span>{fileName}</span>
            </li>
          ))
        }
      </ul>
    </div>
  )
}