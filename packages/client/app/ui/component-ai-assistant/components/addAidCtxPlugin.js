// eslint-disable-next-line import/no-extraneous-dependencies
import { Plugin } from 'prosemirror-state'
import AidCtxRefsHolder from './AidCtxRefsHolder'

function addAidctxPlugin(setAidctx, tools) {
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
              // console.log(AidCtxRefsHolder.context)
              // aidctx && AidCtxRefsHolder.select(aidCtx)
              //   const aidctx = node.attrs?.dataset?.aidctx ?? selectedCtx

              //   const newAttrs = {
              //     ...node.attrs,
              //     dataset: { ...node.attrs.dataset, aidctx },
              //     ...(tools.brush.active && tools.dropper.data
              //       ? { class: tools.dropper.data }
              //       : {}),
              //   }

              //   try {
              //     tr.setNodeMarkup(nodePos, null, newAttrs)
              //     dispatch(tr)
              //   } catch (err) {
              //     console.warn(err)
              //   }
              console.log(aidCtx)
              setAidctx(aidCtx)
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
