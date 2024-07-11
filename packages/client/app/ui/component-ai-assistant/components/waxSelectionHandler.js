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

  const selectNode = aidCtx => {
    const target = document.querySelector(`[data-aidctx="${aidCtx}"]`)
    if (target) {
      !getCtxBy('node', target) &&
        getCtxBy('dataRef', target.dataset.aidctx) &&
        // eslint-disable-next-line no-param-reassign
        (getCtxBy('dataRef', target.dataset.aidctx).node = target)

      const ctx =
        getCtxBy('node', target) ||
        getCtxBy('dataRef', target.dataset.aidctx) ||
        addToCtx(newCtx(target, null, {}, false))

      tools.dropper.active && updateTools('brush', { data: target.className })

      setSelectedNode(target)
      setSelectedCtx(ctx)
      setMarkedSnippet('')
      console.log(ctx.node)
    } else console.warn('Element is not selectable!')
  }

  return selectNode
}

export default useWaxSelectionHandler
