import { useContext } from 'react'
import { AiDesignerContext } from '../hooks/AiDesignerContext'

const useWaxSelectionHandler = () => {
  const {
    getCtxBy,
    addToCtx,
    newCtx,
    setSelectedCtx,
    setSelectedNode,
    setMarkedSnippet,
    tools,
    updateTools,
  } = useContext(AiDesignerContext)

  const selectNode = dataRef => {
    const node = document.querySelector(`[data-aidctx="${dataRef}"]`)
    if (node) {
      const ctx = getCtxBy({ dataRef }) || addToCtx({ node, dataRef })

      tools.dropper.active && updateTools('brush', { data: node.className })

      setSelectedNode(node)
      setSelectedCtx(ctx)
      setMarkedSnippet('')
      console.log(ctx.node)
    } else console.warn('Element is not selectable!')
  }

  return selectNode
}

export default useWaxSelectionHandler
