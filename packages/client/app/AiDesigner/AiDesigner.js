import { capitalize, entries, isArray } from 'lodash'
import { safeId } from '../ui/component-ai-assistant/utils/helpers'
import { onEntries, safeCall } from '../ui/component-ai-assistant/utils/utils'
import { StateManager } from './StateManager'
import { SET } from '../ui/component-ai-assistant/utils/SetExtension'
import EventEmitter from './EventEmitter'
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

export default class AiDesigner extends StateManager {
  constructor() {
    super()
    this.mainContext = {
      aidctx: 'main',
      conversation: [],
    }
    this.context = []
    this.selected = ''
  }

  static select(aidctx, cb) {
    this.selected = this.getBy({ aidctx })
    safeCall(cb)(AiDesigner.selected)
    this.emit('select', this.selected)
  }

  static getBy(prop) {
    const [attr, value] = entries(prop).flat()
    const match = ctx => ctx[attr] === value
    return this.context?.find(match)
  }

  static onClassNames(method, classNames) {
    if (!this?.states?.view) return

    const { view } = this.states
    const { aidctx, node: domNode } = this.selected || {}
    const { tr, doc } = view.state

    const pos = findInPmDoc(doc, aidctx)?.pos

    if (pos === null || !domNode) return
    const resolvedPos = doc.resolve(pos)
    const pmNode = resolvedPos.node()

    const classes = isArray(classNames)
      ? classNames
      : classNames?.split(' ') ?? []

    const domClasses = SET(domNode?.className?.split(' ') || [])

    classes.forEach(domClasses[method]) // add, remove or toggle
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

  static get allInDom() {
    return [...document.querySelectorAll('[data-aidctx]')]
      .map(n => n.dataset.aidctx)
      .filter(Boolean)
  }

  static updateContext() {
    if (!this.states?.view?.docView) return
    const { view } = this.states
    view.state.doc.descendants((node, pos) => {
      if (node.attrs.dataset) {
        const currentAid = node?.attrs?.dataset?.aidctx || ''

        const allInDom = this.allInDom
        const aidsInCtx = [...allInDom, ...(currentAid || [])]

        const isDuplicated = aidsInCtx.filter(n => n === currentAid).length > 1

        const aidctx =
          currentAid && !isDuplicated ? currentAid : safeId('aid-ctx', allInDom)

        if (aidctx) {
          const tr = view.state.tr
          tr.setNodeMarkup(pos, null, { ...node.attrs, dataset: { aidctx } })
          view.dispatch(tr)
          !this.getBy({ aidctx }) && this.addToContext({ aidctx })
        }
      }
    })
    console.log('context updated')
  }

  static addToContext({ aidctx, node }) {
    const newContext = {
      aidctx,
      conversation: [],
      get node() {
        return document.querySelector(`[data-aidctx="${aidctx}"]`) || node
      },
      get tagName() {
        const node = document.querySelector(`[data-aidctx="${aidctx}"]`)
        return node.localName || node.tagName?.toLowerCase()
      },
    }
    this.context = [...(this.context || []), newContext]
    this.emit('addtocontext', this.context, newContext)
  }
}
