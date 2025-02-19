import React, { createContext, useContext, useEffect, useState } from 'react'
import { useBool, useFlags } from './dataTypeHooks'
import AiDesigner from '../AiDesigner/AiDesigner'

const LayoutContext = createContext()

export const LayoutProvider = ({ children }) => {
  const showUserMenu = useBool({ start: true })

  const editors = useFlags({
    start: { wax: true, preview: false, code: false, images: false },
  })

  const userMenu = useFlags({
    start: {
      files: true,
      team: false,
      chat: false,
      snippetsManager: false,
      templateManager: false,
      images: false,
    },
    onImagesUpdate: v => {
      if (!v) return
      AiDesigner.addToContext({ id: 'images' })
      AiDesigner.select('images')
    },
    onTemplateManagerUpdate: v => {
      if (!v) return
      AiDesigner.select('aid-ctx-main')
    },
    onSnippetsManagerUpdate: v => {
      if (!v) return
      AiDesigner.select('aid-ctx-main')
    },
    config: { __others: false },
  })

  return (
    <LayoutContext.Provider
      value={{
        userMenu,
        editors,
        showUserMenu: showUserMenu.on,
        hideUserMenu: showUserMenu.off,
        userMenuOpen: showUserMenu.state,
      }}
    >
      {children}
    </LayoutContext.Provider>
  )
}

export const useLayout = () => {
  return useContext(LayoutContext)
}
