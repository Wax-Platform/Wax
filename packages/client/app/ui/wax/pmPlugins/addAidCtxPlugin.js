// eslint-disable-next-line import/no-extraneous-dependencies
import { Plugin } from 'prosemirror-state'
import AiDesigner from '../../../AiDesigner/AiDesigner'

function addAidctxPlugin() {
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
          const aidCtx = attrs?.dataset?.aidctx

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
              const aidctx = node.attrs?.dataset?.aidctx
              //   const aidctx = node.attrs?.dataset?.aidctx ?? selectedCtx
              // console.log(aidCtx)
              AiDesigner.select(aidCtx || aidctx, console.log)
              // }
            }
          }

          return false
        },
      },
    },
  })
}

export default addAidctxPlugin