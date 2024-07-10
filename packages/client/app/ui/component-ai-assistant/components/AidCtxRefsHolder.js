import { safeCall, safeId } from '../utils'
/* This is for future use, to have it isolated from react
 We can pass the react state dispatchers to the handlers object by using setHandlers()
 And then safely call the handler on a at some point on the static methods */

// Another aproach will be to use private methods and export a singleton instance(maybe the way to go)

// Having this we can select the contexts and also store another values methods and logic from the designr react agnostic

// I've tested it with selection and i was able to generate the context on the waxSchema at buid time, and then update the state on the designer context

// having this we would only need the dataref aidctx to get the nodes in any dom

export default class AidCtxRefsHolder {
  constructor() {
    this.context = []
    this.mainContext = {}
    this.handlers = {}
    this.selected = {}
  }

  static createRef() {
    const currentCtx =
      this?.context?.length > 0
        ? this.context.map(ctx => ctx.dataRef)
        : ['aidctx-0']

    return safeId('aid-ctx', currentCtx)
  }

  static createMain(node) {
    if (this.mainContext.node)
      return console.warn(
        'Cannot create main context, already exists',
        this.mainContext,
      )

    const dataRef =
      node.id || [...node.classList].length > 0
        ? `.${[...node.classList].join('.')}`
        : this.createRef()

    const ctx = {
      node: dom => this.getNode(dataRef, dom),
      dataRef,
      history: [],
    }

    return ctx
  }

  static setHandlers(handlers) {
    this.handlers = handlers
  }

  static addContext(ref, customCallback) {
    const dataRef = ref && !this.context.includes(ref) ? ref : this.createRef()

    const ctx = {
      node: dom => this.getNode(dataRef, dom),
      dataRef,
      history: [],
    }

    // we can append the data-aidctx on one this cb:
    // will run on all nodes in wax schema and needs to be created with setHandlers()
    safeCall(this.handlers?.onAdd)(ctx)
    safeCall(customCallback)(ctx)

    console.log(ctx)

    this.context = [...(this?.context || []), ctx]
    return ctx
  }

  static getNode(dataRef, dom = document) {
    return dom.querySelector(`[data-aidctx="${dataRef}"`)
  }

  // we can pass eithr a node or the dataRef
  static getCtx(ref) {
    const existingRef = ctx =>
      ref instanceof HTMLElement ? ctx.node() === ref : ctx.dataRef === ref

    return this.context.find(existingRef)
  }

  static select(dataRef) {
    if (!this.getCtx(dataRef)) return console.warn(`Cannot select ${dataRef}`)
    safeCall(this.handlers?.onSelect)(this.getCtx(dataRef))
    this.selected = this.getCtx(dataRef)
    return console.warn(this.selected)
  }

  static updateCtx(ctx) {
    const context = ctx
    this.context = context
  }
}
