import { entries, isArray } from 'lodash'
import { safeId } from './helpers'
import { onEntries, safeCall } from './utils'
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

function findInPmDoc(doc, ref) {
  let found
  doc.descendants((node, pos) => {
    if (node?.attrs?.dataset?.aidctx === ref) {
      found = { node, pos }
      return false
    }
  })
  return found
}
const setMethods = set => ({
  add: set.add,
  remove: set.delete,
  toggle: item => (set.has(item) ? set.delete(item) : set.add(item)),
})
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
    const { onSelect } = AiDesigner.handlers ?? {}

    this.selectedContext = this.getBy({ aidctx })
    safeCall(onSelect)(AiDesigner.selectedContext)
    safeCall(cb)(AiDesigner.selectedContext)
  }

  static updateSelected(props) {
    if (!this.selectedContext) return
    onEntries(props, (prop, val) => {
      this.selectedContext[prop] = val
    })
    safeCall(this?.handlers?.onUpdateSelected)(this.selectedContext)
  }

  static updateConversation(record) {
    this.updateSelected({ conversation: record })
  }

  static getBy(prop) {
    const [attr, value] = entries(prop).flat()
    const match = ctx => ctx[attr] === value
    return this.context?.find(match)
  }

  static onClassNames(method, classNames) {
    if (!this?.states?.view) return

    const { view } = this.states
    const { aidctx, node: domNode } = this.selectedContext || {}

    const pos = findInPmDoc(view.state.doc, aidctx)?.pos

    if (pos === null || !domNode()) return
    const tr = view.state.tr
    const resolvedPos = view.state.doc.resolve(pos)
    const pmNode = resolvedPos.node()

    const classes = isArray(classNames)
      ? classNames
      : classNames?.split(' ') ?? []

    const domClasses = new Set(domNode()?.className?.split(' ') || [])

    const onClasses = setMethods(domClasses)
    classes.forEach(onClasses[method]) // add, remove or toggle
    const updatedClasses = [...domClasses].join(' ')

    tr.setNodeMarkup(pos, null, {
      ...pmNode.attrs,
      dataset: { aidctx },
      class: updatedClasses,
    })

    view.dispatch(tr)
  }

  static get snippets() {
    return {
      add: cls => this.onClassNames('add', cls),
      remove: cls => this.onClassNames('remove', cls),
      toggle: cls => this.onClassNames('toggle', cls),
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
