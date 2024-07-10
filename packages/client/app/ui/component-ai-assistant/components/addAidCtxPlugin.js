// eslint-disable-next-line import/no-extraneous-dependencies
import { Plugin } from 'prosemirror-state'

function addAidctxPlugin(selectedCtx, handleSelection, tools) {
  return new Plugin({
    props: {
      handleDOMEvents: {
        click(view, e) {
          e.preventDefault()
          e.stopPropagation()
          const { state, dispatch } = view
          const { tr } = state
          const n = e.target.pmViewDesc.node
          const { attrs } = n || {}
          const aidCtx = attrs?.dataset?.aidctx ?? selectedCtx

          const pos = view.posAtCoords({
            left: e.clientX,
            top: e.clientY,
          })

          if (pos) {
            let node = state.doc.nodeAt(pos.pos)
            let nodePos = pos.pos

            if (node && node.isText) {
              nodePos = state.doc.resolve(pos.pos).before()
              node = state.doc.nodeAt(nodePos)
            }

            const { selection } = state

            if (selection && !selection.empty) {
              const { $from } = selection
              const { $to } = selection
              const parentNode = $from.sameParent($to) ? $from.parent : null

              if (parentNode && parentNode.type.name !== 'text') {
                node = parentNode
                nodePos = $from.start() - 1
              }
            }

            if (node && !node.isText) {
              const aidctx = node.attrs?.dataset?.aidctx ?? selectedCtx

              const newAttrs = {
                ...node.attrs,
                dataset: { ...node.attrs.dataset, aidctx },
                ...(tools.brush.active && tools.dropper.data
                  ? { class: tools.dropper.data }
                  : {}),
              }

              try {
                tr.setNodeMarkup(nodePos, null, newAttrs)
                dispatch(tr)
              } catch (err) {
                console.warn(err)
              }

              handleSelection(aidCtx)
            }
          }

          return false
        },
      },
    },
  })
}

export default addAidctxPlugin