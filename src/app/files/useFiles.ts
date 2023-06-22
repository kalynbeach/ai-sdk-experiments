import { useState, useEffect } from 'react'

export function useFiles() {
  const [files, setFiles] = useState([])
  useEffect(() => {
    // ...
  }, [])
  return files
}