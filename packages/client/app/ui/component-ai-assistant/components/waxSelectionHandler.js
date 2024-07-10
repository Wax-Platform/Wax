const waxSelectionHandler =
  (
    getCtxBy,
    addToCtx,
    newCtx,
    setSelectedCtx,
    setSelectedNode,
    setMarkedSnippet,
    tools,
    updateTools,
  ) =>
  aidCtx => {
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

      tools.dropper.active && updateTools('dropper', { data: target.className })

      setSelectedNode(target)
      setSelectedCtx(ctx)
      setMarkedSnippet('')
    } else console.warn('Element is not selectable!')
  }

export default waxSelectionHandler
