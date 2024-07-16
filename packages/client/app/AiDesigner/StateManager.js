import { safeCall } from '../ui/component-ai-assistant/utils/utils'
import EventEmitter from './EventEmitter'

export class StateManager extends EventEmitter {
  constructor() {
    super()
    this.states = {}
  }

  static setStates(cb) {
    const newStates = safeCall(cb)(this.states) || {}
    this.states = { ...this.states, ...newStates }
  }

  static setHandlers(cb) {
    const newHandlers = safeCall(cb)(this.handlers)
    this.handlers = newHandlers || this.handlers
  }
}
