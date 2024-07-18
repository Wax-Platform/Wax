import { entries } from 'lodash'
import { safeId } from '../ui/component-ai-assistant/utils/helpers'
import { onEntries, safeCall } from '../ui/component-ai-assistant/utils/utils'
import { StateManager } from './StateManager'
import { addClass } from './helpers/pmHelpers.js'
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
  static config = defaultConfig

  static setConfig(config) {
    this.config = config
    this.emit('setconfig', config)
  }

  static updateConfig(newConfig) {
    onEntries(newConfig, (k, v) => (this.config[k] = v))
    this.emit('updateconfig', newConfig, this.config)
  }

  static get snippets() {
    const actions = {}
    const keys = ['add', 'remove', 'toggle']
    keys.forEach(k => (actions[k] = cls => addClass(k, cls)))
    return actions
  }

  static get allInDom() {
    return [...document.querySelectorAll('[data-aidctx]')]
      .map(n => n.dataset.aidctx)
      .filter(Boolean)
  }

  static select(aidctx, cb) {
    if (!this.getBy({ aidctx }) || !this.config.editor.enableSelection) return
    this.selected = this.getBy({ aidctx })
    safeCall(cb)(AiDesigner.selected)
    this.emit('select', this.selected)
  }

  static getBy(prop) {
    const [attr, value] = entries(prop).flat()
    const match = ctx => ctx[attr] === value
    return this.context?.find(match)
  }

  static updateContext(params) {
    if (!params && !this.states?.view?.docView) return
    const { view } = params ?? this.states

    view.state.doc.descendants((node, pos) => {
      if (node && !node.isText) {
        const currentAid = node?.attrs?.dataset?.aidctx || ''
        const aidctx = AiDesigner.idGen(currentAid)

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

  static idGen(currentAid) {
    const aidsInCtx = [...this.allInDom, ...(currentAid || [])]
    const isDuplicated = aidsInCtx.filter(n => n === currentAid).length > 1
    const aidctx =
      currentAid && !isDuplicated
        ? currentAid
        : safeId('aid-ctx', this.allInDom)
    return aidctx
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
        return node?.localName || node?.tagName?.toLowerCase()
      },
    }
    this.context = [...(this.context || []), newContext]
    this.emit('addtocontext', this.context, newContext)
  }
}
