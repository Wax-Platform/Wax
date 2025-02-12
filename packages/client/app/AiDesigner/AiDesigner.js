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
  constructor({ id, conversation }) {
    this.id = id
    this.conversation = conversation || []
  }
  get node() {
    return document.querySelector(`[data-id="${this.id}"]`)
  }

  get tagName() {
    const node = document.querySelector(`[data-id="${this.id}"]`)
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
      id: 'main',
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
    return [...document.querySelectorAll('[data-id]')]
      .map(n => n.dataset.id)
      .filter(Boolean)
  }

  static select(id, options = {}) {
    if (!this.config.editor.enableSelection || !id) return
    !this.getBy({ id }) && AiDesigner.addToContext({ id })
    const { getOnly } = options
    const foundInCtx = this.getBy({ id })
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
        const id = this.idGen(node?.attrs?.dataset?.id)

        if (id) {
          !this.getBy({ id }) && this.addToContext({ id })
        }
      }
    })
    return this
  }

  static idGen(currentAid) {
    const aidsInCtx = [...this.allInDom, ...([currentAid] || [])]
    const isDuplicated = aidsInCtx.filter(n => n === currentAid).length > 1
    const id = currentAid && !isDuplicated ? currentAid : uuid()
    return [id, id === currentAid]
  }

  static addToContext({ id }) {
    if (this.getBy({ id })) return
    const newContext = new AidCtx({ id })
    this.context = [...(this.context || []), newContext]
    this.emit('addtocontext', this.context, newContext)
  }
}
