import { entries } from 'lodash'
import { safeId } from '../ui/component-ai-assistant/utils/helpers'
import { safeCall } from '../ui/component-ai-assistant/utils/utils'
import { StateManager } from './StateManager'
import { addClass, insertImageAfterNode } from './helpers/pmHelpers.js'
const defaultConfig = {
  gui: {
    showChatBubble: false,
    advancedTools: true,
  },
  editor: {
    contentEditable: true,
    enablePaste: true,
    displayStyles: true,
    enableSelection: true,
    selectionColor: {
      bg: 'var(--color-blue-alpha-2)',
      border: 'var(--color-blue-alpha-1)',
    },
  },
  chat: {
    historyMax: 6,
  },
  preview: {
    livePreview: true,
  },
}

class AidCtx {
  constructor({ aidctx, conversation }) {
    this.aidctx = aidctx
    this.conversation = conversation || []
  }
  get node() {
    return document.querySelector(`[data-aidctx="${this.aidctx}"]`)
  }

  get tagName() {
    const node = document.querySelector(`[data-aidctx="${this.aidctx}"]`)
    return node?.localName || node?.tagName?.toLowerCase()
  }

  get snippets() {
    const actions = {}
    const keys = ['add', 'remove', 'toggle']
    keys.forEach(k => (actions[k] = cls => addClass(k, cls, this)))
    return actions
  }
}

export default class AiDesigner extends StateManager {
  static config = defaultConfig

  constructor() {
    super()
    this.mainContext = {
      aidctx: 'main',
      conversation: [],
    }
    this.context = []
    this.selected = ''
  }

  static setConfig(config) {
    this.config = config
    this.emit('setconfig', this.config)
  }

  static updateConfig(cb) {
    this.setConfig(safeCall(cb)(this.config) ?? this.config)
    this.emit('updateconfig', newConfig, this.config)
  }

  static get snippets() {
    const actions = {}
    const keys = ['add', 'remove', 'toggle']
    keys.forEach(k => (actions[k] = cls => addClass(k, cls, this.selected)))
    return actions
  }

  static insertImage(imgAttrs) {
    insertImageAfterNode(imgAttrs)
    this.emit('insertimage', this, imgAttrs)
  }

  static get allInDom() {
    return [...document.querySelectorAll('[data-aidctx]')]
      .map(n => n.dataset.aidctx)
      .filter(Boolean)
  }

  static select(aidctx, options = {}) {
    if (!this.config.editor.enableSelection || !aidctx) return
    !this.getBy({ aidctx }) && AiDesigner.addToContext({ aidctx })
    const { getOnly } = options
    const foundInCtx = this.getBy({ aidctx })
    !getOnly && (this.selected = foundInCtx)
    this.emit('select', foundInCtx, this.context)
  }

  static getBy(prop) {
    const [attr, value] = entries(prop).flat()
    const match = ctx => ctx[attr] === value
    return this.context?.find(match)
  }

  static filterBy(prop, walk) {
    const [attr, value] = entries(prop).flat()
    const match = ctx => ctx[attr] === value
    const found = this.context?.filter(match)
    walk && found.forEach(safeCall(walk))
    return found
  }

  static updateContext(params) {
    if (!params?.docView && !this.states?.view?.docView) return
    const { view } = params ?? this.states

    view.state.doc.descendants(node => {
      if (node && !node.isText) {
        const aidctx = node?.attrs?.dataset?.aidctx

        if (aidctx) {
          !this.getBy({ aidctx }) && this.addToContext({ aidctx })
        }
      }
    })
    return this
  }

  static idGen(currentAid) {
    const aidsInCtx = [...this.allInDom, ...(currentAid || [])]
    const isDuplicated = aidsInCtx.filter(n => n === currentAid).length > 1
    const aidctx =
      currentAid && !isDuplicated
        ? currentAid
        : safeId('aid-ctx', this.allInDom)
    return aidctx
  }

  static addToContext({ aidctx }) {
    if (this.getBy({ aidctx })) return
    const newContext = new AidCtx({ aidctx })
    this.context = [...(this.context || []), newContext]
    this.emit('addtocontext', this.context, newContext)
  }
}
