import { isFunction } from 'lodash'

export default class EventEmitter {
  static events = {}

  static on(eventName, listener, id = 'default') {
    if (!isFunction(listener)) return
    !this.events && (this.events = {})
    if (!this.events[eventName]) {
      this.events[eventName] = []
    }
    const eventWithID = this.events[eventName].find(e => e.id === id)
    !eventWithID
      ? this.events[eventName].push({ cb: listener, id })
      : (this.events[eventName][this.events[eventName].indexOf(eventWithID)] = {
          cb: listener,
          id,
        })
  }

  static emit(eventName, ...args) {
    console.log(`emmitting ${eventName}`, this.events[eventName])
    if (this.events[eventName]) {
      this.events[eventName].forEach(listener => listener.cb(...args))
    }
  }

  static removeListener(eventName, listener) {
    if (this.events[eventName]) {
      this.events[eventName] = this.events[eventName].filter(
        l => l !== listener,
      )
    }
  }

  static removeAllListeners(eventName) {
    if (this.events[eventName]) {
      delete this.events[eventName]
    }
  }
}
