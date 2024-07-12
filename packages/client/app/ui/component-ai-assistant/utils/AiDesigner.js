import { entries } from 'lodash'
import { safeId } from './helpers'
import { safeCall } from './utils'
function getAllDescendants(node) {
  let descendants = []

  if (!node?.children?.length) {
    return descendants
  }

  for (let child of node.children) {
    descendants.push(child)
    descendants = descendants.concat(getAllDescendants(child))
  }

  return descendants
}

function findNodeWithAttr(doc, ref) {
  let found
  doc.descendants((node, pos) => {
    if (node?.attrs?.dataset?.aidctx === ref) {
      found = { node, pos }
      return false
    }
  })
  return found
}
export default class AiDesigner {
  constructor() {
    this.mainContext = {
      aidctx: 'main',
    }
    this.context = []
    this.selectedContext = null
    this.states = {}
    this.handlers = {}
  }

  static setStates(cb) {
    const newStates = cb(this.states)
    this.states = newStates
  }

  static setHandlers(cb) {
    const newHandlers = safeCall(cb)(this.handlers)
    this.handlers = newHandlers || this.handlers
  }

  static select(aidctx, cb) {
    const { onSelect } = this.handlers ?? {}

    this.selectedContext = this.getBy({ aidctx })
    safeCall(onSelect)(AiDesigner.selectedContext)
    safeCall(cb)(AiDesigner.selectedContext)
  }

  static getBy(prop) {
    const [attr, value] = entries(prop).flat()
    const match = ctx => ctx[attr] === value
    return this.context?.find(match)
  }

  static addClass(aidCtx, classNames, toggle) {
    if (!this?.states?.view) return
    const aidctx = aidCtx || this?.selectedContext?.aidctx
    const domNodeClasses = document.querySelector(
      `[data-aidctx="${aidctx}"]`,
    )?.className
    const { view } = this.states
    const pos = findNodeWithAttr(view.state.doc, aidctx)?.pos

    if (pos !== null) {
      const tr = view.state.tr
      const resolvedPos = view.state.doc.resolve(pos)
      let node = resolvedPos.node()

      const existingClasses = domNodeClasses
        ? new Set(domNodeClasses.split(' '))
        : new Set()
      classNames.forEach(cls =>
        existingClasses.has(cls)
          ? existingClasses.delete(cls)
          : existingClasses.add(cls),
      )
      const updatedClasses = [...existingClasses].join(' ')

      console.log(node)
      tr.setNodeMarkup(pos, null, {
        ...node.attrs,
        dataset: { aidctx },
        class: updatedClasses,
      })

      view.dispatch(tr)
    }
  }

  static addAidCtx() {
    if (!this.states?.view?.docView) return
    const { view } = this.states
    view.state.doc.descendants((node, pos) => {
      if (node.attrs.dataset) {
        const contexts = new Set([
          ...view.docView.children
            .map(node => node?.node?.attrs?.dataset?.aidctx)
            .filter(Boolean),
          ...(AiDesigner.context?.map(ctx => ctx.aidctx) || []),
        ])
        const aidctx =
          node.attrs.dataset?.aidctx ?? safeId('aid-ctx', [...contexts])

        if (!this.getBy({ aidctx })) {
          const tr = view.state.tr
          tr.setNodeMarkup(pos, null, { ...node.attrs, dataset: { aidctx } })
          view.dispatch(tr)
          this.addToContext(aidctx, node, pos)
        }
        console.log(this.context)
        console.log(this.context.length === new Set(this.context))
      }
    })
  }

  static addToContext(aidctx, node, pos, cb) {
    const newContext = {
      aidctx,
      conversation: [],
      node: (scope = document) => {
        return scope.querySelector(`[data-aidctx="${aidctx}"]`)
      },
      pmNode: node,
      pmPos: pos,
    }
    this.context = [...(this.context || []), newContext]
  }
}
