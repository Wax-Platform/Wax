import React, { createContext, useMemo, useState } from 'react'
// We could use this cntext to simplify solutions for cases like this
export const GlobalContext = createContext()

export const GlobalContextProvider = ({ children }) => {
  const [filesToUpload, setFilesToUpload] = useState([])
  const [filesBeingUploaded, setFilesBeingUploaded] = useState([])

  const value = useMemo(
    () => ({
      filesToUpload,
      setFilesToUpload,
      filesBeingUploaded,
      setFilesBeingUploaded,
    }),
    [filesToUpload, filesBeingUploaded],
  )

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  )
}
