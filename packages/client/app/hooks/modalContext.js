import React, { createContext, useState, useContext } from 'react'
import { useObject } from './dataTypeHooks'
const MODAL_EMPTY = { show: false, items: [], x: null, y: null }

const ModalContext = createContext()

export const ModalProvider = ({ children }) => {
  const modalState = useObject({
    start: MODAL_EMPTY,
  })

  return (
    <ModalContext.Provider value={{ modalState }}>
      {children}
    </ModalContext.Provider>
  )
}

// Create a custom hook to use the ModalContext
export const useModalContext = () => {
  return useContext(ModalContext)
}
