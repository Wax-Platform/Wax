import React, { useState } from 'react'

const useJsonFileReader = () => {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  const readJsonFile = file => {
    if (!file) {
      setError('No file selected')
      return
    }

    const reader = new FileReader()
    reader.onload = e => {
      try {
        const jsonData = JSON.parse(e.target.result)
        setData(jsonData)
      } catch (error) {
        setError(`Error parsing JSON: ${error.message}`)
      }
    }
    reader.onerror = () => setError('File reading error')
    reader.readAsText(file)
  }

  return [data, error, readJsonFile]
}

export default useJsonFileReader
