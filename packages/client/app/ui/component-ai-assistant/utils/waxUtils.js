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
export default class WaxDesignerUtils {
  constructor() {
    this.states = {}
  }

  static setStates(cb) {
    const newStates = cb(this.states)
    this.states = newStates
  }
  static get allRefs() {
    return [...document.querySelectorAll('[data-aidctx]')]
      .map(node => node?.dataset?.aidctx)
      .filter(Boolean)
  }

  static addClass(ref, classNames) {
    this.states?.view && console.log(this.states)
    if (!this?.states?.view) return
    const { view } = this.states
    const pos = findNodeWithAttr(view.state.doc, ref)?.pos

    if (pos !== null) {
      const tr = view.state.tr
      const resolvedPos = view.state.doc.resolve(pos)
      let node = resolvedPos.node()

      const existingClasses = node.attrs.class
        ? new Set(node.attrs.class.split(' '))
        : new Set()
      classNames.forEach(cls => existingClasses.add(cls))
      const updatedClasses = Array.from(existingClasses).join(' ')

      console.log(node)
      tr.setNodeMarkup(pos, null, { ...node.attrs, class: updatedClasses })

      view.dispatch(tr)
    }
  }

  static addAidCtx() {
    if (!this.states?.view?.docView) return
    const { view } = this.states
    let contexts = view.docView.children
      .map(node => node?.node?.attrs?.dataset.aidctx)
      .filter(Boolean)

    console.log(contexts)
    view.state.doc.descendants((node, pos) => {
      node?.content && console.log(node.content)
      if (!node.attrs.dataset) return

      let aidctx = node?.attrs?.dataset?.aidctx
      console.log(aidctx)
      if (aidctx && contexts.filter(n => n === aidctx).length === 1)
        return console.log('exists')

      aidctx = safeId('aid-ctx', contexts)
      contexts.push(aidctx)

      const tr = view.state.tr

      tr.setNodeMarkup(pos, null, { ...node.attrs, dataset: { aidctx } })

      view.dispatch(tr)
      console.log(aidctx)
    })
  }
}
